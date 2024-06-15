// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

interface IUserContract {
    function transferETH(address to, uint256 amount) external payable;

    // erc20
    function transferToken(address token, address to, uint256 amount) external;

    // erc721
    function TransferNFT(address token, address to) external;

    // erc20
    function Approve(address token, address operator, uint256 amount) external;

    // erc721
    function ApproveNFT(address nft, address operator, uint256 nftId) external;

    // erc721
    function ApproveAllNFT(address nft, address operator) external;
}
