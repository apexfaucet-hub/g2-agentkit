/** A G2 registry deployment. Bounties are an ERC-20 (USDC) pulled with transferFrom. */
export interface G2Deployment {
    /** Human name of the chain. */
    chain: string;
    /** G2RegistryUSDC address. */
    registry: `0x${string}`;
    /** Bounty token (USDC). */
    token: `0x${string}`;
    /** Token decimals (USDC: 6). */
    decimals: number;
    /** Block explorer base URL for transactions. */
    explorerTx: string;
}
/**
 * Deployments keyed by EVM chain id (string, as in AgentKit's Network.chainId).
 * Base mainnet, deployed 13 Oct 2026, source verified on Sourcify (exact match).
 */
export declare const G2_DEPLOYMENTS: Record<string, G2Deployment>;
export declare const ERC20_ABI: readonly [{
    readonly type: "function";
    readonly name: "balanceOf";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "a";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "allowance";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "o";
        readonly type: "address";
    }, {
        readonly name: "s";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly type: "function";
    readonly name: "approve";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "s";
        readonly type: "address";
    }, {
        readonly name: "v";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}];
/** Largest text the registry stores (query text or answer), in bytes. */
export declare const MAX_TEXT_BYTES = 1000;
