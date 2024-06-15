// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

import "./IUserContract.sol";
import "./UserContract.sol";

import "./PriceConsumer.sol";

contract Main is EIP712, Nonces {
    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256("_permit(address eoa,uint256 nonce)");

    // eoa => contracts
    mapping(address => address) userContracts;

    PriceConsumer pc;

    address public admin;

    address userContractTemplate;

    constructor() EIP712("web3easyaccess", "1.0") {
        admin = msg.sender;
        // userContractTemplate = address(new UserContract());
        pc = new PriceConsumer();
    }

    function chgAdmin(address newAdmin) external {
        require(msg.sender == admin, "must be admin!");
        admin = newAdmin;
    }

    function DOMAIN_SEPARATOR() external view virtual returns (bytes32) {
        return _domainSeparatorV4();
    }

    function _checkAndSetNonce(address ca, uint256 newNonce) private {
        UserContract(payable(ca)).checkAndSetNonce(newNonce);
    }

    modifier _permit(
        address eoa,
        uint256 nonce, // same nonce can be used only once on the offchain application server
        bytes calldata signature
    ) {
        require(msg.sender == admin, "must be admin!");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, eoa, nonce) // _useNonce(eoa))
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, signature);

        require(signer == eoa, "sign error!");

        _;
    }

    event Log(string message);
    event LogBytes(bytes data);

    function ethPrice() private returns (uint256) {
        uint256 lPrice = 370040512200;
        try pc.getThePrice() returns (uint256 myPrice) {
            return myPrice;
        } catch Error(string memory reason) {
            // catch failing revert() and require()
            emit Log(reason);
            return lPrice;
        } catch (bytes memory reason) {
            // catch failing assert()
            emit LogBytes(reason);
            return lPrice;
        }
    }

    function accumulateGasInUsdc(address eoa, uint256 _gasInEth) external {
        require(msg.sender == admin, "must be admin2!");
        if (userContracts[eoa] != address(0)) {
            address ca = userContracts[eoa];
            UserContract(payable(ca)).accumulateGasInUsdc(
                (_gasInEth * ethPrice()) / 1e8
            );
        }
    }

    /**
        认证签名并返回资产合约。不存在则返回0
     */
    function queryContractAddr(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    )
        external
        view
        _permit(eoa, nonce, signature)
        returns (address ca, uint256 balance, uint256 gasInUsdc)
    {
        ca = userContracts[eoa];
        if (ca != address(0)) {
            balance = ca.balance;
            gasInUsdc = UserContract(payable(ca)).gasUsedInUsdc();
        }
    }

    event CreateCa(address owner, address ca);
    event ChgPwd(address owner, address newOnwer, address ca);
    /**
        认证签名并创建新的资产合约
     */
    function permitRegister(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {
        if (userContracts[eoa] == address(0)) {
            address userContract = address(new UserContract());
            userContracts[eoa] = userContract;
            _checkAndSetNonce(userContract, nonce);
            emit CreateCa(eoa, userContract);
        }
    }

    /**
        认证新、旧签名并转移资产合约的owner。即修改密码。
     */
    function permitChgOwnerPwd(
        address eoa,
        uint256 nonce,
        bytes calldata signature,
        address eoa2, // 新密码对应的信息
        uint256 nonce2,
        bytes calldata signature2
    ) external _permit(eoa, nonce, signature) {
        require(userContracts[eoa] != address(0), "not registered!");

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, eoa2, nonce2) // _useNonce(eoa2))
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, signature2);

        require(signer == eoa2, "sign error 22 !");

        address userContract = userContracts[eoa];
        userContracts[eoa2] = userContract;
        userContracts[eoa] = address(0);
        _checkAndSetNonce(userContract, nonce);
        emit ChgPwd(eoa, eoa2, userContract);
    }

    /**
        认证签名并转出ETH
     */
    function permitTransferETH(
        address to,
        uint256 amount,
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external payable _permit(eoa, nonce, signature) {
        require(userContracts[eoa] != address(0), "not registered!");

        address ca = userContracts[eoa];
        _checkAndSetNonce(ca, nonce);
        UserContract(payable(ca)).transferETH(to, amount);
    }

    /**
        认证签名并转出token
     */
    function permitTransferToken(
        address token,
        address to,
        uint256 amount,
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {
        require(userContracts[eoa] != address(0), "not registered!");
        address ca = userContracts[eoa];
        _checkAndSetNonce(ca, nonce);
        UserContract(payable(ca)).transferToken(token, to, amount);
    }

    //////////////////////////// 下面的部分优先级降低
    //
    function permitTransferNFT(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {}

    function permitApprove(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {}

    function permitApproveNFT(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {}

    function permitApproveAllNFT(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {}

    function permitMarketSWAP(
        address eoa,
        uint256 nonce,
        bytes calldata signature
    ) external _permit(eoa, nonce, signature) {}
}
