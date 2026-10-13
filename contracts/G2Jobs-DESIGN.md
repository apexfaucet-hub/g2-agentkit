# G2 Jobs: an ERC-8183-readable job escrow that protects the agent who does the work

Draft, 13 Oct 2026. APEX Faucet.

## Why not use ERC-8183 as it is

ERC-8183 (Agentic Commerce, draft, Feb 2026) is a good minimal shape: a job with an escrowed budget, a provider who submits work, an evaluator who completes or rejects, and a refund after a deadline. The live deployment (Virtuals, `0x238E541B…`, Base and Arc) has run 81,776 jobs on Base. We read the last 1,000 on chain:

| Weakness | Evidence | What it costs |
|---|---|---|
| The client usually judges its own job | evaluator == client in 990 of 1,000 jobs | A client can receive the work, reject it and take its money back. The provider has no protection. |
| Silence pays the client | spec: a Submitted job past `expiredAt` is refunded to the client | If the evaluator never answers, delivered work goes unpaid. |
| No dispute path | spec: "reject/expire is final" | One bad evaluation cannot be appealed. |
| Only a hash on chain | `deliverable` is `bytes32` | Nobody can later show where the work was or that it matched the hash. |
| The live contract has an owner | UUPS proxy; admin sets the platform fee (5%) and can upgrade | Terms can change after a job starts. |

## What G2 Jobs changes

The same function names, arguments and events as ERC-8183, so 8183 tools and indexers can read every job. The behavior is stricter in four places, each stated in the contract and in the listing.

1. **No owner, no upgrade.** Token, fee (in basis points) and fee recipient are fixed at deployment. Nobody can change them later.

2. **Review window, then the provider is paid.** Each job states a `reviewSeconds` at creation (1 hour to 7 days). After `submit`, the evaluator has that long to `complete` or `reject`. If it stays silent, anyone may call `settle(jobId)` and the provider is paid as if completed. `claimRefund` only applies to a job that was never submitted.

3. **Kill fee on rejection after delivery.** Each job states a `killFeeBps` at creation (0 to 50%). If the evaluator rejects after the work was submitted, that share goes to the provider, and the client gets the rest back. The provider sees the kill fee before accepting the job. This makes "take the work and reject" cost something, without forcing payment for bad work.

4. **A pointer to the work.** `submit` also accepts an optional `deliverableUri` (an https or ipfs link), emitted next to the hash. The job then carries a replayable receipt: the description, the deliverable hash and link, the evaluator, its reason hash, the payout or refund amounts, the deadline and the final state.

Unchanged from ERC-8183: a single provider per job (set at creation or later by the client), budget agreed in Open, `fund(jobId, expectedBudget)` with front-running protection, the evaluator may be the client or a third party (for example an agent with an ERC-8004 reputation), and the platform fee taken only on payment, never on a refund.

## Money rules (stated so a review can check them)

- Balance of the contract >= the sum of budgets of all Funded and Submitted jobs, at all times.
- Every job ends in exactly one terminal state. Its budget leaves the contract exactly once: to provider + fee (Completed or settled), to client + kill fee to provider (Rejected after submit), or to client (Rejected before submit, Expired).
- The fee is never taken on a refund or on the client's part of a kill-fee split.
- `claimRefund` and `settle` cannot be blocked: no hooks in v1, so nothing external runs during them.
- Only USDC (an ERC-20 with no transfer fee); a token that delivers less than was sent is refused.

## Out of scope for v1

Hooks, multi-provider bounties, arbitration beyond the kill fee and the neutral-evaluator option, gasless (ERC-2771). Each can come later as an extension without changing jobs already created.

## Where it runs

Base (USDC `0x8335…2913`) first, then Arc (USDC at `0x3600…`). The AgentKit plugin `@apexfaucet/g2-agentkit` gets the `g2job_*` actions, and our agent can act as a provider (it answers) and as a neutral evaluator (paid per evaluation, its record public through ERC-8004).
