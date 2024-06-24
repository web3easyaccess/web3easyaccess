// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./Account.sol";

import "./W3EAPoint.sol";

import {Address} from "../lib/openzeppelin-contracts/contracts/utils/Address.sol";

contract Administrator {
    using Address for address;

    uint256 constant NEW_REWARDS = 100 * 1e18;
    uint256 constant TRANS_REWARDS = 10 * 1e18;

    mapping(uint256 => address) accounts;

    address[4] public owners;

    W3EAPoint point;

    constructor() {
        owners[0] = msg.sender;
        owners[1] = msg.sender;
        owners[2] = msg.sender;
        owners[3] = msg.sender;
    }

    function initPoint(address pointAddress) external onlyOwner {
        if (address(point) == address(0)) {
            point = W3EAPoint(pointAddress);
        }
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

    // function chgOwner(uint256 idx, address _newOwner) external onlyOwner {
    //     owners[idx] = _newOwner;
    // }

    function queryAccount(
        uint256 _ownerId
    ) external view onlyOwner returns (address) {
        return accounts[_ownerId];
    }

    function newAccount(
        uint256 _ownerId,
        address _passwdAddr,
        bytes32 _questionNos
    ) external onlyOwner {
        require(accounts[_ownerId] == address(0), "user exists!");
        Account acct = new Account();
        acct.initPasswdAddr(_passwdAddr, _questionNos); // todo optimize to min proxy eip-1167
        accounts[_ownerId] = address(acct);

        point.mint(address(acct), NEW_REWARDS);
    }

    bool private lock;
    /**
     */
    function execute(
        uint256 _ownerId,
        bytes memory data
    ) external payable onlyOwner {
        if (!lock) {
            lock = true;
            require(accounts[_ownerId] != address(0), "user not exists!");

            accounts[_ownerId].functionCall(data);
            point.mint(accounts[_ownerId], TRANS_REWARDS);
            lock = false;
        }
    }
}
