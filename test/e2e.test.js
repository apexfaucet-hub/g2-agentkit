// End to end: a local chain (anvil, chain id 8453), the real G2RegistryUSDC bytecode, a 6-decimal mock USDC and a
// mock ERC-8004 registry, driven through AgentKit's own ViemWalletProvider by two agents. Run: npm test
require("reflect-metadata");
// AgentKit's wallet provider reports usage to Coinbase analytics and throws unhandled when that call fails.
// The test chain is local, so those reports are answered here and never leave the machine.
const realFetch = globalThis.fetch;
globalThis.fetch = (url, opts) => (String(url).startsWith("https://cca-lite.coinbase.com") ? Promise.resolve(new Response("{}", { status: 200 })) : realFetch(url, opts));
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { createWalletClient, createPublicClient, http, encodeDeployData, parseUnits } = require("viem");
const { ViemWalletProvider } = require("@coinbase/agentkit");
const { g2ActionProvider } = require("../dist");

const OUT = path.join(__dirname, "../../arc-g2/out");
const art = (f, n) => JSON.parse(fs.readFileSync(path.join(OUT, f, n + ".json"), "utf8"));
const PORT = 18545 + Math.floor(Math.random() * 1000);
const RPC = `http://127.0.0.1:${PORT}`;
const chain = { id: 8453, name: "Base (local)", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } };
// anvil's default test accounts, derived from its public test mnemonic (they hold nothing on any real chain)
const { mnemonicToAccount } = require("viem/accounts");
const MN = "test test test test test test test test test test test junk";
const K = [0, 1, 2].map((i) => mnemonicToAccount(MN, { addressIndex: i }));
let anvil, pub, deployer, dep, asker, solver, other, p, ids;

async function deploy(wc, a, args = []) {
  const hash = await wc.deployContract({ abi: a.abi, bytecode: a.bytecode.object, args });
  return (await pub.waitForTransactionReceipt({ hash })).contractAddress;
}
const tx = async (wc, address, abi, functionName, args) => pub.waitForTransactionReceipt({ hash: await wc.writeContract({ address, abi, functionName, args }) });

