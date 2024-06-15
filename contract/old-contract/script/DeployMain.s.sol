//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/Main.sol";

import {Script, console} from "forge-std/Script.sol";

contract MainScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Main m = new Main();
        // sepolia 0x2CbF3FfFD865D8D5D427376fdF25f38c1666983A
        // Morph Holesky Testnet 0xDE4D02e8018F549f0D2780d334ADa1F969FBa888
    }
}

// 0x707a01ca104206ffffc5220fa4cd423f49829999

/*  sepolia:
forge script script/DeployMain.s.sol:MainScript --private-key 0xeed8516535f76a54101329938daf4f1b0c4dca98f21172895c54ca135f1eba8f --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW --slow --via-ir --legacy --verify
*/

/*
Morph Holesky Testnet: 
forge script script/DeployMain.s.sol:MainScript --private-key 0xeed8516535f76a54101329938daf4f1b0c4dca98f21172895c54ca135f1eba8f --broadcast --rpc-url https://rpc-quicknode-holesky.morphl2.io --slow --via-ir --legacy
*/
