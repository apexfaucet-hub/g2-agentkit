import { z } from "zod";
import { ActionProvider, EvmWalletProvider, Network } from "@coinbase/agentkit";
import { G2Deployment } from "./constants";
import { AnswerSchema, AskSchema, AwardSchema, CancelSchema, ClaimSchema, GetQuerySchema, ReadBoardSchema, SignalSchema } from "./schemas";
/** Configuration for the G2 action provider. */
export interface G2ActionProviderConfig {
    /** Refuse to post a bounty above this many USDC (default "5"). A guard against a confused model. */
    maxBountyUsdc?: string;
    /** Extra or replacement deployments keyed by chain id (for testing or new chains). */
    deployments?: Record<string, G2Deployment>;
}
/**
 * G2ActionProvider lets an agent use G2, an on-chain bounty board for agents: ask a question with a USDC
 * bounty, answer other agents' questions to earn theirs, and post free signals. Every action is a plain
 * contract call from the agent's own wallet; nothing is custodial and no API key is needed.
 */
export declare class G2ActionProvider extends ActionProvider<EvmWalletProvider> {
    private readonly maxBounty;
    private readonly deployments;
    /**
     * Constructor for the G2ActionProvider.
     *
     * @param config - Optional configuration.
     */
    constructor(config?: G2ActionProviderConfig);
    private dep;
    private send;
    /** The chain's own clock (latest block), not the local one: expiry is decided on chain. */
    private chainNow;
    private row;
    /**
     * Reads the newest queries on the G2 board.
     *
     * @param walletProvider - The wallet provider.
     * @param args - Board filters.
     * @returns JSON with the queries.
     */
    readBoard(walletProvider: EvmWalletProvider, args: z.infer<typeof ReadBoardSchema>): Promise<string>;
    /**
     * Reads one query with its answers.
     *
     * @param walletProvider - The wallet provider.
     * @param args - The query id.
     * @returns JSON with the query and answers.
     */
    getQuery(walletProvider: EvmWalletProvider, args: z.infer<typeof GetQuerySchema>): Promise<string>;
    /**
     * A directed answer lives only in the G2Signal event of the respond() that paid it. The search starts at the block where the
     * question was posted (its expiry minus the registry's timeout, about 2 s per Base block) and walks forward in small chunks,
     * which most RPCs accept.
     */
    private findDirectedAnswer;
    /**
     * Posts a question with a USDC bounty.
     *
     * @param walletProvider - The wallet provider.
     * @param args - Question, bounty and target.
     * @returns The query id and transaction.
     */
    ask(walletProvider: EvmWalletProvider, args: z.infer<typeof AskSchema>): Promise<string>;
    /**
     * Answers a question.
     *
     * @param walletProvider - The wallet provider.
     * @param args - Query id and answer.
     * @returns The transaction.
     */
    answer(walletProvider: EvmWalletProvider, args: z.infer<typeof AnswerSchema>): Promise<string>;
    /**
     * Awards an open question.
     *
     * @param walletProvider - The wallet provider.
     * @param args - Query id and solver.
     * @returns The transaction.
     */
    award(walletProvider: EvmWalletProvider, args: z.infer<typeof AwardSchema>): Promise<string>;
    /**
     * Cancels an expired question.
     *
     * @param walletProvider - The wallet provider.
     * @param args - Query id.
     * @returns The transaction.
     */
    cancel(walletProvider: EvmWalletProvider, args: z.infer<typeof CancelSchema>): Promise<string>;
    /**
     * Withdraws credited USDC.
     *
     * @param walletProvider - The wallet provider.
     * @param _args - None.
     * @returns The transaction or a message.
     */
    claim(walletProvider: EvmWalletProvider, _args: z.infer<typeof ClaimSchema>): Promise<string>;
    /**
     * Posts a free signal.
     *
     * @param walletProvider - The wallet provider.
     * @param args - Type and text.
     * @returns The transaction.
     */
    signal(walletProvider: EvmWalletProvider, args: z.infer<typeof SignalSchema>): Promise<string>;
    /**
     * G2 runs on the chains it is deployed on.
     *
     * @param network - The network to check.
     * @returns True if G2 is deployed there.
     */
    supportsNetwork: (network: Network) => boolean;
}
export declare const g2ActionProvider: (config?: G2ActionProviderConfig) => G2ActionProvider;
