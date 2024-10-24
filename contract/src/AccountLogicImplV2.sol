pragma solidity ^0.8.20;

// import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
// import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

import {ECDSA} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";

import {Address} from "../lib/openzeppelin-contracts/contracts/utils/Address.sol";

import "./AccountEntity.sol";
import "./IAccountLogic.sol";
import "./FactoryLogicV1.sol";

import "./W3EAPoint.sol";

/**
signature: 0xe01ef14da1650a42a150b0abaa69f68694c229fc63ee211fc2c68c1af8d0d4254d04b304261bee5abaa2d69b98e83b01776a26ebf5fa4914f6421d8aadc939881c
msgHash: 0x88faa215146fc04d6fcadc4cebc734283956b27ec96f060c4302844f314ac3fe
 */
contract AccountLogicImplV2 is AccountEntity, IAccountLogic {
    // Standard Signature Validation Method for Contracts
    // https://eips.ethereum.org/EIPS/eip-1271
    // https://docs.alchemy.com/docs/how-to-make-your-dapp-compatible-with-smart-contract-wallets
    function isValidSignature(
        bytes32 _hash,
        bytes memory _signature
    ) external view returns (bytes4) {
        // Validate signatures

        address myPasswdAddr = (
            (bigBrotherAccount == address(0))
                ? passwdAddr
                : AccountEntity(payable(bigBrotherAccount)).passwdAddr()
        );

        // bytes32 structHash = keccak256(abi.encode(PERMIT_TYPEHASH, _hash));

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, myPasswdAddr, nonce, _hash)
        );

        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, _signature);

        if (signer == myPasswdAddr) {
            return 0x1626ba7e; // 1271_MAGIC_VALUE
        } else {
            return 0xffffffff;
        }
    }

    //
    function initByFactory(
        address _entryEOA,
        address _bigBrotherAccount,
        address _passwdAddr,
        string calldata _questionNos,
        uint256 _gasFreeAmount
    ) external {
        if (factory == address(0)) {
            factory = msg.sender;
            entryEOA = _entryEOA;
            bigBrotherAccount = _bigBrotherAccount;
            passwdAddr = _passwdAddr;
            questionNos = _questionNos;
            gasFreeAmount = _gasFreeAmount;
            w3eaPointAmount = 1e19 + 1; // initial value.
            emit InitAccount(_passwdAddr, msg.sender);
        }
    }

    uint256 constant DAYS30 = 30 * 24 * 3600;
    uint256 constant TIMESTAMP20260131 = 1769788800;
    function _takeFee(uint256 estimatedFee) private {
        if (estimatedFee <= gasFreeAmount) {
            gasFreeAmount -= estimatedFee;
        } else {
            require(
                address(this).balance >= estimatedFee,
                "TransferGas notEnough"
            );

            (bool success, bytes memory returndata) = entryEOA.call{
                value: estimatedFee
            }("");
            if (!success) {
                require(returndata.length > 0, "transferGasFail");

                // also revert when returndata.length>0:
                // The easiest way to bubble the revert reason is using memory via assembly
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            }

            //
        }
        uint pointTimes = block.timestamp < TIMESTAMP20260131 - DAYS30
            ? (TIMESTAMP20260131 - block.timestamp) / DAYS30
            : 1;
        w3eaPointAmount +=
            ((pointTimes * estimatedFee) * 1e13) /
            (tx.gasprice == 0 ? 1 : tx.gasprice);
    }

    /** 
        sync impl contract to factory, after permit!
     */
    function upgradeImpl(
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    )
        external
        _permit(
            estimatedFee,
            _passwdAddr,
            _signature,
            keccak256(abi.encode(1, estimatedFee))
        )
    {
        address newImpl = Factory(payable(factory)).accountImpl();
        if (accountImpl != newImpl) {
            emit UpgradeImpl(accountImpl, newImpl);
            accountImpl = newImpl;
        }
    }

    function increaseGasFreeAmount(uint256 _amount) external {
        require(
            msg.sender == factory || msg.sender == entryEOA,
            "only factory"
        );
        gasFreeAmount += _amount;
    }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // include: Reentrancy Guard
    modifier _permit(
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature,
        bytes32 _argumentsHash
    ) {
        address myPasswdAddr = (
            (bigBrotherAccount == address(0))
                ? passwdAddr
                : AccountEntity(payable(bigBrotherAccount)).passwdAddr()
        );
        // if (msg.sender != myPasswdAddr) {
        if (msg.sender != entryEOA && msg.sender != factory) {
            entryEOA = Factory(payable(factory)).entryEOA();
            require(
                msg.sender == entryEOA || msg.sender == factory,
                "only entry"
            );
            emit SyncEntryEOA(entryEOA);
        }

        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                _passwdAddr,
                _useNonce(),
                _argumentsHash
            )
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, _signature);
        require(signer == myPasswdAddr, "privateInfo error");
        //
        _takeFee(estimatedFee);
        // } else {
        //     _takeFee(estimatedFee / 100);
        // }

        _;
    }

    function _useNonce() private returns (uint256) {
        unchecked {
            // It is important to do x++ and not ++x here.
            return nonce++;
        }
    }

    /**
        It means changing password
    */
    function chgPasswdAddr(
        address _newPasswdAddr,
        string calldata _newQuestionNos,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    )
        external
        _permit(
            estimatedFee,
            _passwdAddr,
            _signature,
            keccak256(
                abi.encode(
                    2,
                    _newPasswdAddr,
                    keccak256(bytes(_newQuestionNos)),
                    estimatedFee
                )
            )
        )
    {
        require(bigBrotherAccount == address(0), "1stAcctCanChangeOnly");
        emit ChgPasswdAddr(passwdAddr, _newPasswdAddr);
        passwdAddr = _newPasswdAddr;
        questionNos = _newQuestionNos;
    }

    function sendTransaction(
        address to,
        uint256 amount,
        bytes calldata data,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    )
        external
        payable
        _permit(
            estimatedFee,
            _passwdAddr,
            _signature,
            keccak256(abi.encode(3, to, amount, data, estimatedFee))
        )
        returns (bytes memory rtnData)
    {
        require(address(this).balance >= amount, "TransferAmount notEnough");
        (bool success, bytes memory returndata) = to.call{value: amount}(data);
        if (!success) {
            require(returndata.length > 0, "SendTransactionFail");

            // also revert when returndata.length>0:
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            rtnData = returndata;
        }
        emit SendTransaction(to, data, amount);
    }

    function upImplAfterSend(
        address to,
        uint256 amount,
        bytes calldata data,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    )
        external
        payable
        _permit(
            estimatedFee,
            _passwdAddr,
            _signature,
            keccak256(abi.encode(4, to, amount, data, estimatedFee))
        )
        returns (bytes memory rtnData)
    {
        // // //
        require(address(this).balance >= amount, "transferAmount notEnough");
        (bool success, bytes memory returndata) = to.call{value: amount}(data);
        if (!success) {
            require(returndata.length > 0, "SendTransactionFail");

            // also revert when returndata.length>0:
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            rtnData = returndata;
        }
        emit SendTransaction(to, data, amount);

        address newImpl = Factory(payable(factory)).accountImpl();
        if (accountImpl != newImpl) {
            emit UpgradeImpl(accountImpl, newImpl);
            accountImpl = newImpl;
        }
    }

    function sendMultiTransaction(
        address[] calldata toArr,
        uint256[] calldata amountArr,
        bytes[] calldata dataArr,
        uint256 estimatedFee,
        address _passwdAddr,
        bytes memory _signature
    )
        external
        payable
        _permit(
            estimatedFee,
            _passwdAddr,
            _signature,
            keccak256(abi.encode(5, toArr, amountArr, dataArr, estimatedFee))
        )
        returns (bytes[] memory results)
    {
        results = new bytes[](toArr.length);
        for (uint256 i = 0; i < toArr.length; i++) {
            (bool success, bytes memory returndata) = toArr[i].call{
                value: amountArr[i]
            }(dataArr[i]);
            if (!success) {
                require(returndata.length > 0, "sendMultiTransaction Fail");
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                results[i] = returndata;
            }
            emit SendTransaction(toArr[i], dataArr[i], amountArr[i]);
        }
        return results;
    }

    fallback(
        bytes calldata data
    ) external payable override returns (bytes memory rtn) {
        revert FunctionError();
        rtn = new bytes(0);
    }
}
