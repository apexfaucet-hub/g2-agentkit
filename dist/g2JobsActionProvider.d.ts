import { z } from "zod";
import { ActionProvider, EvmWalletProvider, Network } from "@coinbase/agentkit";
import { Hex } from "viem";
export interface G2JobsDeployment {
    chain: string;
    contract: Hex;
    explorerTx: string;
}
/**
 * G2 Jobs: an ERC-8183-readable job escrow (same functions and events as ERC-8183 Agentic Commerce) that protects the agent
 * doing the work: no owner, a review window that pays the provider if the evaluator stays silent, and an optional kill fee
 * when delivered work is rejected. Filled in at deployment.
 */
export declare const G2_JOBS_DEPLOYMENTS: Record<string, G2JobsDeployment>;
export declare const G2JobCreateSchema: z.ZodObject<{
    description: z.ZodString;
    provider: z.ZodOptional<z.ZodString>;
    evaluator: z.ZodOptional<z.ZodString>;
    expiresInHours: z.ZodDefault<z.ZodNumber>;
    reviewHours: z.ZodDefault<z.ZodNumber>;
    killFeePercent: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    expiresInHours: number;
    reviewHours: number;
    killFeePercent: number;
    provider?: string | undefined;
    evaluator?: string | undefined;
}, {
    description: string;
    provider?: string | undefined;
    evaluator?: string | undefined;
    expiresInHours?: number | undefined;
    reviewHours?: number | undefined;
    killFeePercent?: number | undefined;
}>;
export declare const G2JobProviderSchema: z.ZodObject<{
    jobId: z.ZodString;
    provider: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    provider: string;
}, {
    jobId: string;
    provider: string;
}>;
export declare const G2JobBudgetSchema: z.ZodObject<{
    jobId: z.ZodString;
    amountUsdc: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    amountUsdc: string;
}, {
    jobId: string;
    amountUsdc: string;
}>;
export declare const G2JobIdSchema: z.ZodObject<{
    jobId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    jobId: string;
}, {
    jobId: string;
}>;
export declare const G2JobSubmitSchema: z.ZodObject<{
    jobId: z.ZodString;
    deliverable: z.ZodString;
    uri: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    jobId: string;
    deliverable: string;
    uri?: string | undefined;
}, {
    jobId: string;
    deliverable: string;
    uri?: string | undefined;
}>;
export declare const G2JobDecideSchema: z.ZodObject<{
    jobId: z.ZodString;
    reason: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    jobId: string;
}, {
    jobId: string;
    reason?: string | undefined;
}>;
export declare class G2JobsActionProvider extends ActionProvider<EvmWalletProvider> {
    private readonly deployments;
    private readonly maxBudget;
    constructor(config?: {
        maxBudgetUsdc?: string;
        deployments?: Record<string, G2JobsDeployment>;
    });
    private dep;
    private token;
    private send;
    private job;
    private hash;
    create(w: EvmWalletProvider, a: z.infer<typeof G2JobCreateSchema>): Promise<string>;
    setProvider(w: EvmWalletProvider, a: z.infer<typeof G2JobProviderSchema>): Promise<string>;
    setBudget(w: EvmWalletProvider, a: z.infer<typeof G2JobBudgetSchema>): Promise<string>;
    fund(w: EvmWalletProvider, a: z.infer<typeof G2JobIdSchema>): Promise<string>;
    submit(w: EvmWalletProvider, a: z.infer<typeof G2JobSubmitSchema>): Promise<string>;
    complete(w: EvmWalletProvider, a: z.infer<typeof G2JobDecideSchema>): Promise<string>;
    reject(w: EvmWalletProvider, a: z.infer<typeof G2JobDecideSchema>): Promise<string>;
    settle(w: EvmWalletProvider, a: z.infer<typeof G2JobIdSchema>): Promise<string>;
    claimRefund(w: EvmWalletProvider, a: z.infer<typeof G2JobIdSchema>): Promise<string>;
    withdraw(w: EvmWalletProvider): Promise<string>;
    readJob(w: EvmWalletProvider, a: z.infer<typeof G2JobIdSchema>): Promise<string>;
    supportsNetwork: (network: Network) => boolean;
}
export declare const g2JobsActionProvider: (config?: {
    maxBudgetUsdc?: string;
    deployments?: Record<string, G2JobsDeployment>;
}) => G2JobsActionProvider;
