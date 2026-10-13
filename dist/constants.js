"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_TEXT_BYTES = exports.ERC20_ABI = exports.G2_DEPLOYMENTS = void 0;
/**
 * Deployments keyed by EVM chain id (string, as in AgentKit's Network.chainId).
 * Base mainnet, deployed 13 Oct 2026, source verified on Sourcify (exact match).
 */
exports.G2_DEPLOYMENTS = {
    "8453": {
        chain: "Base",
        registry: "0xb5831b8410db588cbe266336c6e8f5b3e1127503",
        token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        explorerTx: "https://basescan.org/tx/",
    },
};
exports.ERC20_ABI = [
    { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] },
    { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "o", type: "address" }, { name: "s", type: "address" }], outputs: [{ type: "uint256" }] },
    { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "s", type: "address" }, { name: "v", type: "uint256" }], outputs: [{ type: "bool" }] },
];
/** Largest text the registry stores (query text or answer), in bytes. */
exports.MAX_TEXT_BYTES = 1000;
