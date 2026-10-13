// Local test of core/base/g2-base-responder.js (TEST mode): anvil chain 8453, test keys, the real registry bytecode.
const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs"), path = require("node:path");
const { createWalletClient, createPublicClient, http, parseUnits, toHex } = require("viem");
const { mnemonicToAccount } = require("viem/accounts");
const art = (n) => JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", n + ".json"), "utf8"));
const PORT = 19777, RPC = "http://127.0.0.1:" + PORT, DIR = process.argv[2];
const chain = { id: 8453, name: "local", nativeCurrency: { name: "E", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } };
const A = [0, 1, 2].map((i) => mnemonicToAccount("test test test test test test test test test test test junk", { addressIndex: i }));
const anvil = spawn(path.join(process.env.HOME, ".foundry/bin/anvil"), ["--port", String(PORT), "--chain-id", "8453", "--silent"], { stdio: "ignore" });
const pub = createPublicClient({ chain, transport: http(RPC) });
const w = (a) => createWalletClient({ chain, account: a, transport: http(RPC) });
const tx = async (wc, address, abi, functionName, args) => { const h = await wc.writeContract({ address, abi, functionName, args }); await pub.waitForTransactionReceipt({ hash: h }); };
async function deploy(wc, a, args = []) { const h = await wc.deployContract({ abi: a.abi, bytecode: a.bytecode.object, args }); return (await pub.waitForTransactionReceipt({ hash: h })).contractAddress; }
(async () => {
  for (let i = 0; i < 50; i++) { try { await pub.getBlockNumber(); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  const U = art("MockUSDC"), R = art("MockRegistryU"), G = art("G2RegistryUSDC");
  const usdc = await deploy(w(A[0]), U), reg = await deploy(w(A[0]), R);
  const g2 = await deploy(w(A[0]), G, [usdc, 10000, reg, 604800, A[0].address, A[0].address]);
  await tx(w(A[0]), usdc, U.abi, "mint", [A[1].address, parseUnits("5", 6)]);
  await tx(w(A[0]), reg, R.abi, "setOwner", [88292n, A[2].address]);   // the responder (test index 2) owns 88292
  await tx(w(A[1]), usdc, U.abi, "approve", [g2, parseUnits("5", 6)]);
  const ask = (pkt, amt) => tx(w(A[1]), g2, G.abi, "postQuery", [toHex(pkt), parseUnits(amt, 6), 0n]);
  await ask("G2|Q|0|88292|What does " + A[1].address + " hold?", "0.05");   // answered from chain data
  await ask("G2|Q|0|88292|cheap question", "0.01");                          // below the 0.02 minimum: skipped
  await ask("G2|Q|0|0|open question for anyone", "0.05");                     // not directed to us: ignored
  await ask("G2|Q|0|5|for agent 5 only", "0.05");                             // another agent: ignored
  const before = await pub.readContract({ address: usdc, abi: U.abi, functionName: "balanceOf", args: [A[2].address] });
  const out = execFileSync("node", ["/home/claudeuser/core/base/g2-base-responder.js", "once"], { env: Object.assign({}, process.env, { G2B_TEST: "1", G2B_RPC: RPC, G2B_REG: g2, G2B_USDC: usdc, G2B_DIR: DIR }), encoding: "utf8", timeout: 120000 });
  console.log(out.trim());
  const after = await pub.readContract({ address: usdc, abi: U.abi, functionName: "balanceOf", args: [A[2].address] });
  console.log("responder earned", Number(after - before) / 1e6, "USDC (expect 0.048)");
  const st = JSON.parse(fs.readFileSync(DIR + "/state.json", "utf8"));
  console.log("state next", st.next, "done", Object.values(st.done).map((v) => (v.startsWith("0x") ? "answered" : v)).join(","));
  const ids = await Promise.all([0, 1].map((i) => pub.readContract({ address: g2, abi: G.abi, functionName: "queryIds", args: [BigInt(i)] })));
  const q0 = await pub.readContract({ address: g2, abi: G.abi, functionName: "getQuery", args: [ids[0]] });
  console.log("q0 settled", q0.settled);
  anvil.kill(); process.exit(after - before === 48000n ? 0 : 1);
})().catch((e) => { console.error(e.message); anvil.kill(); process.exit(1); });
