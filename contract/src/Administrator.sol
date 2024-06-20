// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./Account.sol";
import {Address} from "../lib/openzeppelin-contracts/contracts/utils/Address.sol";

contract Administrator {
    using Address for address;

    mapping(uint256 => address) accounts;

    address[4] public owners;

    constructor() {
        owners[0] = msg.sender;
    }

    modifier onlyOwner() {
        uint256 k = 0;
        for (; k < owners.length; k++) {
            if (msg.sender == owners[k]) {
                break;
            }
        }
        require(k < owners.length, "only owner!");
        _;
    }

    function chgOwner(uint256 idx, address _newOwner) external onlyOwner {
        owners[idx] = _newOwner;
    }

    function queryAccount(
        uint256 _emailKey
    ) external view onlyOwner returns (address) {
        return accounts[_emailKey];
    }

    function newAccount(
        uint256 _emailKey,
        address _ownerAddr
    ) external onlyOwner {
        require(accounts[_emailKey] == address(0), "user exists!");
        Account acct = new Account();
        acct.initOwner(_ownerAddr); // todo optimize to min proxy eip-1167
        accounts[_emailKey] = address(acct);
    }

    bool private lock;
    /**
     */
    function execute(
        uint256 _emailKey,
        bytes memory data
    ) external payable onlyOwner {
        if (!lock) {
            lock = true;
            require(accounts[_emailKey] != address(0), "user not exists!");

            accounts[_emailKey].functionCall(data);

            lock = false;
        }
    }
}
