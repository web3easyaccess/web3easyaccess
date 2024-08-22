pragma solidity ^0.8.20;

import {ERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

contract MyNft is ERC721("MyNft", "MyNft") {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
    function mint(address to, uint256 tokenId) external {
        require(msg.sender == owner, "only onwer!");
        super._mint(to, tokenId);
    }
}
