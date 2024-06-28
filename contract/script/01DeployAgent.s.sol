//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/Agent.sol";

import "../src/W3EAPoint.sol";

import {Script, console} from "forge-std/Script.sol";

contract AgentScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Agent m = new Agent();
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
forge script script/01DeployAgent.s.sol:AgentScript --private-key 0xadc681a7327750be60253c4caef73b8d531f1b71a45ea200897456591369e709 --broadcast --rpc-url https://rpc-quicknode-holesky.morphl2.io --slow --via-ir --legacy
*/

/*
forge script script/01DeployAgent.s.sol:AgentScript --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --rpc-url http://127.0.0.1:8545 --slow --via-ir --legacy
// 0x5FbDB2315678afecb367f032d93F642f64180aa3

*/
