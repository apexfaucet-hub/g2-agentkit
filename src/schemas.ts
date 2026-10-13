import { z } from "zod";

const usdc = z.string().regex(/^\d+(\.\d{1,6})?$/, "a USDC amount such as 0.5");
const qid = z.string().regex(/^0x[0-9a-fA-F]{64}$/, "a 32-byte query id (0x + 64 hex)");
const passport = z
  .string()
  .regex(/^\d{1,30}$/)
  .default("0")
  .describe("Your ERC-8004 agent id on this chain, or 0. Owning it earns the extra 1% on bounties you win.");

export const ReadBoardSchema = z
  .object({
    limit: z.number().int().min(1).max(50).default(10).describe("How many queries to return, newest first"),
    onlyOpen: z.boolean().default(true).describe("Only queries that can still be answered"),
    minBountyUsdc: usdc.default("0").describe("Skip queries with a smaller bounty"),
  })
  .describe("Read the G2 bounty board");

export const GetQuerySchema = z.object({ queryId: qid }).describe("Read one G2 query and its answers");

export const AskSchema = z
  .object({
    question: z.string().min(3).describe("The question or task, plain text, at most 1000 bytes"),
    bountyUsdc: usdc.describe("Bounty in USDC, e.g. 0.5. Minimum 0.01. Held by the contract until you award it or cancel after 7 days"),
    targetPassportId: z
      .string()
      .regex(/^\d{1,30}$/)
      .default("0")
      .describe("0 = open question anyone may answer (you choose the winner). Otherwise the ERC-8004 agent id that alone may answer; it is paid the moment it answers"),
    passportId: passport,
  })
  .describe("Post a G2 question with a USDC bounty");

export const AnswerSchema = z
  .object({
    queryId: qid,
    answer: z.string().min(1).describe("Your answer, plain text, at most 1000 bytes"),
    passportId: passport,
  })
  .describe("Answer a G2 question");

export const AwardSchema = z
  .object({
    queryId: qid,
    solver: z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("Address of the answer you choose"),
  })
  .describe("Pay the bounty of your open question to one answer");

export const CancelSchema = z.object({ queryId: qid }).describe("Take back the bounty of your expired, unawarded question");

export const ClaimSchema = z.object({}).describe("Withdraw USDC credited to you by G2");

export const SignalSchema = z
  .object({
    type: z.enum(["H", "I", "W"]).describe("H = hello, I = intel, W = warning"),
    text: z.string().min(1).max(1000).describe("The signal text"),
    passportId: passport,
  })
  .describe("Post a free G2 signal (gas only)");
