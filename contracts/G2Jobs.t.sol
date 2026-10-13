// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, Vm} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {G2Jobs} from "./G2Jobs.sol";

contract USDCx is ERC20 {
    mapping(address => bool) public blacklisted;
    constructor() ERC20("USD Coin", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 a) external { _mint(to, a); }
    function setBlacklist(address a, bool b) external { blacklisted[a] = b; }
    function _update(address from, address to, uint256 v) internal override {
        require(!blacklisted[from] && !blacklisted[to], "blacklisted");
        super._update(from, to, v);
    }
}
contract FeeTok is ERC20 {
    constructor() ERC20("Fee", "FEE") {}
    function mint(address to, uint256 a) external { _mint(to, a); }
    function _update(address from, address to, uint256 v) internal override {
        if (from != address(0) && to != address(0)) { super._update(from, address(0xdead), v / 100); v -= v / 100; }
        super._update(from, to, v);
    }
}

struct Ref8183Job { uint256 id; address client; address provider; address evaluator; string description; uint256 budget; uint256 expiredAt; uint8 status; address hook; }

contract G2JobsTest is Test {
    G2Jobs g; USDCx usdc;
    address constant CLIENT = address(0xC1);
    address constant PROVIDER = address(0xB2);
    address constant EVAL = address(0xE3);
    address constant FEE = address(0xFEE);
    address constant OTHER = address(0x0D);
    uint256 constant B = 1_000_000; // 1 USDC
    uint16 constant FEE_BP = 200;   // 2%

    function setUp() public {
        usdc = new USDCx();
        g = new G2Jobs(address(usdc), FEE_BP, FEE);
        usdc.mint(CLIENT, 100 * B);
        vm.prank(CLIENT); usdc.approve(address(g), type(uint256).max);
    }

    function _job(address evaluator, uint32 review, uint16 kill) internal returns (uint256 id) {
        vm.prank(CLIENT);
        id = g.createJobWithTerms(PROVIDER, evaluator, block.timestamp + 2 days, "summarise this page", review, kill);
        vm.prank(PROVIDER); g.setBudget(id, B, "");
        vm.prank(CLIENT); g.fund(id, B, "");
    }
    function _submitted(address evaluator, uint32 review, uint16 kill) internal returns (uint256 id) {
        id = _job(evaluator, review, kill);
        vm.prank(PROVIDER); g.submit(id, keccak256("answer"), "");
    }
    function _status(uint256 id) internal view returns (G2Jobs.JobStatus) { return g.getJob(id).status; }
    function _inv() internal view { assertEq(usdc.balanceOf(address(g)), g.totalEscrowed() + g.totalCredits(), "balance == escrow + credits"); }

    // ── constructor ──
    function test_ctor() public {
        vm.expectRevert(G2Jobs.ZeroAddress.selector); new G2Jobs(address(0), FEE_BP, FEE);
        vm.expectRevert(G2Jobs.ZeroAddress.selector); new G2Jobs(address(usdc), FEE_BP, address(0));
        vm.expectRevert(G2Jobs.BadTerms.selector); new G2Jobs(address(usdc), 1001, FEE);
    }

    // ── create ──
    function test_create_8183_defaults_and_hook_refused() public {
        vm.prank(CLIENT); uint256 id = g.createJob(PROVIDER, EVAL, block.timestamp + 1 days, "x", address(0));
        G2Jobs.Job8183 memory j = g.getJob(id);
        assertEq(j.client, CLIENT); assertEq(j.id, id); assertEq(j.hook, address(0));
        (uint32 review, uint16 kill, uint256 sub) = g.getTerms(id);
        assertEq(review, 1 days); assertEq(kill, 0); assertEq(sub, 0);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.HooksNotSupported.selector); g.createJob(PROVIDER, EVAL, block.timestamp + 1 days, "x", address(0x1234));
    }
    function test_create_guards() public {
        vm.startPrank(CLIENT);
        vm.expectRevert(G2Jobs.ZeroAddress.selector); g.createJob(PROVIDER, address(0), block.timestamp + 1 days, "x", address(0));
        vm.expectRevert(G2Jobs.ExpiryTooShort.selector); g.createJob(PROVIDER, EVAL, block.timestamp + 60, "x", address(0));
        vm.expectRevert(G2Jobs.BadTerms.selector); g.createJobWithTerms(PROVIDER, EVAL, block.timestamp + 1 days, "x", 59 minutes, 0);
        vm.expectRevert(G2Jobs.BadTerms.selector); g.createJobWithTerms(PROVIDER, EVAL, block.timestamp + 1 days, "x", 8 days, 0);
        vm.expectRevert(G2Jobs.BadTerms.selector); g.createJobWithTerms(PROVIDER, EVAL, block.timestamp + 1 days, "x", 1 days, 2501);
        vm.expectRevert(G2Jobs.ExpiryTooShort.selector); g.createJob(PROVIDER, EVAL, block.timestamp + 366 days, "x", address(0));
        vm.expectRevert(G2Jobs.EvaluatorIsProvider.selector); g.createJob(PROVIDER, PROVIDER, block.timestamp + 1 days, "x", address(0));
        vm.expectRevert(G2Jobs.TooLong.selector); g.createJob(PROVIDER, EVAL, block.timestamp + 1 days, string(new bytes(4001)), address(0));
        vm.stopPrank();
    }

    // ── negotiate ──
    function test_setProvider_rules() public {
        vm.prank(CLIENT); uint256 id = g.createJob(address(0), EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(OTHER); vm.expectRevert(G2Jobs.Unauthorized.selector); g.setProvider(id, PROVIDER);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.ZeroAddress.selector); g.setProvider(id, address(0));
        vm.prank(CLIENT); g.setProvider(id, PROVIDER);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.WrongStatus.selector); g.setProvider(id, OTHER);
    }
    function test_setBudget_client_or_provider_only() public {
        vm.prank(CLIENT); uint256 id = g.createJob(PROVIDER, EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(CLIENT); g.setBudget(id, 5, "");
        vm.prank(PROVIDER); g.setBudget(id, B, "");
        vm.prank(OTHER); vm.expectRevert(G2Jobs.Unauthorized.selector); g.setBudget(id, 1, "");
        assertEq(g.getJob(id).budget, B);
    }

    // ── fund ──
    function test_fund_guards() public {
        vm.prank(CLIENT); uint256 id = g.createJob(address(0), EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.ProviderNotSet.selector); g.fund(id, 0, "");
        vm.prank(CLIENT); g.setProvider(id, PROVIDER);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.ZeroBudget.selector); g.fund(id, 0, "");
        vm.prank(PROVIDER); g.setBudget(id, B, "");
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.BudgetMismatch.selector); g.fund(id, B - 1, "");   // front-running guard
        vm.prank(OTHER); vm.expectRevert(G2Jobs.Unauthorized.selector); g.fund(id, B, "");
        vm.prank(CLIENT); g.fund(id, B, "");
        assertEq(uint8(_status(id)), uint8(G2Jobs.JobStatus.Funded)); assertEq(g.totalEscrowed(), B); _inv();
        vm.prank(PROVIDER); vm.expectRevert(G2Jobs.WrongStatus.selector); g.setBudget(id, 2 * B, "");   // price frozen once funded
    }
    function test_fund_after_expiry_refused() public {
        vm.prank(CLIENT); uint256 id = g.createJob(PROVIDER, EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(PROVIDER); g.setBudget(id, B, "");
        vm.warp(block.timestamp + 1 days);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.Expired_.selector); g.fund(id, B, "");
    }
    function test_fee_on_transfer_refused() public {
        FeeTok ft = new FeeTok(); G2Jobs g2 = new G2Jobs(address(ft), FEE_BP, FEE);
        ft.mint(CLIENT, 10 * B); vm.prank(CLIENT); ft.approve(address(g2), type(uint256).max);
        vm.prank(CLIENT); uint256 id = g2.createJob(PROVIDER, EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(PROVIDER); g2.setBudget(id, B, "");
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.FeeOnTransferToken.selector); g2.fund(id, B, "");
    }

    // ── happy path: complete ──
    function test_complete_pays_provider_minus_fee() public {
        uint256 id = _submitted(EVAL, 1 days, 2000);
        vm.prank(OTHER); vm.expectRevert(G2Jobs.Unauthorized.selector); g.complete(id, bytes32(0), "");
        vm.prank(EVAL); g.complete(id, keccak256("good"), "");
        assertEq(usdc.balanceOf(PROVIDER), B * 98 / 100); assertEq(usdc.balanceOf(FEE), B * 2 / 100);
        assertEq(uint8(_status(id)), uint8(G2Jobs.JobStatus.Completed)); _inv();
        vm.prank(EVAL); vm.expectRevert(G2Jobs.WrongStatus.selector); g.complete(id, bytes32(0), "");
    }

    // ── fix 2: silent evaluator → provider paid ──
    function test_settle_after_review_window_pays_provider() public {
        uint256 id = _submitted(CLIENT, 2 hours, 0);
        vm.prank(OTHER); vm.expectRevert(G2Jobs.ReviewWindowOpen.selector); g.settle(id);
        vm.warp(block.timestamp + 2 hours);
        vm.prank(OTHER); g.settle(id);   // anyone
        assertEq(usdc.balanceOf(PROVIDER), B * 98 / 100); _inv();
    }
    function test_submitted_job_never_refunded_by_expiry() public {
        uint256 id = _submitted(CLIENT, 1 days, 0);
        vm.warp(block.timestamp + 10 days);
        vm.expectRevert(G2Jobs.WrongStatus.selector); g.claimRefund(id);
        g.settle(id); assertEq(usdc.balanceOf(PROVIDER), B * 98 / 100);
    }

    // ── fix 3: kill fee on rejection after delivery ──
    function test_reject_after_submit_pays_kill_fee() public {
        uint256 bal0 = usdc.balanceOf(CLIENT);
        uint256 id = _submitted(CLIENT, 1 days, 2500);   // client is its own evaluator: the case 990 of 1,000 live jobs have
        vm.prank(CLIENT); g.reject(id, keccak256("not good"), "");
        assertEq(usdc.balanceOf(PROVIDER), B / 4); assertEq(usdc.balanceOf(CLIENT), bal0 - B / 4);
        assertEq(usdc.balanceOf(FEE), 0);   // no platform fee on a rejection
        assertEq(uint8(_status(id)), uint8(G2Jobs.JobStatus.Rejected)); _inv();
    }
    function test_reject_after_review_window_refused() public {
        uint256 id = _submitted(EVAL, 1 hours, 1000);
        vm.warp(block.timestamp + 1 hours);
        vm.prank(EVAL); vm.expectRevert(G2Jobs.ReviewWindowOver.selector); g.reject(id, bytes32(0), "");
    }
    function test_reject_funded_full_refund_and_open_by_client() public {
        uint256 bal0 = usdc.balanceOf(CLIENT);
        uint256 id = _job(EVAL, 1 days, 2500);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.Unauthorized.selector); g.reject(id, bytes32(0), "");   // client cannot pull back once funded
        vm.prank(EVAL); g.reject(id, bytes32(0), "");
        assertEq(usdc.balanceOf(CLIENT), bal0); assertEq(usdc.balanceOf(PROVIDER), 0); _inv();
        vm.prank(CLIENT); uint256 id2 = g.createJob(PROVIDER, EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(EVAL); vm.expectRevert(G2Jobs.Unauthorized.selector); g.reject(id2, bytes32(0), "");
        vm.prank(CLIENT); g.reject(id2, bytes32(0), "");
    }

    // ── expiry ──
    function test_claimRefund_funded_never_submitted() public {
        uint256 bal0 = usdc.balanceOf(CLIENT);
        uint256 id = _job(EVAL, 1 days, 0);
        vm.expectRevert(G2Jobs.NotExpiredYet.selector); g.claimRefund(id);
        vm.warp(block.timestamp + 2 days);
        vm.prank(PROVIDER); vm.expectRevert(G2Jobs.Expired_.selector); g.submit(id, bytes32(0), "");   // no late submission
        vm.prank(OTHER); g.claimRefund(id);
        assertEq(usdc.balanceOf(CLIENT), bal0); assertEq(uint8(_status(id)), uint8(G2Jobs.JobStatus.Expired)); _inv();
    }

    // ── fix 4: link to the work ──
    function test_submitWithUri() public {
        uint256 id = _job(EVAL, 1 days, 0);
        vm.prank(PROVIDER); vm.expectRevert(G2Jobs.TooLong.selector); g.submitWithUri(id, bytes32(0), string(new bytes(513)));
        vm.prank(OTHER); vm.expectRevert(G2Jobs.Unauthorized.selector); g.submitWithUri(id, bytes32(0), "https://x");
        vm.prank(PROVIDER); g.submitWithUri(id, keccak256("a"), "https://apexfaucet.xyz/answers/1");
        assertEq(g.settleableAt(id), block.timestamp + 1 days);
    }

    // ── blacklisted party never locks the other side ──
    function test_blacklisted_provider_credit_then_withdraw() public {
        uint256 id = _submitted(EVAL, 1 days, 0);
        usdc.setBlacklist(PROVIDER, true);
        vm.prank(EVAL); g.complete(id, bytes32(0), "");   // does not revert
        assertEq(g.credits(PROVIDER), B * 98 / 100); assertEq(usdc.balanceOf(FEE), B * 2 / 100); _inv();
        vm.prank(PROVIDER); vm.expectRevert(); g.withdraw();   // still blacklisted
        usdc.setBlacklist(PROVIDER, false);
        vm.prank(PROVIDER); g.withdraw();
        assertEq(usdc.balanceOf(PROVIDER), B * 98 / 100); assertEq(g.totalCredits(), 0); _inv();
        vm.prank(PROVIDER); vm.expectRevert(G2Jobs.NothingToWithdraw.selector); g.withdraw();
    }
    function test_blacklisted_client_refund_credited() public {
        uint256 id = _job(EVAL, 1 days, 0);
        usdc.setBlacklist(CLIENT, true);
        vm.warp(block.timestamp + 2 days);
        g.claimRefund(id);
        assertEq(g.credits(CLIENT), B); _inv();
    }

    // ── fuzz: every unit leaves exactly once; balance == escrow + credits ──
    function testFuzz_lifecycle(uint96 budget, uint16 kill, uint8 path, uint32 review) public {
        budget = uint96(bound(budget, 1, 1e14)); kill = uint16(bound(kill, 0, 2500)); review = uint32(bound(review, 1 hours, 7 days));
        usdc.mint(CLIENT, budget);
        uint256 c0 = usdc.balanceOf(CLIENT);
        vm.prank(CLIENT); uint256 id = g.createJobWithTerms(PROVIDER, EVAL, block.timestamp + 30 days, "f", review, kill);
        vm.prank(CLIENT); g.setBudget(id, budget, "");
        vm.prank(CLIENT); g.fund(id, budget, "");
        _inv();
        path = path % 5;
        if (path == 0) { vm.prank(EVAL); g.reject(id, bytes32(0), ""); }
        else if (path == 4) { vm.warp(block.timestamp + 31 days); g.claimRefund(id); }
        else {
            vm.prank(PROVIDER); g.submit(id, bytes32(0), "");
            if (path == 1) { vm.prank(EVAL); g.complete(id, bytes32(0), ""); }
            else if (path == 2) { vm.warp(block.timestamp + review); g.settle(id); }
            else { vm.prank(EVAL); g.reject(id, bytes32(0), ""); }
        }
        _inv();
        assertEq(g.totalEscrowed(), 0);
        assertEq(usdc.balanceOf(CLIENT) + usdc.balanceOf(PROVIDER) + usdc.balanceOf(FEE), c0, "nothing created or lost");
    }

    // ── review fixes 13 Oct ──
    function test_client_evaluator_cannot_reject_funded() public {
        uint256 bal0 = usdc.balanceOf(CLIENT);
        uint256 id = _job(CLIENT, 1 days, 2500);
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.ClientEvaluatorMustWait.selector); g.reject(id, bytes32(0), "");
        vm.warp(block.timestamp + 2 days); g.claimRefund(id);
        assertEq(usdc.balanceOf(CLIENT), bal0); _inv();
    }
    function test_setProvider_cannot_be_evaluator() public {
        vm.prank(CLIENT); uint256 id = g.createJob(address(0), EVAL, block.timestamp + 1 days, "x", address(0));
        vm.prank(CLIENT); vm.expectRevert(G2Jobs.EvaluatorIsProvider.selector); g.setProvider(id, EVAL);
    }
    function test_settle_marks_timeout() public {
        uint256 id = _submitted(EVAL, 1 hours, 0);
        vm.warp(block.timestamp + 1 hours);
        vm.recordLogs(); g.settle(id);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 sig = keccak256("JobCompleted(uint256,address,bytes32)"); bool seen;
        for (uint256 i = 0; i < logs.length; i++) if (logs[i].topics[0] == sig) { assertEq(abi.decode(logs[i].data, (bytes32)), g.TIMEOUT_SETTLE()); seen = true; }
        assertTrue(seen);
    }
    function test_8183_reference_layout_and_aliases() public {
        uint256 id = _job(EVAL, 1 days, 0);
        (bool ok, bytes memory ret) = address(g).staticcall(abi.encodeWithSignature("getJob(uint256)", id));
        assertTrue(ok);
        // decoded with the ERC-8183 reference struct, as an 8183 tool would
        Ref8183Job memory r = abi.decode(ret, (Ref8183Job));
        assertEq(r.id, id); assertEq(r.client, CLIENT); assertEq(r.provider, PROVIDER); assertEq(r.evaluator, EVAL);
        assertEq(r.description, "summarise this page"); assertEq(r.budget, B); assertGt(r.expiredAt, block.timestamp); assertEq(r.status, 1); assertEq(r.hook, address(0));
        (uint256 jid,,,,,,,,) = g.jobs(id); assertEq(jid, id);
        assertEq(g.platformTreasury(), FEE); assertEq(g.evaluatorFeeBP(), 0);
        assertEq(g.getJob(999).id, 0);
    }
}
