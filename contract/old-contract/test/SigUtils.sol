// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract SigUtils {
    bytes32 internal DOMAIN_SEPARATOR;

    constructor(bytes32 _DOMAIN_SEPARATOR) {
        DOMAIN_SEPARATOR = _DOMAIN_SEPARATOR;
    }

    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public PERMIT_TYPEHASH =
        keccak256("_permit(address eoa,uint256 nonce)");
    // keccak256("_permit(address eoa, uint256 nonce)");
    struct Permit {
        address eoa;
        uint256 nonce;
    }

    // computes the hash of a permit
    function getStructHash(
        Permit memory _permit
    ) internal view returns (bytes32) {
        return
            keccak256(abi.encode(PERMIT_TYPEHASH, _permit.eoa, _permit.nonce));
    }

    // computes the hash of the fully encoded EIP-712 message for the domain, which can be used to recover the signer
    function getTypedDataHash(
        Permit memory _permit
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    getStructHash(_permit)
                )
            );
    }
}
