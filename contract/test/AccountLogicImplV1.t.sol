pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import "../src/AccountEntity.sol";
import "../src/AccountLogicImplV1.sol";
import "../src/FactoryLogicV1.sol";
import "../src/FactoryProxy.sol";
import "../src/W3EAPoint.sol";
import "../src/IAccountLogic.sol";

import "./MyToken.sol";

import {MessageHashUtils} from "../lib/openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

contract AccountImplV1Test is Test {
    AccountEntity public accountTemplate;
    AccountLogicImplV1 public acctImplV1;
    W3EAPoint public w3eaPoint;

    MyToken public mtk;

    Factory public factory;

    address adminForBuildContract = address(0x1000);
    address entryEOA = address(0x1001);
    address entryEOA2 = address(0x1002);
    address user2 = address(0x1002);
    address user3 = address(0x1003);

    uint256 ownerId =
        (0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef <<
            16) &
            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000;
    uint256 passwdPrivate = 0x123456;
    address passwdAddr = vm.addr(passwdPrivate);

    function setUp() public {
        deal(adminForBuildContract, 1e18);
        deal(entryEOA, 1e18);
        deal(entryEOA2, 1e18);
        deal(user2, 1e18);
        deal(user3, 1e18);

        mtk = new MyToken();
        mtk.transfer(adminForBuildContract, 1000);
        mtk.transfer(entryEOA, 2000);
        mtk.transfer(user2, 3000);
        mtk.transfer(user3, 4000);
    }

    function deploySysContracts() private {
        accountTemplate = new AccountEntity();
        acctImplV1 = new AccountLogicImplV1();
        Factory factoryLogic = new Factory();
        factory = Factory(
            payable(address(new FactoryProxy(address(factoryLogic), "")))
        );
        factory.init(
            entryEOA,
            address(accountTemplate),
            address(acctImplV1),
            address(0x7701),
            address(0x7702),
            address(0x7703)
        );
        console.log("w3eaPoint:", factory.w3eaPoint());

        w3eaPoint = W3EAPoint(factory.w3eaPoint());
    }

    function predictAndCreateAccount(
        uint256 depositFeeAmount
    ) private returns (address) {
        console.log("ownerId:", ownerId);
        console.log("acctImplV1:", address(acctImplV1));
        console.logBytes32(bytes32(ownerId));
        address pa = factory.predictAccountAddress(ownerId);
        console.log("predictAccountAddress:", pa);
        console.log("score1:", w3eaPoint.balanceOf(pa));
        // payable(pa).transfer(1 ether);
        console.log(
            "before newAccount,acct:",
            factory.queryAccount(ownerId),
            pa.balance
        );

        factory.newAccount(ownerId, passwdAddr, "123", depositFeeAmount);
        console.log("score2:", w3eaPoint.balanceOf(pa));

        address myAccount = factory.queryAccount(ownerId);
        console.log("after newAccount,acct:", myAccount);
        console.log("after newAccount,balance + freeFee:", myAccount.balance);
        console.log(AccountEntity(payable(myAccount)).gasFreeAmount());
        assertEq(pa, myAccount);
        return myAccount;
    }

    function test_account1() public {
        vm.startPrank(adminForBuildContract);
        deploySysContracts();
        vm.stopPrank();
        deal(entryEOA, 10 * 1e18);
        vm.startPrank(entryEOA);

        uint256 transferAmount = 1e18;

        address myAccount = predictAndCreateAccount(0);
        payable(myAccount).transfer(transferAmount * 2 + 400);

        console.log("score4:", w3eaPoint.balanceOf(myAccount));

        uint256 nonce = AccountEntity(payable(myAccount)).nonce();

        bytes memory data = "";
        uint256 efee = 1e15;
        bytes32 argumentsHash = keccak256(
            abi.encode(3, user2, transferAmount, data, efee)
        );
        uint256 b1 = myAccount.balance;
        uint256 b2 = user2.balance;
        console.log("before call1:", b1);
        console.log("before call2:", b2);

        console.log("argumentsHash:");
        console.logBytes32(argumentsHash);

        bytes memory ddd = abi.encodeWithSignature(
            "sendTransaction(address,uint256,bytes,uint256,address,bytes)",
            user2,
            transferAmount,
            data,
            efee,
            passwdAddr,
            generateSendTransactionSignature(
                myAccount,
                passwdAddr,
                argumentsHash
            )
        );

        console.log("score5-1:", w3eaPoint.balanceOf(myAccount));
        (bool ok, bytes memory res) = myAccount.call{value: 0}(ddd);
        assertEq(ok, true);

        console.log("score5-2:", w3eaPoint.balanceOf(myAccount));

        console.log("oookkkk:", ok, myAccount.balance);
        console.log("after call1:", myAccount.balance);
        console.log("after call2:", user2.balance);
        console.logBytes(res);
        assertEq(b1 - myAccount.balance, user2.balance - b2);
    }

    function test_sendTransactionWithNewAccount() public {
        vm.startPrank(adminForBuildContract);
        deploySysContracts();
        vm.stopPrank();
        deal(entryEOA, 10 * 1e18);

        vm.startPrank(entryEOA);
        // factory.chgEntryEOA(entryEOA2);
        //  vm.startPrank(entryEOA2);
        address myAccount = factory.predictAccountAddress(ownerId);
        (payable(myAccount)).transfer(1e17);
        uint256 transferAmount = 0;
        uint256 efee = 1e15;

        bytes32 argumentsHash = keccak256(
            abi.encode(3, user2, transferAmount, "", efee)
        );

        factory.newAccountAndSendTrans(
            ownerId,
            passwdAddr,
            "**",
            0,
            user2,
            transferAmount,
            "",
            efee,
            generateSendTransactionSignature(
                myAccount,
                passwdAddr,
                argumentsHash
            )
        );

        uint256 b1 = myAccount.balance;
        uint256 b2 = user2.balance;
        console.log("before call1:", b1);
        console.log("before call2:", b2);

        console.log("argumentsHash:");
        console.logBytes32(argumentsHash);

        console.log("score5-2:", w3eaPoint.balanceOf(myAccount));

        console.log("oookkkk:", myAccount.balance);
        console.log("after call1:", myAccount.balance);
        console.log("after call2:", user2.balance);

        assertEq(b1 - myAccount.balance, user2.balance - b2);
    }

    function test_transferToken() public {
        vm.startPrank(adminForBuildContract);
        deploySysContracts();
        vm.stopPrank();

        vm.startPrank(entryEOA);

        address myAccount = predictAndCreateAccount(1e15);
        console.log("owner balance1:", mtk.balanceOf(entryEOA));
        console.log("acct balance2:", mtk.balanceOf(myAccount));
        mtk.transfer(myAccount, 100);

        // factory.chgEntryEOA(entryEOA2);
        // vm.startPrank(entryEOA2);

        console.log("owner balance3:", mtk.balanceOf(entryEOA));
        console.log("acct balance4:", mtk.balanceOf(myAccount));
        console.log("user2 balance4:", mtk.balanceOf(user2));
        console.log("user3 balance4:", mtk.balanceOf(user3));

        console.log("score5666-2:", w3eaPoint.balanceOf(myAccount));
        bytes memory data_transfer = abi.encodeWithSignature(
            "transfer(address,uint256)",
            user3,
            50
        );
        uint256 transferAmount = 0;
        uint256 efee = 1e15;
        bytes32 argumentsHash = keccak256(
            abi.encode(3, address(mtk), transferAmount, data_transfer, efee)
        );

        console.log("argumentsHash:");
        console.logBytes32(argumentsHash);

        //  sendTransaction(
        //     address to,
        //     uint256 amount,
        //     bytes calldata data,
        //     uint256 estimatedFee,
        //     address _passwdAddr,
        //     uint256 _nonce,
        //     bytes memory _signature
        // );

        bytes memory ddd = abi.encodeWithSignature(
            "sendTransaction(address,uint256,bytes,uint256,address,bytes)",
            address(mtk), // to
            0, // amount
            data_transfer, //
            efee,
            passwdAddr,
            generateSendTransactionSignature(
                myAccount,
                passwdAddr,
                argumentsHash
            )
        );

        (bool ok, bytes memory res) = myAccount.call{value: 0}(ddd);
        assertEq(ok, true);

        console.log("score9999-2:", w3eaPoint.balanceOf(myAccount));
        console.log("oookkkk:", ok, myAccount.balance);
        console.log("after call1:", mtk.balanceOf(myAccount));
        console.log("after call2-user2:", mtk.balanceOf(user2));
        console.log("after call2-user3:", mtk.balanceOf(user3));
        console.logBytes(res);
        // assertEq(b1 - myAccount.balance, user2.balance - b2);
    }

    function generateSendTransactionSignature(
        address account,
        address _passwdAddr,
        bytes32 _argumentsHash
    ) public view returns (bytes memory) {
        // hashing typed structured data
        bytes32 digest = getTypedDataHash(
            account,
            _passwdAddr,
            0, // AccountEntity(payable(account)).nonce(),
            _argumentsHash
        );

        // signing with private key and typed data hash.
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(passwdPrivate, digest);

        bytes memory signature = new bytes(65); // 65 bytes for ECDSA signature
        // Append r value
        assembly {
            mstore(add(signature, 0x20), r)
        }
        // Append s value
        assembly {
            mstore(add(signature, 0x40), s)
        }
        // Append v value
        signature[64] = bytes1(v); // Since v is a single byte, we can directly assign it
        console.logBytes(signature);
        // call smart contrat with signature
        return signature;
    }

    function getTypedDataHash(
        address account,
        address _passwdAddr,
        uint256 _nonce,
        bytes32 _argumentsHash
    ) public view returns (bytes32) {
        bytes32 PERMIT_TYPEHASH = keccak256(
            "_permit(address _passwdAddr,uint256 _nonce,bytes32 _argumentsHash)"
        );
        return
            // PERMIT_TYPEHASH, _passwdAddr, _nonce, _argumentsHash
            // same as:  keccak256(abi.encodePacked("\x19\x01",DOMAIN_SEPARATOR,keccak256(...)));
            MessageHashUtils.toTypedDataHash(
                // IAccountLogic(payable(account)).DOMAIN_SEPARATOR(),
                _buildDomainSeparator(account),
                keccak256(
                    abi.encode(
                        PERMIT_TYPEHASH,
                        _passwdAddr,
                        _nonce,
                        _argumentsHash
                    )
                )
            );
    }

    function _buildDomainSeparator(
        address accountAddr
    ) private view returns (bytes32) {
        bytes32 TYPE_HASH = keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

        bytes32 _hashedName = keccak256(bytes("Account"));
        bytes32 _hashedVersion = keccak256(bytes("1"));

        return
            keccak256(
                abi.encode(
                    TYPE_HASH,
                    _hashedName,
                    _hashedVersion,
                    block.chainid,
                    accountAddr // address(this)
                )
            );
    }

    function test_auth() public {
        /*
                address _entryEOA,
        address _accountEntityTemplate,
        address _accountImpl,
        address _admin1,
        address _admin2,
        address _admin3
        */

        Factory factoryLogic = new Factory();
        factory = Factory(
            payable(address(new FactoryProxy(address(factoryLogic), "")))
        );
        factory.init(
            address(0x1),
            address(0x2),
            address(0x3),
            address(0x101),
            address(0x102),
            address(0x103)
        );

        console.logBytes32(bytes32(factory.admin1()));
        console.logBytes32(bytes32(factory.admin2()));
        console.logBytes32(bytes32(factory.admin3()));

        vm.startPrank(address(0x101));
        factory.adminAuth();

        console.logBytes32(bytes32(factory.admin1()));
        console.logBytes32(bytes32(factory.admin2()));
        console.logBytes32(bytes32(factory.admin3()));

        vm.startPrank(address(0x102));
        factory.adminAuth();
        vm.startPrank(address(0x103));

        console.logBytes32(bytes32(factory.admin1()));
        console.logBytes32(bytes32(factory.admin2()));
        console.logBytes32(bytes32(factory.admin3()));

        console.logBytes32(bytes32(factory.admin1()));
        console.log("impl1:");
        console.logAddress(factory.accountImpl());
        factory.upgradeImpl(address(0x333));
        console.log("impl2:");
        console.logAddress(factory.accountImpl());

        console.logBytes32(bytes32(factory.admin1()));
        console.logBytes32(bytes32(factory.admin2()));
        console.logBytes32(bytes32(factory.admin3()));
    }
}
