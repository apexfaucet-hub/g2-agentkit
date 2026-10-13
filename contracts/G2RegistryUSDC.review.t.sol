// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, Vm} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {G2RegistryUSDC} from "./G2RegistryUSDC.sol";

contract RevMockRegistry {
    mapping(uint256 => address) public o;
    function setOwner(uint256 id, address who) external { o[id] = who; }
    function ownerOf(uint256 id) external view returns (address) { require(o[id] != address(0), "nonexistent"); return o[id]; }
}

/// USDC-like: blacklisted addresses can neither send nor receive.
contract BLToken is ERC20 {
    mapping(address => bool) public bl;
    constructor() ERC20("USDC", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 a) external { _mint(to, a); }
    function setBL(address a, bool b) external { bl[a] = b; }
    function _update(address f, address t, uint256 v) internal override { require(!bl[f] && !bl[t], "blacklisted"); super._update(f, t, v); }
}

contract G2RegistryUSDCReviewTest is Test {
    G2RegistryUSDC r; RevMockRegistry reg; BLToken usdc;
    address constant FEE = address(0xFEE1); address constant TRE = address(0xFEE2);
    address constant P = address(0xA001); address constant S = address(0xA002); address constant S2 = address(0xA003);

    function setUp() public {
        reg = new RevMockRegistry(); usdc = new BLToken();
        r = new G2RegistryUSDC(address(usdc), 10_000, address(reg), 7 days, FEE, TRE);
        usdc.mint(P, 1e12); vm.prank(P); usdc.approve(address(r), type(uint256).max);
    }
    function _post(bytes memory pkt, uint96 b, uint96 t) internal returns (bytes32 qid) {
        vm.recordLogs(); vm.prank(P); r.postQuery(pkt, b, t);
        Vm.Log[] memory l = vm.getRecordedLogs();
        for (uint256 i; i < l.length; i++) if (l[i].emitter == address(r)) { (qid,,,) = abi.decode(l[i].data, (bytes32, uint96, bool, bytes)); return qid; }
    }
    function _inv() internal view { assertGe(usdc.balanceOf(address(r)), r.totalEscrowed() + r.credits(FEE) + r.credits(TRE) + r.credits(P) + r.credits(S) + r.credits(S2)); }

    // Ack with a 2-digit passport and empty payload records "" -> cannot be awarded, solver can re-answer.
    function test_emptyAckPayload_notAwardable() public {
        bytes32 q = _post("G2|Q|0|0|x", 1e6, 0);
        // fixed 13 Oct: an empty answer is refused, so it can no longer be silently lost
        vm.prank(S); vm.expectRevert(G2RegistryUSDC.EmptyAnswer.selector); r.respond(q, "G2|A|12|");
    }
    // Target passport burned -> respond reverts, poster recovers after expiry.
    function test_burnedTarget_cancelRecovers() public {
        reg.setOwner(99, S);
        bytes32 q = _post("G2|Q|0|99|x", 1e6, 0);
        reg.setOwner(99, address(0));
        vm.prank(S); vm.expectRevert(G2RegistryUSDC.TargetNotRegistered.selector); r.respond(q, "G2|A|0|y");
        uint256 b = usdc.balanceOf(P); vm.warp(block.timestamp + 7 days); vm.prank(P); r.cancelQuery(q);
        assertEq(usdc.balanceOf(P) - b, 1e6); _inv();
    }
    // Registry admin (upgradeable proxy) can point ownerOf at itself and take a directed bounty.
    function test_registryAdminCanRedirectDirectedBounty() public {
        reg.setOwner(99, S);
        bytes32 q = _post("G2|Q|0|99|x", 1e6, 0);
        address evil = address(0xBAD); reg.setOwner(99, evil);
        vm.prank(evil); r.respond(q, "G2|A|0|y");
        assertEq(usdc.balanceOf(evil), 950_000);
    }
    // Blacklisted solver / fee recipient cannot block anyone else.
    function test_blacklist_isolated() public {
        reg.setOwner(99, S);
        bytes32 q1 = _post("G2|Q|0|99|x", 1e6, 5);
        bytes32 q2 = _post("G2|Q|0|0|x", 1e6, 0);
        usdc.setBL(S, true); usdc.setBL(FEE, true);
        vm.prank(S); vm.expectRevert(bytes("blacklisted")); r.respond(q1, "G2|A|0|y");
        vm.prank(S2); r.respond(q2, "G2|A|0|y"); vm.prank(P); r.award(q2, S2);
        vm.prank(S2); r.claim(); vm.prank(TRE); r.claim(); vm.prank(P); r.claim();
        vm.warp(block.timestamp + 7 days); vm.prank(P); r.cancelQuery(q1);
        _inv();
    }
    // Open query: poster reads every answer on chain, never awards, cancels at expiry -> 100% back, solvers 0.
    function test_openQuery_freeRideByPoster() public {
        bytes32 q = _post("G2|Q|0|0|x", 1e6, 0);
        vm.prank(S); r.respond(q, "G2|A|0|the answer");
        assertEq(r.answers(q, S), bytes("the answer"));
        vm.prank(S2); r.respond(q, "G2|A|0|the answer"); // copier, same text
        uint256 b = usdc.balanceOf(P); vm.warp(block.timestamp + 7 days); vm.prank(P); r.cancelQuery(q);
        assertEq(usdc.balanceOf(P) - b, 1e6); assertEq(usdc.balanceOf(S), 0);
    }
    // Fuzz: settlement legs always sum to amount; invariant holds.
    function testFuzz_splitSums(uint96 b, bool ver) public {
        b = uint96(bound(b, 10_000, 1e12));
        if (ver) reg.setOwner(42, S2);
        bytes32 q = _post("G2|Q|0|0|x", b, 1);
        vm.prank(S2); r.respond(q, ver ? bytes("G2|A|42|y") : bytes("G2|A|0|y"));
        vm.prank(P); r.award(q, S2);
        assertEq(r.credits(FEE) - 1 + r.credits(TRE) + r.credits(P) + r.credits(S2), b);
        (uint256 a,,,) = r.previewSplit(b, ver); assertEq(a, r.credits(S2));
        assertEq(r.totalEscrowed(), 0); _inv();
    }

    // Empty-payload ack lets one address push itself into _respondents again and again (duplicates).
    function test_emptyAck_duplicateRespondents() public {
        bytes32 q = _post("G2|Q|0|0|x", 1e6, 0);
        // fixed 13 Oct: empty answers are refused, so one address can no longer list itself repeatedly
        vm.prank(S); vm.expectRevert(G2RegistryUSDC.EmptyAnswer.selector); r.respond(q, "G2|A|12|");
        vm.prank(S); r.respond(q, "G2|A|12|a");
        vm.prank(S); vm.expectRevert(G2RegistryUSDC.AlreadyAnswered.selector); r.respond(q, "G2|A|12|b");
        assertEq(r.respondentCount(q), 1);
        vm.prank(S2); r.respond(q, "G2|A|0|real"); vm.prank(P); r.award(q, S2); // award stays O(1)
    }
}
