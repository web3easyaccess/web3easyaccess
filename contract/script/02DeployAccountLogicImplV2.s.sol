pragma solidity ^0.8.20;

import "../src/AccountLogicImplV2.sol";

import {Script, console} from "forge-std/Script.sol";

contract AccountLogicImplV2Script is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        AccountLogicImplV2 m = new AccountLogicImplV2();
    }
}
