pragma solidity ^0.8.20;

import "../src/FactoryLogicV1.sol";

import {Script, console} from "forge-std/Script.sol";

contract A3UpAcctImplInFactoryScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Factory m = Factory(
            payable(address(0x8F8F94C5D5EEceE02A8adF5Ccd5050E51009608D))
        );
        m.upgradeImpl(0x8B142090a5AaA9403eF04513101bA709A57160B7);
    }
}
