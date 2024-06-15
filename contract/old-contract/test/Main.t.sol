// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Main} from "../contracts/Main.sol";

import {SigUtils} from "./SigUtils.sol";

contract TokenBankTest is Test {
    Main public main;

    address eoaOwner;
    address eoaAAA;

    uint256 ownerPrivateKey;
    uint256 spenderPrivateKey;

    SigUtils sigUtils;

    function setUp() public {
        main = new Main();
        console.log("main addr:", address(main));
        sigUtils = new SigUtils(main.DOMAIN_SEPARATOR());

        ownerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        spenderPrivateKey = 0xB0B;

        eoaOwner = vm.addr(ownerPrivateKey);
        eoaAAA = makeAddr("AAA");

        // eoaOwner = makeAddr("eoa1");
        deal(eoaOwner, 100 ether);
        deal(eoaAAA, 101 ether);
        vm.chainId(31337);
        console.log("my chainId:", block.chainid);
        // vm.startPrank(eoa1);
    }

    // 测试离线签名存款
    function test_permitDepositFail() public {
        ////
        ////////////// 通过签名授权给一个非银行账户
        SigUtils.Permit memory permitAAA = SigUtils.Permit({
            eoa: eoaOwner,
            nonce: 123456 //
        });
        // eoaOwner在链下签名给非银行账户
        bytes32 digestAAA = sigUtils.getTypedDataHash(permitAAA);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digestAAA);

        bytes memory signature = new bytes(65); // 65 bytes for ECDSA signature

        // Append r value
        assembly {
            mstore(add(signature, 0x20), r)
        }

        // Append s value
        assembly {
            mstore(add(signature, 0x40), s)
        }

        // Append v value
        signature[64] = bytes1(v); // Since v is a single byte, we can directly assign it
        console.log("XXX:");
        console.logBytes(signature);
        main.permitRegister(eoaOwner, 123456, signature);
    }
}

/*
Logs:
  main addr: 0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
  XXX:
  0x1bcd2cba8df717a548c7d2c6366a2179d307ad9ecae748d68f0083641c9c84274c3741e217bce852f73bae8b69409e8615686c99dd143c3e3190dface7b18b341c
*/
