// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
// import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

import {ECDSA} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "../lib/openzeppelin-contracts/contracts/utils/Nonces.sol";

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Account is EIP712, Nonces {
    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256(
            "_permit(uint256 _ownerId,address _passwdAddr,uint256 _nonce)"
        );

    address public admin;
    uint256 private ownerId;
    address private passwdAddr;
    uint256 private lastNonce;

    event InitAccount(uint256 ownerId, address passwdAddr, address admin);
    event ChgAdmin(address newAdmin);
    event ChgOwnerId(uint256 newOwnerId);
    event ChgPasswdAddr(address newPasswdAddr);
    event TransferETH(address to, uint256 amount);
    event TransferToken(address token, address to, uint256 amount);

    constructor() EIP712("Account", "1") {
        admin = msg.sender;
    }

    receive() external payable {}

    function initOnwer(uint256 _ownerId, address _passwdAddr) external {
        require(msg.sender == admin, "only admin!");
        if (ownerId == 0) {
            ownerId = _ownerId;
            passwdAddr = _passwdAddr;
            emit InitAccount(_ownerId, _passwdAddr, msg.sender);
        }
    }

    function queryOwnerId() external view returns (uint256) {
        require(msg.sender == admin, "only admin!");
        return ownerId;
    }

    function queryPasswdAddr() external view returns (address) {
        require(msg.sender == admin, "only admin!");
        return passwdAddr;
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    modifier _permit(
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce, // same nonce can be used only once on the offchain application server
        bytes calldata _signature
    ) {
        require(msg.sender == admin, "only admin!");
        require(ownerId == _ownerId, "ownerId error!");
        require(passwdAddr == _passwdAddr, "passwdAddr error!");
        require(_nonce > lastNonce, "nonce invalid!");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, _ownerId, _passwdAddr, _nonce) // _useNonce(eoa))
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, _signature);

        require(signer == _passwdAddr, "permit error!");

        lastNonce = _nonce;

        _;
    }

    function chgAdmin(
        address _newAdmin,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external _permit(_ownerId, _passwdAddr, _nonce, _signature) {
        admin = _newAdmin;
        emit ChgAdmin(_newAdmin);
    }

    function chgOwnerId(
        uint256 _newOwnerId,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external _permit(_ownerId, _passwdAddr, _nonce, _signature) {
        ownerId = _newOwnerId;
        emit ChgOwnerId(_newOwnerId);
    }

    function chgPasswdAddr(
        address _newPasswdAddr,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external _permit(_ownerId, _passwdAddr, _nonce, _signature) {
        passwdAddr = _newPasswdAddr;
        emit ChgPasswdAddr(_newPasswdAddr);
    }

    modifier _checkTo(address to) {
        _;
    }

    /**
        ETH
     */
    function transferETH(
        address to,
        uint256 amount,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    )
        external
        payable
        _permit(_ownerId, _passwdAddr, _nonce, _signature)
        _checkTo(to)
    {
        require(amount <= address(this).balance, "balance is not enough!");
        (bool success, ) = to.call{value: amount}("");
        require(success, "transferETH failed.");
        emit TransferETH(to, amount);
    }

    /**
        ERC20 token
     */
    function transferToken(
        address token,
        address to,
        uint256 amount,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    ) external _permit(_ownerId, _passwdAddr, _nonce, _signature) _checkTo(to) {
        require(
            amount <= IERC20(token).balanceOf(address(this)),
            "token balance is not enough!"
        );
        IERC20(token).transfer(to, amount);
        // TransferToken(address token, address to, uint256 amount);
    }

    function approveToken(
        address token,
        address spender,
        uint256 amount,
        uint256 _ownerId,
        address _passwdAddr,
        uint256 _nonce,
        bytes calldata _signature
    )
        external
        _permit(_ownerId, _passwdAddr, _nonce, _signature)
        _checkTo(spender)
    {
        IERC20(token).approve(spender, amount);
    }
}
