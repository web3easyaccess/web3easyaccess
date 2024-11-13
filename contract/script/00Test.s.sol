pragma solidity ^0.8.20;

import "../src/Test1.sol";

import {Script, console} from "forge-std/Script.sol";

contract Test1Script is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        Test1 m = new Test1();
    }
}
