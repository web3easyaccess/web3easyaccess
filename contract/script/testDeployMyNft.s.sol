pragma solidity ^0.8.20;

import "../src/MyNft.sol";

import {Script, console} from "forge-std/Script.sol";

contract DeployMyNftScript is Script {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        MyNft m = new MyNft();
    }
}
