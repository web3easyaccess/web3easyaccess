pragma solidity ^0.8.20;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    address public owner;
    constructor() ERC20("MyToken", "MTK") {
        owner = msg.sender;
        _mint(msg.sender, 10000000000 * 1e18);
    }

    modifier onlyOnwer() {
        require(msg.sender == owner, "only owner");
        _;
    }

    function mint(address to, uint256 value) external onlyOnwer {
        _mint(to, value);
    }

    function burn(address account, uint256 value) external onlyOnwer {
        _burn(account, value);
    }
}
