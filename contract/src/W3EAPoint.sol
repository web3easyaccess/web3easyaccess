// contracts/GLDToken.sol

pragma solidity ^0.8.20;

import {ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

import "./AccountEntity.sol";

contract W3EAPoint is ERC20 {
    address public factory;

    /*
        registered account , and claimed amount.
    */
    mapping(address => uint256) claimedAmount;

    constructor() ERC20("W3EA POINT", "W3EAP") {
        factory = msg.sender;
    }

    function regAccount(address acct) external {
        require(msg.sender == factory, "only factory");
        // Represents the amount had been claimed  ,and should be 0, but 0 cannot be used, so 1 is used.
        // and user's initial value in AccountEntity Contract, must larger than 1.
        claimedAmount[acct] = 1; //
    }

    function _registeredAccountScore(
        address account
    ) private view returns (uint256) {
        uint256 ca = claimedAmount[account];
        if (ca > 0) {
            return AccountEntity(payable(account)).w3eaPointAmount() - ca;
        } else {
            return 0;
        }
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        uint256 ca = claimedAmount[from];
        if (ca > 0 && super.balanceOf(from) < value) {
            // Automatically trigger a claim

            uint256 myClaimAmount = AccountEntity(payable(from))
                .w3eaPointAmount() - ca;

            _mint(from, myClaimAmount);

            claimedAmount[from] = ca + myClaimAmount;
        }

        super._update(from, to, value);
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account) + _registeredAccountScore(account);
    }

    // function burn(address account, uint256 value) external onlyOnwer {
    //     _burn(account, value);
    // }
}
