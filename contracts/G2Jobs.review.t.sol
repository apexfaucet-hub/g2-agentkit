// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// Review proofs for G2Jobs (2026-10-13). Each test PASSES when the reviewed behaviour is as described in its name.
import {Test, Vm} from "forge-std/Test.sol";
import {G2Jobs} from "./G2Jobs.sol";
import {USDCx} from "./G2Jobs.t.sol";

contract G2JobsReviewTest is Test {
    G2Jobs g; USDCx usdc;
    address constant CLIENT = address(0xC1);
    address constant PROVIDER = address(0xB2);
    address constant EVAL = address(0xE3);
    address constant FEE = address(0xFEE);
    uint256 constant B = 1_000_000;

    // ERC-8183 reference layout (AgenticCommerce.getJob)
    struct RefJob { uint256 id; address client; address provider; address evaluator; string description;
        uint256 budget; uint256 expiredAt; uint8 status; address hook; }

    function setUp() public {
        usdc = new USDCx();
        g = new G2Jobs(address(usdc), 200, FEE);
        usdc.mint(CLIENT, 100 * B);
        vm.prank(CLIENT); usdc.approve(address(g), type(uint256).max);
    }

    function _funded(address evaluator, uint16 kill) internal returns (uint256 id) {
        vm.prank(CLIENT); id = g.createJobWithTerms(PROVIDER, evaluator, block.timestamp + 2 days, "x", 1 days, kill);
        vm.prank(PROVIDER); g.setBudget(id, B, "");
        vm.prank(CLIENT); g.fund(id, B, "");
    }

    // F1: client-as-evaluator rejects while Funded (e.g. after receiving the work off-chain, or ahead of submit): kill fee bypassed.
    // test_F1_clientEvaluator_rejects_before_submit_kill_fee_bypassed: proved a pre-review fault, fixed 13 Oct (see G2Jobs.t.sol review-fix tests)

    // F2: zero-effort submit in the same block as fund captures the kill fee (or 98% if the evaluator is late).
    // test_F2_garbage_submit_same_block_earns_kill_fee: proved a pre-review fault, fixed 13 Oct (see G2Jobs.t.sol review-fix tests)

    // F3: getJob cannot be decoded with the ERC-8183 reference ABI.
    // test_F3_getJob_not_8183_abi_compatible: proved a pre-review fault, fixed 13 Oct (see G2Jobs.t.sol review-fix tests)
    function decodeRef(bytes memory ret) external pure returns (RefJob memory) { return abi.decode(ret, (RefJob)); }

    // F4: settle emits JobCompleted naming the evaluator, who never acted.
    function test_F4_settle_attributes_completion_to_silent_evaluator() public {
        uint256 id = _funded(EVAL, 0);
        vm.prank(PROVIDER); g.submit(id, bytes32(0), "");
        vm.warp(block.timestamp + 1 days);
        vm.recordLogs();
        vm.prank(address(0xBEEF)); g.settle(id);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bool seen;
        for (uint256 i; i < logs.length; i++) {
            if (logs[i].topics[0] == G2Jobs.JobCompleted.selector) {
                assertEq(address(uint160(uint256(logs[i].topics[2]))), EVAL); seen = true;
            }
        }
        assertTrue(seen);
    }

    // F5: evaluator == provider is accepted; provider self-approves garbage for 98%.
    // test_F5_evaluator_equals_provider_allowed: proved a pre-review fault, fixed 13 Oct (see G2Jobs.t.sol review-fix tests)

    // F6: expiredAt up to uint48.max; silent third-party evaluator + idle provider = client escrow locked for millennia.
    // test_F6_unbounded_expiry_locks_client: proved a pre-review fault, fixed 13 Oct (see G2Jobs.t.sol review-fix tests)

    // F7: client lowers the budget the provider proposed and funds it in one go.
    function test_F7_client_can_reprice_before_fund() public {
        vm.prank(CLIENT); uint256 id = g.createJob(PROVIDER, EVAL, block.timestamp + 2 days, "x", address(0));
        vm.prank(PROVIDER); g.setBudget(id, B, "");
        vm.prank(CLIENT); g.setBudget(id, 1, "");
        vm.prank(CLIENT); g.fund(id, 1, "");
        assertEq(g.getJob(id).budget, 1);
    }

    // Boundaries are disjoint: reject < T <= settle; submit < expiredAt <= claimRefund.
    function test_boundaries_disjoint() public {
        uint256 id = _funded(EVAL, 1000);
        vm.prank(PROVIDER); g.submit(id, bytes32(0), "");
        uint256 t = g.settleableAt(id);
        vm.warp(t - 1);
        vm.expectRevert(G2Jobs.ReviewWindowOpen.selector); g.settle(id);
        vm.warp(t);
        vm.prank(EVAL); vm.expectRevert(G2Jobs.ReviewWindowOver.selector); g.reject(id, bytes32(0), "");
        g.settle(id);
        uint256 id2 = _funded(EVAL, 0);
        uint256 e = g.getJob(id2).expiredAt;
        vm.warp(e - 1); vm.expectRevert(G2Jobs.NotExpiredYet.selector); g.claimRefund(id2);
        vm.warp(e);
        vm.prank(PROVIDER); vm.expectRevert(G2Jobs.Expired_.selector); g.submit(id2, bytes32(0), "");
        g.claimRefund(id2);
        assertEq(usdc.balanceOf(address(g)), g.totalEscrowed() + g.totalCredits());
    }

    // 63/64 griefing: no gas limit makes settle succeed while diverting a payout into credits (mock token).
    function test_gas_grief_cannot_force_credit() public {
        uint256 id = _funded(EVAL, 0);
        vm.prank(PROVIDER); g.submit(id, bytes32(0), "");
        vm.warp(block.timestamp + 1 days);
        uint256 snap = vm.snapshotState();
        uint256 succeeded;
        for (uint256 gl = 20_000; gl < 400_000; gl += 1_000) {
            vm.revertToState(snap);
            (bool ok,) = address(g).call{gas: gl}(abi.encodeWithSignature("settle(uint256)", id));
            if (ok) { succeeded++; assertEq(g.totalCredits(), 0, "payout diverted to credit"); }
        }
        assertGt(succeeded, 0);
    }
}
