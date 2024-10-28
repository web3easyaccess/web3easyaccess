pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import "../src/FactoryLogicV1.sol";
import "../src/FactoryProxy.sol";

// forge script script/DeployTokenNft.s.sol:DeployTokenNft --rpc-url sepolia --private-key $PRIVATE_KEY --broadcast

contract DeployFactoryProxy is Script {
    function run() public {
        // Use address provided in config to broadcast transactions
        vm.startBroadcast();
        // Deploy the ERC-20 token

        FactoryProxy mm = new FactoryProxy(
            0xd372F3c62a5b29515A7E41724F2cB12852C79cF5,
            ""
        );

        // address mm = 0x8F8F94C5D5EEceE02A8adF5Ccd5050E51009608D;

        //

        Factory(payable(address(mm))).init(
            // entryEOA:
            0x55b3448D38724997747083323992C88dB4AccE55,
            //
            // --entity
            0xf31f3B3520f93f187692E9C5dCC5a8c0f6558518,
            // --impl
            0x3F3d5E3f794780a2aC98e64E07C63De62DbabAbC,
            // // //
            // three addresses .admin.
            0xee77e65d1C102ae66D23768D75391Cd42DD782e1,
            0x09B780Abc9eD6b9FdD19dcFe457DC9B47D994e51,
            0xee9D8ec22cE888d8332A843467F3D75d2f303D99
        );
        // Stop broadcasting calls from our address
        vm.stopBroadcast();
        // Log the token address
        console.log("FactoryProxy Address:", address(mm));
    }
}
