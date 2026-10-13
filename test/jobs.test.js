// End to end for G2 Jobs: anvil (chain 8453), the real G2Jobs bytecode, a 6-decimal mock USDC, two agents through AgentKit's own
// ViemWalletProvider. Run: node --test test/jobs.test.js (needs Foundry's anvil)
require("reflect-metadata");
const realFetch = globalThis.fetch;
globalThis.fetch = (url, opts) => (String(url).startsWith("https://cca-lite.coinbase.com") ? Promise.resolve(new Response("{}", { status: 200 })) : realFetch(url, opts));
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs"), path = require("node:path");
const { createWalletClient, createPublicClient, http, parseUnits } = require("viem");
const { mnemonicToAccount } = require("viem/accounts");
const { ViemWalletProvider } = require("@coinbase/agentkit");
const { g2JobsActionProvider } = require("../dist");

const art = (n) => JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", n + ".json"), "utf8"));
const PORT = 19545 + Math.floor(Math.random() * 300), RPC = "http://127.0.0.1:" + PORT;
const chain = { id: 8453, name: "local", nativeCurrency: { name: "E", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } };
const A = [0, 1, 2, 3].map((i) => mnemonicToAccount("test test test test test test test test test test test junk", { addressIndex: i }));
let anvil, pub, usdc, U, p, client, provider, FEE;
const wc = (a) => createWalletClient({ chain, account: a, transport: http(RPC) });
const bal = (a) => pub.readContract({ address: usdc, abi: U.abi, functionName: "balanceOf", args: [a] });
const idOf = (s) => (s.match(/job (\d+)/) || [])[1];
const warp = async (s) => { await pub.request({ method: "evm_increaseTime", params: [s] }); await pub.request({ method: "evm_mine", params: [] }); };

before(async () => {
  anvil = spawn(path.join(process.env.HOME, ".foundry/bin/anvil"), ["--port", String(PORT), "--chain-id", "8453", "--silent"], { stdio: "ignore" });
  pub = createPublicClient({ chain, transport: http(RPC) });
  for (let i = 0; i < 50; i++) { try { await pub.getBlockNumber(); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  U = art("MockUSDC"); const G = art("G2Jobs");
  const dep = async (a, args = []) => (await pub.waitForTransactionReceipt({ hash: await wc(A[0]).deployContract({ abi: a.abi, bytecode: a.bytecode.object, args }) })).contractAddress;
  usdc = await dep(U); FEE = A[3].address;
  const jobs = await dep(G, [usdc, 200, FEE]);
  await pub.waitForTransactionReceipt({ hash: await wc(A[0]).writeContract({ address: usdc, abi: U.abi, functionName: "mint", args: [A[1].address, parseUnits("10", 6)] }) });
  p = g2JobsActionProvider({ deployments: { "8453": { chain: "local", contract: jobs, explorerTx: "local:" } }, maxBudgetUsdc: "2" });
  client = new ViemWalletProvider(wc(A[1])); provider = new ViemWalletProvider(wc(A[2]));
});
after(() => anvil && anvil.kill());

async function funded(extra = {}) {
  const r = await p.create(client, Object.assign({ description: "Summarise https://example.com in 3 lines", provider: A[2].address, expiresInHours: 24, reviewHours: 24, killFeePercent: 0 }, extra));
  const id = idOf(r); assert.ok(id, r);
  assert.match(await p.setBudget(provider, { jobId: id, amountUsdc: "1" }), /Budget of job/);
  assert.match(await p.fund(client, { jobId: id }), /Funded job/);
  return id;
}

test("complete: provider paid minus 2%", async () => {
  const id = await funded();
  assert.match(await p.submit(provider, { jobId: id, deliverable: "Three lines...", uri: "https://apexfaucet.xyz/a/1" }), /Submitted job/);
  const b0 = await bal(A[2].address);
  assert.match(await p.complete(client, { jobId: id, reason: "good" }), /Completed job/);
  assert.equal((await bal(A[2].address)) - b0, 980000n);
  assert.equal(JSON.parse(await p.readJob(client, { jobId: id })).status, "Completed");
});

test("silent evaluator: provider settles after the review window", async () => {
  const id = await funded({ reviewHours: 2 });
  await p.submit(provider, { jobId: id, deliverable: "done" });
  assert.match(await p.settle(provider, { jobId: id }), /Error settling/);   // window still open
  await warp(2 * 3600);
  const b0 = await bal(A[2].address);
  assert.match(await p.settle(provider, { jobId: id }), /Settled job/);
  assert.equal((await bal(A[2].address)) - b0, 980000n);
});

test("reject after delivery: provider keeps the kill fee", async () => {
  const id = await funded({ killFeePercent: 25 });
  await p.submit(provider, { jobId: id, deliverable: "done" });
  const c0 = await bal(A[1].address), p0 = await bal(A[2].address);
  assert.match(await p.reject(client, { jobId: id, reason: "not what I asked" }), /Rejected job/);
  assert.equal((await bal(A[2].address)) - p0, 250000n);
  assert.equal((await bal(A[1].address)) - c0, 750000n);
});

test("never submitted: refund after the deadline; guards", async () => {
  const id = await funded({ expiresInHours: 1 });
  assert.match(await p.claimRefund(client, { jobId: id }), /Error/);
  await warp(3601);
  const c0 = await bal(A[1].address);
  assert.match(await p.claimRefund(client, { jobId: id }), /Refunded job/);
  assert.equal((await bal(A[1].address)) - c0, 1000000n);
  const r = await p.create(client, { description: "too big", provider: A[2].address, expiresInHours: 24, reviewHours: 24, killFeePercent: 0 });
  assert.match(await p.setBudget(client, { jobId: idOf(r), amountUsdc: "3" }), /above this agent's limit/);
});
