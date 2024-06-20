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
        keccak256("_permit(address _ownerAddr,uint256 _nonce)");

    address[4] public admins;
    address private ownerAddr;
    uint256 private lastNonce;

    /**
        gas fees that can be paid free of charge by the system.(ETH wei)
     */
    uint256 public gasFeeRights;

    event InitAccount(address ownerAddr, address admin);
    event ChgAdmin(address newAdmin);
    event ChgOwnerAddr(address newOwnerAddr);
    event TransferETH(address to, uint256 amount);
    event TransferToken(address token, address to, uint256 amount);

    constructor() EIP712("Account", "1") {
        admins[0] = msg.sender;
        admins[1] = msg.sender;
        admins[2] = msg.sender;
        admins[3] = msg.sender;
    }

    function onlyAdmin() private view {
        uint256 k = 0;
        for (; k < admins.length; k++) {
            if (msg.sender == admins[k]) {
                break;
            }
        }
        require(k < admins.length, "only admins!");
    }

    receive() external payable {}

    function increaseGasFeeRights(uint256 amount) external {
        onlyAdmin();
        gasFeeRights += amount;
    }

    function initOwner(address _ownerAddr) external {
        onlyAdmin();
        if (ownerAddr == address(0)) {
            ownerAddr = _ownerAddr;
            emit InitAccount(_ownerAddr, msg.sender);
        }
    }

    // function queryOwnerAddr() external view returns (address) {
    //     require(msg.sender == admin, "only admin!");
    //     return ownerAddr;
    // }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    modifier _permit(
        address _ownerAddr,
        uint256 _nonce, // same nonce can be used only once on the offchain application server
        bytes memory _signature
    ) {
        onlyAdmin();

        require(_nonce > lastNonce, "nonce invalid!");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, _ownerAddr, _nonce) // _useNonce(eoa))
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, _signature);

        require(signer == ownerAddr, "permit error!");

        lastNonce = _nonce;

        _;
    }

    // function chgAdminZ(address _newAdmin) external {
    //     onlyAdmin();
    //     admins[admins.length - 1] = _newAdmin;
    //     emit ChgAdmin(_newAdmin);
    // }

    /**
        It means changing password
    */
    function chgOwnerAddr(
        address _newOwnerdAddr,
        address _ownerdAddr,
        uint256 _nonce,
        bytes memory _signature
    ) external _permit(_ownerdAddr, _nonce, _signature) {
        ownerAddr = _newOwnerdAddr;
        emit ChgOwnerAddr(_newOwnerdAddr);
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
        address _ownerAddr,
        uint256 _nonce,
        bytes memory _signature
    ) external payable _permit(_ownerAddr, _nonce, _signature) _checkTo(to) {
        require(amount <= address(this).balance, "ETH balance is not enough!");
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
        address _ownerAddr,
        uint256 _nonce,
        bytes memory _signature
    ) external _permit(_ownerAddr, _nonce, _signature) _checkTo(to) {
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
        address _ownerAddr,
        uint256 _nonce,
        bytes memory _signature
    ) external _permit(_ownerAddr, _nonce, _signature) _checkTo(spender) {
        IERC20(token).approve(spender, amount);
    }
}
