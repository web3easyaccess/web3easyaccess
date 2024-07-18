pragma solidity ^0.8.20;

import "./IAccountLogic.sol";
import "./AccountEntity.sol";
import "../lib/openzeppelin-contracts/contracts/proxy/Clones.sol";
import "./W3EAPoint.sol";

contract Factory {
    address public entryEOA;
    address public w3eaPoint;

    mapping(uint256 => address) accounts;

    address public deployer;

    address accountTemplate;
    address public accountImpl;

    uint256 public admin1;
    uint256 public admin2;
    uint256 public admin3;

    uint256 constant AAA =
        0x1000000000000000000000000000000000000000000000000000000000000000;

    event CreateAccount(uint256 ownerId, address account);

    constructor() {}

    // wallet msg.sender should be using publish contract only. to manage nonce
    function init(
        address _entryEOA,
        address _accountEntityTemplate,
        address _accountImpl,
        address _admin1,
        address _admin2,
        address _admin3
    ) external {
        require(entryEOA == address(0), "has initialized");
        deployer = msg.sender;

        entryEOA = _entryEOA;

        accountTemplate = _accountEntityTemplate;
        accountImpl = _accountImpl; // AccountImplV1.sol
        w3eaPoint = address(new W3EAPoint());

        admin1 = uint256(uint160(_admin1));
        admin2 = uint256(uint160(_admin2));
        admin3 = uint256(uint160(_admin3));
    }

    receive() external payable {
        require(false, "can't receive");
    }

    function adminAuth() public {
        uint256 aSender = uint256(uint160(msg.sender));
        if (aSender == admin1) {
            admin1 += AAA;
        } else if (aSender == admin2) {
            admin2 += AAA;
        } else if (aSender == admin3) {
            admin3 += AAA;
        }
    }

    modifier authPass() {
        adminAuth();
        require(admin1 > AAA && admin2 > AAA && admin3 > AAA, "auth error");
        admin1 -= AAA;
        admin2 -= AAA;
        admin3 -= AAA;
        _;
    }

    function chgAdmin(uint256 aNo, address newAdmin) external authPass {
        if (aNo == 1) {
            admin1 = uint256(uint160(newAdmin));
        } else if (aNo == 2) {
            admin2 = uint256(uint160(newAdmin));
        } else if (aNo == 3) {
            admin3 = uint256(uint160(newAdmin));
        } else {
            require(false, "aNo error");
        }
    }

    function upgradeImpl(address _newImpl) external authPass {
        accountImpl = _newImpl;
    }

    function chgEntryEOA(address _entryEOA) external authPass {
        require(deployer != _entryEOA, "deployer can't be entry");
        entryEOA = _entryEOA;
    }

    modifier onlyEntryEOA() {
        require(entryEOA == msg.sender, "only entryEOA");
        _;
    }

    function queryAccount(uint256 _ownerId) external view returns (address) {
        return accounts[_ownerId];
    }

    function predictAccountAddress(
        uint256 _ownerId
    ) external view returns (address predicted) {
        predicted = Clones.predictDeterministicAddress(
            accountTemplate,
            bytes32(_ownerId),
            address(this)
        );
    }

    function _getBigBrotherAccount(
        uint256 _ownerId
    ) private view returns (address) {
        // max order smaller than 999
        // bigBrother's order equals ZERO.
        uint256 bigBrotherOwnerId = _ownerId &
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000;
        return
            bigBrotherOwnerId == _ownerId
                ? address(0)
                : accounts[bigBrotherOwnerId];
    }
    function _getPasswdAddr(
        uint256 _ownerId,
        address _passwdAddr
    ) private pure returns (address) {
        // max order smaller than 999
        // bigBrother's order equals ZERO.
        uint256 bigBrotherOwnerId = _ownerId &
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000;

        return bigBrotherOwnerId == _ownerId ? _passwdAddr : address(0);
    }

    function _getQuestionNos(
        uint256 _ownerId,
        string calldata _questionNos
    ) private pure returns (string memory) {
        // max order smaller than 999
        // bigBrother's order equals ZERO.
        uint256 bigBrotherOwnerId = _ownerId &
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000;

        return bigBrotherOwnerId == _ownerId ? _questionNos : "";
    }

    function newAccount(
        uint256 _ownerId, // _ownerId's suffix 16 bit means account Order.
        address _passwdAddr,
        string calldata _questionNos,
        uint256 depositFeeAmount
    ) external {
        _newAccount(
            _ownerId, // _ownerId's suffix 16 bit means account Order.
            _passwdAddr,
            _questionNos,
            depositFeeAmount
        );
    }

    function _newAccount(
        uint256 _ownerId, // _ownerId's suffix 16 bit means account Order.
        address _passwdAddr,
        string calldata _questionNos,
        uint256 _depositFeeAmount
    ) private onlyEntryEOA {
        require(accounts[_ownerId] == address(0), "user exists!");

        address acct = Clones.cloneDeterministic(
            accountTemplate,
            bytes32(_ownerId)
        );

        emit CreateAccount(_ownerId, acct);

        AccountEntity(payable(acct)).initImpl(accountImpl);

        IAccountLogic(payable(acct)).initByFactory(
            entryEOA,
            _getBigBrotherAccount(_ownerId),
            _getPasswdAddr(_ownerId, _passwdAddr),
            _getQuestionNos(_ownerId, _questionNos),
            _depositFeeAmount
        ); // gasFreeAmount);

        W3EAPoint(w3eaPoint).regAccount(acct);

        accounts[_ownerId] = address(acct);
    }

    function newAccountAndSendTrans(
        uint256 _ownerId, // _ownerId's suffix 16 bit means account Order.
        address _passwdAddr,
        string calldata _questionNos,
        uint256 _depositFeeAmount,
        //
        // transaction Params:
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _estimatedFee,
        bytes memory _signature
    ) external returns (bytes memory rtnData) {
        _newAccount(
            _ownerId, // _ownerId's suffix 16 bit means account Order.
            _passwdAddr,
            _questionNos,
            _depositFeeAmount
        );

        bytes memory sendData = abi.encodeWithSignature(
            "sendTransaction(address,uint256,bytes,uint256,address,bytes)",
            _to,
            _amount,
            _data,
            _estimatedFee,
            _passwdAddr,
            _signature
        );
        (bool success, bytes memory returndata) = (accounts[_ownerId]).call(
            sendData
        );
        if (!success) {
            require(returndata.length > 0, "Call SendTransaction Failed");

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
    }

    function increaseGasFreeAmount(
        address acct,
        uint256 amount
    ) external onlyEntryEOA {
        IAccountLogic(payable(acct)).increaseGasFreeAmount(amount);
    }
}
