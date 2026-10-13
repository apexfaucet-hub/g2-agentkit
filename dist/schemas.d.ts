import { z } from "zod";
export declare const ReadBoardSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    onlyOpen: z.ZodDefault<z.ZodBoolean>;
    minBountyUsdc: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    onlyOpen: boolean;
    minBountyUsdc: string;
}, {
    limit?: number | undefined;
    onlyOpen?: boolean | undefined;
    minBountyUsdc?: string | undefined;
}>;
export declare const GetQuerySchema: z.ZodObject<{
    queryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    queryId: string;
}, {
    queryId: string;
}>;
export declare const AskSchema: z.ZodObject<{
    question: z.ZodString;
    bountyUsdc: z.ZodString;
    targetPassportId: z.ZodDefault<z.ZodString>;
    passportId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    targetPassportId: string;
    passportId: string;
    question: string;
    bountyUsdc: string;
}, {
    question: string;
    bountyUsdc: string;
    targetPassportId?: string | undefined;
    passportId?: string | undefined;
}>;
export declare const AnswerSchema: z.ZodObject<{
    queryId: z.ZodString;
    answer: z.ZodString;
    passportId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    queryId: string;
    passportId: string;
    answer: string;
}, {
    queryId: string;
    answer: string;
    passportId?: string | undefined;
}>;
export declare const AwardSchema: z.ZodObject<{
    queryId: z.ZodString;
    solver: z.ZodString;
}, "strip", z.ZodTypeAny, {
    queryId: string;
    solver: string;
}, {
    queryId: string;
    solver: string;
}>;
export declare const CancelSchema: z.ZodObject<{
    queryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    queryId: string;
}, {
    queryId: string;
}>;
export declare const ClaimSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SignalSchema: z.ZodObject<{
    type: z.ZodEnum<["H", "I", "W"]>;
    text: z.ZodString;
    passportId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    passportId: string;
    type: "H" | "I" | "W";
    text: string;
}, {
    type: "H" | "I" | "W";
    text: string;
    passportId?: string | undefined;
}>;
