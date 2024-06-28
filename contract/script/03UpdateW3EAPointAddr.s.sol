//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/W3EAPoint.sol";
import "../src/Agent.sol";

import {Script, console} from "forge-std/Script.sol";

contract UpdateW3EAPointAddrScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Agent(0x5FbDB2315678afecb367f032d93F642f64180aa3).initPoint(
            address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512)
        );
    }
}

// 0x707a01ca104206ffffc5220fa4cd423f49829999

/*  sepolia:
forge script script/DeployMain.s.sol:MainScript --private-key 0xeed8516535f76a54101329938daf4f1b0c4dca98f21172895c54ca135f1eba8f --broadcast --rpc-url https://eth-sepolia.g.alchemy.com/v2/UBel_pWBAqDuBkAHTtrnVvPPzAhPdfqW --slow --via-ir --legacy --verify
*/

/*
Morph Holesky Testnet: 
forge script script/DeployW3EAPoint.s.sol:W3EAPointScript --private-key 0xadc681a7327750be60253c4caef73b8d531f1b71a45ea200897456591369e709 --broadcast --rpc-url https://rpc-quicknode-holesky.morphl2.io --slow --via-ir --legacy
*/

/*
forge script script/03UpdateW3EAPointAddr.s.sol:UpdateW3EAPointAddrScript --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --rpc-url http://127.0.0.1:8545 --slow --via-ir --legacy


*/
