// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "./Account.sol";

contract Administrator {
    mapping(uint256 => address) accounts;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "onlyOwner!");
        _;
    }

    function chgOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function queryAccount(uint256 _ownerId) external view returns (address) {
        require(msg.sender == owner, "onlyOwner!");
        return accounts[_ownerId];
    }

    function newAccount(uint256 _ownerId, address _passwdAddr) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] == address(0), "user exists!");
        Account acct = new Account();
        acct.initOnwer(_ownerId, _passwdAddr); // todo optimize to min proxy eip-1167
        accounts[_ownerId] = address(acct);
    }

    /**
     */
    function chgAdmin(
        address _newAdmin,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] != address(0), "user not exists!");
        Account(payable(accounts[_ownerId])).chgAdmin(
            _newAdmin,
            _ownerId,
            _passwdAddr,
            _nonce,
            _signature
        );
    }

    function chgOwnerId(
        uint256 _newOwnerId,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] != address(0), "user not exists!");
        Account(payable(accounts[_ownerId])).chgOwnerId(
            _newOwnerId,
            _ownerId,
            _passwdAddr,
            _nonce,
            _signature
        );
    }

    function chgPasswdAddr(
        address _newPasswdAddr,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] != address(0), "user not exists!");
        Account(payable(accounts[_ownerId])).chgPasswdAddr(
            _newPasswdAddr,
            _ownerId,
            _passwdAddr,
            _nonce,
            _signature
        );
    }

    function transferETH(
        address to,
        uint256 amount,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] != address(0), "user not exists!");
        Account(payable(accounts[_ownerId])).transferETH(
            to,
            amount,
            _ownerId,
            _passwdAddr,
            _nonce,
            _signature
        );
    }

    function transferToken(
        address token,
        address to,
        uint256 amount,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] != address(0), "user not exists!");
        Account(payable(accounts[_ownerId])).transferToken(
            token,
            to,
            amount,
            _ownerId,
            _passwdAddr,
            _nonce,
            _signature
        );
    }

    function approveToken(
        address token,
        address spender,
        uint256 amount,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(msg.sender == owner, "onlyOwner!");
        require(accounts[_ownerId] != address(0), "user not exists!");
        Account(payable(accounts[_ownerId])).approveToken(
            token,
            spender,
            amount,
            _ownerId,
            _passwdAddr,
            _nonce,
            _signature
        );
    }
}
