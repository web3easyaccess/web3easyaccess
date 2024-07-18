pragma solidity ^0.8.20;

import "../src/FactoryLogicV1.sol";

import {Script, console} from "forge-std/Script.sol";

contract FactoryLogicScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Factory m = new Factory();
    }
}
