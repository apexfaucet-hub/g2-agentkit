// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, Vm} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {G2RegistryUSDC} from "../contracts/G2RegistryUSDC.sol";

contract MockRegistryU {
    mapping(uint256 => address) private _owners;
    function setOwner(uint256 id, address who) external { _owners[id] = who; }
    function ownerOf(uint256 id) external view returns (address) { return _owners[id]; }
}

contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 a) external { _mint(to, a); }
}

/// Burns 1% of every transfer: the registry must refuse it.
contract FeeToken is ERC20 {
    constructor() ERC20("Fee", "FEE") {}
    function mint(address to, uint256 a) external { _mint(to, a); }
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) { uint256 fee = value / 100; super._update(from, address(0xdead), fee); value -= fee; }
        super._update(from, to, value);
    }
}

contract G2RegistryUSDCTest is Test {
    G2RegistryUSDC r;
    MockRegistryU  reg;
    MockUSDC       usdc;

    address constant FEE = address(0xFEE1);
    address constant TRE = address(0xFEE2);
    address constant POSTER = address(0xA001);
    address constant SOLVER = address(0xA002);
    address constant OTHER  = address(0xA003);
    uint256 constant BOUNTY = 1_000_000;   // 1 USDC (6 decimals)
    uint48  constant TIMEOUT = 7 days;
    uint256 constant SOLVER_PASSPORT = 42;
    uint256 constant TARGET_PASSPORT = 99;

    bytes constant PKT_Q     = bytes("G2|Q|0|0|open question");
    bytes constant PKT_Q_DIR = bytes("G2|Q|0|99|directed question");
    bytes constant PKT_A     = bytes("G2|A|0|done");
    bytes constant PKT_A_VER = bytes("G2|A|42|done");

    function setUp() public {
        reg  = new MockRegistryU();
        usdc = new MockUSDC();
        r    = new G2RegistryUSDC(address(usdc), 10_000, address(reg), TIMEOUT, FEE, TRE);
        usdc.mint(POSTER, 1_000_000_000);
        vm.prank(POSTER); usdc.approve(address(r), type(uint256).max);
    }

    function _post(bytes memory pkt, uint256 bounty, uint256 tip) internal returns (bytes32 qid) {
        vm.recordLogs();
        vm.prank(POSTER);
        r.postQuery(pkt, uint96(bounty), uint96(tip));
        Vm.Log[] memory logs = vm.getRecordedLogs();
        for (uint256 i = 0; i < logs.length; i++) if (logs[i].emitter == address(r)) { (qid,,,) = abi.decode(logs[i].data, (bytes32, uint96, bool, bytes)); return qid; }
        revert("no G2Signal");
    }

    // ── constructor ──
    function test_ctor_rejectsZeroToken() public { vm.expectRevert(bytes("token=0")); new G2RegistryUSDC(address(0), 10_000, address(reg), TIMEOUT, FEE, TRE); }
    function test_ctor_rejectsZeroTimeout() public { vm.expectRevert(bytes("timeout=0")); new G2RegistryUSDC(address(usdc), 10_000, address(reg), 0, FEE, TRE); }
    function test_ctor_defaultsToDeployer() public {
        G2RegistryUSDC x = new G2RegistryUSDC(address(usdc), 10_000, address(reg), TIMEOUT, address(0), address(0));
        assertEq(x.feeRecipient(), address(this)); assertEq(x.treasuryVault(), address(this)); assertEq(address(x.token()), address(usdc));
    }

    // ── signals ──
    function test_postSignal_movesNoTokens() public {
        vm.prank(OTHER); r.postSignal(bytes("G2|I|0|intel"));
        assertEq(usdc.balanceOf(address(r)), 0);
    }
    function test_postSignal_rejectsQ() public { vm.expectRevert(G2RegistryUSDC.UsePostQueryForQ.selector); r.postSignal(PKT_Q); }

    // ── postQuery ──
    function test_postQuery_pullsBountyAndTip() public {
        uint256 before = usdc.balanceOf(POSTER);
        _post(PKT_Q, BOUNTY, 50_000);
        assertEq(usdc.balanceOf(address(r)), BOUNTY + 50_000);
        assertEq(usdc.balanceOf(POSTER), before - BOUNTY - 50_000);
        assertEq(r.totalEscrowed(), BOUNTY);
        assertEq(r.credits(FEE), 50_000);
    }
    function test_postQuery_needsAllowance() public {
        usdc.mint(OTHER, BOUNTY);
        vm.prank(OTHER); vm.expectRevert();
        r.postQuery(PKT_Q, uint96(BOUNTY), 0);
    }
    function test_postQuery_zeroBounty() public { vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.ZeroBounty.selector); r.postQuery(PKT_Q, 0, 0); }
    function test_postQuery_mustBeQ() public { vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.MustBeQueryType.selector); r.postQuery(bytes("G2|I|0|0|x"), uint96(BOUNTY), 0); }
    function test_postQuery_refusesFeeOnTransferToken() public {
        FeeToken ft = new FeeToken();
        G2RegistryUSDC x = new G2RegistryUSDC(address(ft), 10_000, address(reg), TIMEOUT, FEE, TRE);
        ft.mint(POSTER, 10 * BOUNTY);
        vm.startPrank(POSTER); ft.approve(address(x), type(uint256).max);
        vm.expectRevert(G2RegistryUSDC.FeeOnTransferToken.selector);
        x.postQuery(PKT_Q, uint96(BOUNTY), 0);
        vm.stopPrank();
    }
    function test_noNativeValueAccepted() public {
        vm.deal(POSTER, 1 ether);
        vm.prank(POSTER);
        (bool ok,) = address(r).call{value: 1}(abi.encodeWithSelector(r.postQuery.selector, PKT_Q, uint96(BOUNTY), uint96(0)));
        assertFalse(ok);
        vm.prank(POSTER);
        (bool ok2,) = address(r).call{value: 1}("");
        assertFalse(ok2);
    }

    // ── directed respond ──
    function test_directed_unverifiedSolverGets95() public {
        reg.setOwner(TARGET_PASSPORT, SOLVER);
        bytes32 q = _post(PKT_Q_DIR, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        assertEq(usdc.balanceOf(SOLVER), BOUNTY * 9500 / 10000);
        assertEq(r.credits(FEE), BOUNTY * 300 / 10000);   // 2% + the unverified 1%
        assertEq(r.credits(TRE), BOUNTY * 150 / 10000);
        assertEq(r.credits(POSTER), BOUNTY * 50 / 10000);
        assertEq(r.totalEscrowed(), 0);
        assertEq(usdc.balanceOf(address(r)), r.credits(FEE) + r.credits(TRE) + r.credits(POSTER));
    }
    function test_directed_verifiedSolverGets96() public {
        reg.setOwner(TARGET_PASSPORT, SOLVER); reg.setOwner(SOLVER_PASSPORT, SOLVER);
        bytes32 q = _post(PKT_Q_DIR, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A_VER);
        assertEq(usdc.balanceOf(SOLVER), BOUNTY * 9600 / 10000);
        assertEq(r.credits(FEE), BOUNTY * 200 / 10000);
    }
    function test_directed_onlyTarget() public {
        reg.setOwner(TARGET_PASSPORT, SOLVER);
        bytes32 q = _post(PKT_Q_DIR, BOUNTY, 0);
        vm.prank(OTHER); vm.expectRevert(G2RegistryUSDC.NotTargetSolver.selector); r.respond(q, PKT_A);
    }
    function test_directed_unregisteredTarget() public {
        bytes32 q = _post(PKT_Q_DIR, BOUNTY, 0);
        vm.prank(SOLVER); vm.expectRevert(G2RegistryUSDC.TargetNotRegistered.selector); r.respond(q, PKT_A);
    }
    function test_posterCannotRespond() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.PosterCannotRespond.selector); r.respond(q, PKT_A);
    }
    function test_respondAfterExpiry() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.warp(block.timestamp + TIMEOUT);
        vm.prank(SOLVER); vm.expectRevert(G2RegistryUSDC.QueryExpired.selector); r.respond(q, PKT_A);
    }
    function test_respondMustBeAck() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); vm.expectRevert(G2RegistryUSDC.AckTypeMismatch.selector); r.respond(q, bytes("G2|I|0|x"));
    }

    // ── open: respond + award ──
    function test_open_respondRecordsOnly() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        assertEq(usdc.balanceOf(SOLVER), 0);
        assertEq(r.totalEscrowed(), BOUNTY);
        vm.prank(SOLVER); vm.expectRevert(G2RegistryUSDC.AlreadyAnswered.selector); r.respond(q, PKT_A);
    }
    function test_open_awardCreditsSolver() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        vm.prank(POSTER); r.award(q, SOLVER);
        assertEq(r.credits(SOLVER), BOUNTY * 9500 / 10000);
        vm.prank(SOLVER); r.claim();
        assertEq(usdc.balanceOf(SOLVER), BOUNTY * 9500 / 10000);
        assertEq(r.totalEscrowed(), 0);
    }
    function test_open_awardVerifiedUsesStoredPassport() public {
        reg.setOwner(SOLVER_PASSPORT, SOLVER);
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A_VER);
        vm.prank(POSTER); r.award(q, SOLVER);
        assertEq(r.credits(SOLVER), BOUNTY * 9600 / 10000);
    }
    function test_open_awardOnlyPoster() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        vm.prank(OTHER); vm.expectRevert(G2RegistryUSDC.NotPoster.selector); r.award(q, SOLVER);
    }
    function test_open_awardNeedsAnswer() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.SolverHasNoAnswer.selector); r.award(q, SOLVER);
    }
    function test_open_awardAfterExpiry() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        vm.warp(block.timestamp + TIMEOUT);
        vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.QueryExpired.selector); r.award(q, SOLVER);
    }
    function test_settledCannotSettleAgain() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        vm.prank(POSTER); r.award(q, SOLVER);
        vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.QueryAlreadySettled.selector); r.award(q, SOLVER);
    }

    // ── cancel + claim ──
    function test_cancel_beforeExpiryReverts() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.QueryNotExpired.selector); r.cancelQuery(q);
    }
    function test_cancel_refundsFullBounty() public {
        uint256 before = usdc.balanceOf(POSTER);
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.warp(block.timestamp + TIMEOUT);
        vm.prank(POSTER); r.cancelQuery(q);
        assertEq(usdc.balanceOf(POSTER), before);
        assertEq(r.totalEscrowed(), 0);
        assertEq(usdc.balanceOf(address(r)), 0);
    }
    function test_cancel_onlyPoster() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.warp(block.timestamp + TIMEOUT);
        vm.prank(OTHER); vm.expectRevert(G2RegistryUSDC.NotPoster.selector); r.cancelQuery(q);
    }
    function test_claim_nothing() public { vm.prank(OTHER); vm.expectRevert(G2RegistryUSDC.NothingToClaim.selector); r.claim(); }
    function test_claim_paysAndZeroes() public {
        _post(PKT_Q, BOUNTY, 70_000);
        vm.prank(FEE); r.claim();
        assertEq(usdc.balanceOf(FEE), 70_000);
        assertEq(r.credits(FEE), 0);
    }

    // ── previewSplit now matches what is paid (the Arc version showed 95% for a verified solver) ──
    function test_previewMatchesPayout_verified() public {
        reg.setOwner(TARGET_PASSPORT, SOLVER); reg.setOwner(SOLVER_PASSPORT, SOLVER);
        (uint256 toSolver,,,) = r.previewSplit(BOUNTY, true);
        bytes32 q = _post(PKT_Q_DIR, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A_VER);
        assertEq(usdc.balanceOf(SOLVER), toSolver);
    }
    function test_previewMatchesPayout_unverified() public {
        reg.setOwner(TARGET_PASSPORT, SOLVER);
        (uint256 toSolver, uint256 toFee, uint256 toTre, uint256 toPoster) = r.previewSplit(BOUNTY, false);
        bytes32 q = _post(PKT_Q_DIR, BOUNTY, 0);
        vm.prank(SOLVER); r.respond(q, PKT_A);
        assertEq(usdc.balanceOf(SOLVER), toSolver);
        assertEq(r.credits(FEE), toFee); assertEq(r.credits(TRE), toTre); assertEq(r.credits(POSTER), toPoster);
    }

    // ── fuzz: every unit is accounted for, and the registry holds exactly escrow + credits ──
    function testFuzz_conservation(uint96 bounty, uint96 tip, bool verified, bool directed) public {
        bounty = uint96(bound(bounty, 10_000, 1e14)); tip = uint96(bound(tip, 0, 1e12));
        usdc.mint(POSTER, uint256(bounty) + tip);
        reg.setOwner(TARGET_PASSPORT, SOLVER);
        if (verified) reg.setOwner(SOLVER_PASSPORT, SOLVER);
        bytes32 q = _post(directed ? PKT_Q_DIR : PKT_Q, bounty, tip);
        vm.prank(SOLVER); r.respond(q, verified ? PKT_A_VER : PKT_A);
        if (!directed) { vm.prank(POSTER); r.award(q, SOLVER); vm.prank(SOLVER); r.claim(); }
        uint256 paid = usdc.balanceOf(SOLVER);
        uint256 creditsSum = r.credits(FEE) + r.credits(TRE) + r.credits(POSTER);
        assertEq(paid + creditsSum, uint256(bounty) + tip);
        assertEq(usdc.balanceOf(address(r)), r.totalEscrowed() + creditsSum);
        (uint256 previewSolver,,,) = r.previewSplit(bounty, verified);
        assertEq(paid, previewSolver);
    }

    // ── board readable with plain contract reads ──
    function test_board_listsQueriesTextAndRespondents() public {
        bytes32 q1 = _post(PKT_Q, BOUNTY, 0);
        vm.roll(block.number + 1);
        bytes32 q2 = _post(PKT_Q_DIR, BOUNTY, 0);
        assertEq(r.queryCount(), 2);
        assertEq(r.queryIds(0), q1); assertEq(r.queryIds(1), q2);
        assertEq(string(r.queryText(q1)), "open question");
        assertEq(string(r.queryText(q2)), "directed question");
        vm.prank(SOLVER); r.respond(q1, PKT_A);
        vm.prank(OTHER);  r.respond(q1, bytes("G2|A|0|other answer"));
        assertEq(r.respondentCount(q1), 2);
        assertEq(r.respondentAt(q1, 0), SOLVER); assertEq(r.respondentAt(q1, 1), OTHER);
        assertEq(string(r.answers(q1, OTHER)), "other answer");
        reg.setOwner(TARGET_PASSPORT, SOLVER);
        vm.prank(SOLVER); r.respond(q2, PKT_A);
        assertEq(r.respondentCount(q2), 0);   // directed answers settle at once and are not listed
    }

    // ── review fixes (13 Oct): minimum bounty, text caps, empty answers ──
    function test_ctor_rejectsZeroMinBounty() public { vm.expectRevert(bytes("minBounty=0")); new G2RegistryUSDC(address(usdc), 0, address(reg), TIMEOUT, FEE, TRE); }
    function test_postQuery_belowMinimum() public { vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.BountyBelowMinimum.selector); r.postQuery(PKT_Q, 9_999, 0); }
    function test_postQuery_textTooLong() public {
        bytes memory big = new bytes(1_001); for (uint256 i = 0; i < big.length; i++) big[i] = "x";
        vm.prank(POSTER); vm.expectRevert(G2RegistryUSDC.TextTooLong.selector); r.postQuery(abi.encodePacked("G2|Q|0|0|", big), uint96(BOUNTY), 0);
        bytes memory ok = new bytes(1_000); for (uint256 i = 0; i < ok.length; i++) ok[i] = "x";
        _post(abi.encodePacked("G2|Q|0|0|", ok), BOUNTY, 0);
    }
    function test_respond_emptyAnswerRefused() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        vm.prank(SOLVER); vm.expectRevert(G2RegistryUSDC.EmptyAnswer.selector); r.respond(q, bytes("G2|A|12|"));
    }
    function test_respond_answerTooLong() public {
        bytes32 q = _post(PKT_Q, BOUNTY, 0);
        bytes memory big = new bytes(1_001); for (uint256 i = 0; i < big.length; i++) big[i] = "y";
        vm.prank(SOLVER); vm.expectRevert(G2RegistryUSDC.TextTooLong.selector); r.respond(q, abi.encodePacked("G2|A|0|", big));
    }
}
