// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IUserContract.sol";

contract UserContract is IUserContract {
    uint256 public gasUsedInUsdc;
    uint256 public currentNonce;
    address admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    function checkAndSetNonce(uint256 _nonce) external onlyAdmin {
        require(_nonce > currentNonce, "nonce is inValid!");
        currentNonce = _nonce;
    }

    function accumulateGasInUsdc(uint256 _gasInUsdc) external onlyAdmin {
        gasUsedInUsdc += _gasInUsdc;
    }

    function transferETH(
        address to,
        uint256 amount
    ) external payable onlyAdmin {
        require(amount <= address(this).balance, "balance is not enough!");
        payable(to).transfer(amount);
    }

    function transferToken(
        address token,
        address to,
        uint256 amount
    ) external override onlyAdmin {
        require(
            amount <= IERC20(token).balanceOf(address(this)),
            "balance is not enough!"
        );
        IERC20(token).transfer(to, amount);
    }

    function TransferNFT(
        address token,
        address to
    ) external override onlyAdmin {
        // transfer nft
    }

    function Approve(
        address token,
        address operator,
        uint256 amount
    ) external override onlyAdmin {
        // approve token
    }

    function ApproveNFT(
        address nft,
        address operator,
        uint256 nftId
    ) external override onlyAdmin {
        // approve nft
    }

    function ApproveAllNFT(
        address nft,
        address operator
    ) external override onlyAdmin {
        // approve all nft
    }

    receive() external payable {}
}
