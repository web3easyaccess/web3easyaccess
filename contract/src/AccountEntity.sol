pragma solidity ^0.8.20;

import {EIP712} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";

contract AccountEntity is EIP712 {
    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256(
            "_permit(address _passwdAddr,uint256 _nonce,bytes32 _argumentsHash)"
        );

    address accountImpl;

    /**
        one owner have many accounts, the first account named BigBrother.
        BigBrother's passwdAddr is the actual passwdAddr, other's set to ZERO.
     */
    address bigBrotherAccount;
    address public passwdAddr;
    /**
        password question's number, which was encrypted.
        BigBrother's questionNos is actual, other's set nothing.
     */
    string public questionNos;

    uint256 public nonce;

    address entryEOA; // entryEOA. it's often a EOA.
    address factory; // factory Contract.
    // address w3eaPoint;
    uint256 public w3eaPointAmount;

    /**
        gas fees that can be paid free of charge by the system.(wei)
     */
    uint256 public gasFreeAmount;

    /**
    stanby variables
     */
    mapping(uint256 => bytes32) public standbyVariables;

    event InitAccount(address passwdAddr, address factory);
    event ChgEntry(address newEntry);
    event ChgPasswdAddr(address oldPasswdAddr, address newPasswdAddr);
    event SyncEntryEOA(address newEntryEOA);
    event UpgradeImpl(address oldImpl, address newImpl);
    event SendTransaction(address to, bytes data, uint256 value);

    error FunctionError();

    receive() external payable {}

    constructor() EIP712("Account", "1") {
        factory = msg.sender;
    }

    function initImpl(address _impl) external {
        require(accountImpl == address(0), "call by mistake");
        accountImpl = _impl;
        emit UpgradeImpl(address(0), _impl);
    }

    fallback(
        bytes calldata data
    ) external payable virtual returns (bytes memory) {
        (bool success, bytes memory returndata) = accountImpl.delegatecall(
            data
        );
        if (!success) {
            require(returndata.length > 0, "delegatecallFail");

            // also revert when returndata.length>0:
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            return returndata;
        }
    }

    ////////////
    //////////
    ///////////
    //
}
