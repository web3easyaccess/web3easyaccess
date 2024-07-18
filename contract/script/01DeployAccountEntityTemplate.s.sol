pragma solidity ^0.8.20;

import "../src/AccountEntity.sol";

import {Script, console} from "forge-std/Script.sol";

contract AccountEntityScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        AccountEntity m = new AccountEntity();
    }
}
