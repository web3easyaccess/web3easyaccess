// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
// import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

import {ECDSA} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";

import {IERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "../lib/openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";

import {Address} from "../lib/openzeppelin-contracts/contracts/utils/Address.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract Account is EIP712, ReentrancyGuard {
    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256(
            "_permit(address _passwdAddr,uint256 _nonce,bytes32 _argumentsHash)"
        );

    address[4] public agents;
    address private passwdAddr;
    uint256 private lastNonce;

    /**
        gas fees that can be paid free of charge by the system.(wei)
     */
    uint256 public gasFreeAmount;

    /**
        password question's number, which was encrypted.
     */
    string public questionNos;

    event InitAccount(address passwdAddr, address agent);
    event ChgAgent(address newAgent);
    event ChgPasswdAddr(address newPasswdAddr);
    event TransferETH(address to, uint256 amount);
    event TransferToken(address token, address to, uint256 amount);

    constructor() EIP712("Account", "1") {
        agents[0] = msg.sender;
        agents[1] = msg.sender;
        agents[2] = msg.sender;
        agents[3] = msg.sender;
    }

    function initAgent() external {
        agents[0] = msg.sender;
        agents[1] = msg.sender;
        agents[2] = msg.sender;
        agents[3] = msg.sender;
    }

    function onlyAgent() private view {
        uint256 k = 0;
        for (; k < agents.length; k++) {
            if (msg.sender == agents[k]) {
                break;
            }
        }
        require(k < agents.length, "only agents!");
    }

    receive() external payable {}

    function increaseGasFreeAmount(uint256 amount) external {
        onlyAgent();
        gasFreeAmount += amount;
    }

    error TransferGas(address to, bytes message);
    function transferGasToAgent(
        address agentController,
        uint256 feeAmount
    ) external {
        onlyAgent();
        (bool success, bytes memory returndata) = agentController.call{
            value: feeAmount
        }("");
        if (!success) {
            revert TransferGas(msg.sender, returndata);
        }
        // require(success, "tranfer fee failed.");
    }

    function initPasswdAddr(
        address _passwdAddr,
        string calldata _questionNos
    ) external {
        onlyAgent();
        if (passwdAddr == address(0)) {
            passwdAddr = _passwdAddr;
            questionNos = _questionNos;
            emit InitAccount(_passwdAddr, msg.sender);
        }
    }

    // function queryPasswdAddrAddr() external view returns (address) {
    //     require(msg.sender == agent, "only agent!");
    //     return passwdAddr;
    // }

    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    // include: Reentrancy Guard
    modifier _permit(
        address _passwdAddr,
        uint256 _nonce, // same nonce can be used only once on the offchain application server
        bytes memory _signature,
        bytes32 _argumentsHash
    ) {
        onlyAgent();

        require(
            _nonce > lastNonce && _nonce < block.timestamp * 1000 + 604800000, // must be in 7 days.
            "nonce invalid!"
        );

        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, _passwdAddr, _nonce, _argumentsHash) // _useNonce(eoa))
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, _signature);

        require(signer == passwdAddr, "permit error!");

        lastNonce = _nonce;

        _;
    }

    // todo 后面改为 deletegate call, 实现合约的升级需要用户签名. 同时后面审慎考虑使用multicall.

    /**
        It means changing password
    */
    function chgPasswdAddr(
        address _newPasswdAddr,
        string calldata _newQuestionNos,
        address _passwdAddr,
        uint256 _nonce,
        bytes memory _signature
    )
        external
        _permit(
            _passwdAddr,
            _nonce,
            _signature,
            keccak256(
                abi.encode(_newPasswdAddr, keccak256(bytes(_newQuestionNos)))
            )
        )
    {
        passwdAddr = _newPasswdAddr;
        questionNos = _newQuestionNos;
        emit ChgPasswdAddr(_newPasswdAddr);
    }

    function sendTransaction(
        address to,
        uint256 amount,
        bytes calldata data,
        address _passwdAddr,
        uint256 _nonce,
        bytes memory _signature
    )
        external
        payable
        _permit(
            //
            _passwdAddr,
            _nonce,
            _signature,
            keccak256(abi.encode(to, amount, data))
        )
        returns (bytes memory rtnData)
    {
        rtnData = Address.functionCallWithValue(to, data, amount);
    }

    /**
        ETH
     */
    function transferETH(
        address to,
        uint256 amount,
        address _passwdAddr,
        uint256 _nonce,
        bytes memory _signature
    )
        external
        payable
        _permit(
            _passwdAddr,
            _nonce,
            _signature,
            keccak256(abi.encode(to, amount))
        )
    {
        Address.sendValue(payable(to), amount);
    }

    /**
        ERC20 token
     */
    function transferToken(
        address tokenAddr,
        address to,
        uint256 amount,
        address _passwdAddr,
        uint256 _nonce,
        bytes memory _signature
    )
        external
        _permit(
            _passwdAddr,
            _nonce,
            _signature,
            keccak256(abi.encode(tokenAddr, to, amount))
        )
    {
        require(
            amount <= IERC20(tokenAddr).balanceOf(address(this)),
            "token balance is not enough!"
        );
        IERC20(tokenAddr).transfer(to, amount);
    }

    function transferNFT(
        address tokenAddr,
        address to,
        uint256 tokenId,
        address _passwdAddr,
        uint256 _nonce,
        bytes memory _signature
    )
        external
        _permit(
            _passwdAddr,
            _nonce,
            _signature,
            keccak256(abi.encode(tokenAddr, to, tokenId))
        )
    {
        // require(
        //     IERC721(tokenAddr).ownerOf(tokenId) == address(this),
        //     "nft's owner error"
        // );
        IERC721(tokenAddr).transferFrom(address(this), to, tokenId);
    }
}