before(async () => {
  anvil = spawn(path.join(process.env.HOME, ".foundry/bin/anvil"), ["--port", String(PORT), "--chain-id", "8453", "--silent"], { stdio: "ignore" });
  pub = createPublicClient({ chain, transport: http(RPC) });
  for (let i = 0; i < 50; i++) { try { await pub.getBlockNumber(); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  const accts = K;
  deployer = createWalletClient({ chain, account: accts[0], transport: http(RPC) });
  const usdcA = art("G2RegistryUSDC.t.sol", "MockUSDC"), regA = art("G2RegistryUSDC.t.sol", "MockRegistryU"), g2A = art("G2RegistryUSDC.sol", "G2RegistryUSDC");
  const usdc = await deploy(deployer, usdcA), reg = await deploy(deployer, regA);
  const g2 = await deploy(deployer, g2A, [usdc, 10000, reg, 3600, accts[0].address, accts[0].address]);
  dep = { "8453": { chain: "Base (local)", registry: g2, token: usdc, decimals: 6, explorerTx: "local:" } };
  for (const a of accts.slice(1)) await tx(deployer, usdc, usdcA.abi, "mint", [a.address, parseUnits("10", 6)]);
  await tx(deployer, reg, regA.abi, "setOwner", [7n, accts[2].address]);   // the solver owns ERC-8004 agent #7
  const wp = (acct) => new ViemWalletProvider(createWalletClient({ chain, account: acct, transport: http(RPC) }));
  asker = wp(K[1]); solver = wp(K[2]);
  other = createWalletClient({ chain, account: accts[1], transport: http(RPC) });
  p = g2ActionProvider({ deployments: dep, maxBountyUsdc: "2" });
  ids = { usdc, usdcAbi: usdcA.abi, accts };
});
after(() => anvil && anvil.kill());

const bal = (a) => pub.readContract({ address: ids.usdc, abi: ids.usdcAbi, functionName: "balanceOf", args: [a] });
const qidOf = (s) => (s.match(/queryId: (0x[0-9a-f]{64})/) || [])[1];

test("network support follows the deployments", () => {
  assert.equal(p.supportsNetwork({ protocolFamily: "evm", chainId: "8453" }), true);
  assert.equal(p.supportsNetwork({ protocolFamily: "evm", chainId: "1" }), false);
});

test("open question: ask, read, answer, award, claim", async () => {
  const before = await bal(ids.accts[1].address);
  const r = await p.ask(asker, { question: "Which Base pool has the deepest USDC/WETH liquidity?", bountyUsdc: "0.5", targetPassportId: "0", passportId: "0" });
  const q = qidOf(r);
  assert.ok(q, r);
  assert.equal(before - (await bal(ids.accts[1].address)), parseUnits("0.5", 6));
  const board = JSON.parse(await p.readBoard(solver, { limit: 10, onlyOpen: true, minBountyUsdc: "0" }));
  assert.equal(board.queries.length, 1);
  assert.equal(board.queries[0].text, "Which Base pool has the deepest USDC/WETH liquidity?");
  assert.equal(board.queries[0].bountyUsdc, "0.5");
  assert.equal(board.queries[0].kind, "open");
  assert.match(await p.answer(solver, { queryId: q, answer: "Aerodrome Slipstream 0.05%", passportId: "7" }), /Answer recorded/);
  assert.match(await p.answer(asker, { queryId: q, answer: "self", passportId: "0" }), /you posted this question/);
  const got = JSON.parse(await p.getQuery(asker, { queryId: q }));
  assert.equal(got.answerList.length, 1);
  assert.equal(got.answerList[0].text, "Aerodrome Slipstream 0.05%");
  assert.match(await p.award(asker, { queryId: q, solver: got.answerList[0].solver }), /Awarded/);
  const sb = await bal(ids.accts[2].address);
  assert.match(await p.claim(solver, {}), /Claimed 0.48 USDC/);   // 96%: the solver owns agent #7
  assert.equal((await bal(ids.accts[2].address)) - sb, 480000n);
  assert.match(await p.claim(solver, {}), /Nothing to claim/);
});

test("directed question pays at once and only the target may answer", async () => {
  const r = await p.ask(asker, { question: "Agent 7: is token X sellable?", bountyUsdc: "1", targetPassportId: "7", passportId: "0" });
  const q = qidOf(r);
  const sb = await bal(ids.accts[2].address);
  assert.match(await p.answer(solver, { queryId: q, answer: "yes, 1.2% round trip", passportId: "7" }), /Answered and paid/);
  assert.equal((await bal(ids.accts[2].address)) - sb, 960000n);
  const r2 = await p.ask(asker, { question: "Agent 9 only", bountyUsdc: "0.01", targetPassportId: "9", passportId: "0" });
  assert.match(await p.answer(solver, { queryId: qidOf(r2), answer: "me", passportId: "0" }), /only the owner of ERC-8004 agent 9/);
});

test("guards: limit, minimum, balance", async () => {
  assert.match(await p.ask(asker, { question: "too big", bountyUsdc: "2.5", targetPassportId: "0", passportId: "0" }), /above this agent's limit/);
  assert.match(await p.ask(asker, { question: "too small", bountyUsdc: "0.001", targetPassportId: "0", passportId: "0" }), /minimum bounty is 0.01/);
  const big = new ViemWalletProvider(createWalletClient({ chain, account: K[0], transport: http(RPC) }));
  assert.match(await p.ask(big, { question: "no funds", bountyUsdc: "1", targetPassportId: "0", passportId: "0" }), /you hold 0 USDC/);
});

test("expired question: cancel returns the bounty, answers refused", async () => {
  const r = await p.ask(asker, { question: "Will expire", bountyUsdc: "0.2", targetPassportId: "0", passportId: "0" });
  const q = qidOf(r);
  const b0 = await bal(ids.accts[1].address);
  assert.match(await p.cancel(asker, { queryId: q }), /Error cancelling/);   // not expired yet
  await pub.request({ method: "evm_increaseTime", params: [3601] });
  await pub.request({ method: "evm_mine", params: [] });
  assert.match(await p.answer(solver, { queryId: q, answer: "late", passportId: "0" }), /question is closed/);
  assert.match(await p.cancel(asker, { queryId: q }), /Cancelled/);
  assert.equal((await bal(ids.accts[1].address)) - b0, 200000n);
  const open = JSON.parse(await p.readBoard(solver, { limit: 10, onlyOpen: true, minBountyUsdc: "0" }));
  assert.equal(open.queries.length, 0);
  const all = JSON.parse(await p.readBoard(solver, { limit: 10, onlyOpen: false, minBountyUsdc: "0" }));
  assert.equal(all.totalQueries, 4);
});

test("signal", async () => {
  assert.match(await p.signal(solver, { type: "H", text: "agent 7: I answer Base liquidity questions", passportId: "7" }), /Posted G2 H signal/);
});
