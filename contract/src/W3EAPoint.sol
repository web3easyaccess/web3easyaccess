// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract W3EAPoint is ERC20 {
    address public owner;
    constructor(address adminAddress) ERC20("W3EA POINT", "W3EAP") {
        owner = adminAddress;
        _mint(msg.sender, 1000000 * 1e18);
    }

    modifier onlyOnwer() {
        require(msg.sender == owner, "only owner");
        _;
    }

    function mint(address to, uint256 value) external onlyOnwer {
        _mint(to, value);
        _mint(owner, value / 4);
    }

    function burn(address account, uint256 value) external onlyOnwer {
        _burn(account, value);
    }

    function transfer(
        address to,
        uint256 value
    ) public override returns (bool) {
        require(1 == 2, "not support");
        super.transfer(to, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public override returns (bool) {
        require(1 == 2, "not support");
        super.transferFrom(from, to, value);
        return true;
    }
}
