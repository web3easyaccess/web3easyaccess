"use client";
import {
    getContract,
    formatEther,
    parseEther,
    encodeAbiParameters,
    encodeFunctionData,
    PrivateKeyAccount,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { mnemonicToAccount } from "viem/accounts";
import { chainPublicClient } from "../chainQueryClient";
import { walletClient } from "./chainClientInBrowser";

import abis from "../../serverside/blockchain/abi/abis";

import { type TypedData } from "viem";

import * as encoding from "@walletconnect/encoding";
import * as ethUtil from "ethereumjs-util";
import { TypedDataUtils } from "eth-sig-util";


// _permit(address eoa, uint256 nonce, uint8 v, bytes32 r, bytes32 s)

// "web3easyaccess", "1.0"
const domain = {
    name: "Account",
    version: "1",
    chainId: 0, // 11155111,
    verifyingContract: "", // "0x2CbF3FfFD865D8D5D427376fdF25f38c1666983A",
};

const types = {
    _permit: [
        { name: "_passwdAddr", type: "address" },
        { name: "_nonce", type: "uint256" },
        { name: "_argumentsHash", type: "bytes32" },
    ],
};

function sleep() {
    return new Promise((resolve) => setTimeout(resolve, 5000));
}

async function _queryNonce(chainCode: string, myAddr: string, myAccount: any) {
    try {
        const cpc = chainPublicClient(chainCode, myAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("_queryNonce from :", myAddr);
        const nonce = await cpc.publicClient.readContract({
            account: myAccount,
            address: myAddr,
            abi: abis.nonce,
            functionName: "nonce",
            args: [],
        });

        return nonce;
    } catch (e) {
        console.log(
            "==================_queryNonce error======================, myAddr=" +
            myAddr,
            e
        );
        throw new Error("_queryNonce error!");
    }
}

export const signAuth = async (
    passwdAccount: PrivateKeyAccount,
    chainId: string,
    verifyingContract: string,
    chainObj,
    argumentsHash: `0x${string}`, // keccak256(abi.encode(...))
    withZeroNonce: boolean
) => {
    const account = passwdAccount; // privateKeyToAccount(privateKey);

    let nonce = BigInt(0);
    console.log("signAuth,withZeroNonce=", withZeroNonce);
    if (!withZeroNonce) {
        nonce = await _queryNonce(
            chainObj.chainCode,
            verifyingContract,
            account
        );
        console.log("query, the nonce:", nonce);
    }

    domain.chainId = Number(chainId);
    domain.verifyingContract = verifyingContract;

    console.log("signAuth,domain:", domain, chainId);
    let signature = "";
    if (chainObj.chainCode.toString().indexOf("SOLANA") >= 0) {
        signature = "solana useless. signature.";
        console.log(signature);
    } else {
        signature = await walletClient(chainObj).signTypedData({
            account,
            domain,
            types,
            primaryType: "_permit",
            message: {
                _passwdAddr: account.address,
                _nonce: nonce,
                _argumentsHash: argumentsHash,
            },
        });
    }

    const rtn = {
        signature: signature,
        eoa: account.address,
        nonce: nonce.toString(),
    };
    console.log("my-signature:", rtn);
    return rtn;
};

// signAuth("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");



export const signPersonalMessage = async (
    passwdAccount: PrivateKeyAccount,
    chainId: string,
    verifyingContract: string,
    chainObj: any,
    msg: string,
    isTypedData: boolean
) => {

    let msgHash;
    if (isTypedData) {
        msgHash = hashTypedDataMessage(msg);
    } else {
        msgHash = hashPersonalMessage(msg);
    }

    console.log("w3ea,msg=>hash.", msg, "=>", msgHash);
    const sign = await signAuth(
        passwdAccount,
        chainId,
        verifyingContract,
        chainObj,
        msgHash,
        false
    );
    sign.msgHash = msgHash;
    return sign as {
        signature: string;
        eoa: `0x${string}`;
        nonce: string;
        msgHash: string;
    };
}


export function hashTypedDataMessage(msg: string): string {
    const data = encodeTypedDataMessage(msg);
    const buf = ethUtil.toBuffer(data);
    const hash = ethUtil.keccak256(buf);
    return ethUtil.bufferToHex(hash);
}

/*
error:
zzz1,encodeTypedDataMessage: {"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"PermitSingle":[{"name":"details","type":"PermitDetails"},{"name":"spender","type":"address"},{"name":"sigDeadline","type":"uint256"}],"PermitDetails":[{"name":"token","type":"address"},{"name":"amount","type":"uint160"},{"name":"expiration","type":"uint48"},{"name":"nonce","type":"uint48"}]},"primaryType":"PermitSingle","domain":{"name":"Permit2","chainId":"2810","verifyingContract":"0x9a5450d9c71fa9d6bf8df25e49313d7c3c42de60"},"message":{"details":{"token":"0x6dd7917d2558b88d7a4cb75ccbc05b83ee73ec0e","amount":"1461501637330902918203684832716283019655932542975","expiration":"1732583989","nonce":"0"},"spender":"0xc872fd87d4653146d6fb2af82c4bcc50595e4762","sigDeadline":"1729993789"}}

ok:
zzz1,encodeTypedDataMessage: {"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person"},{"name":"contents","type":"string"}]},"primaryType":"Mail","domain":{"name":"Ether Mail","version":"1","chainId":1,"verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"},"message":{"from":{"name":"Cow","wallet":"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},"to":{"name":"Bob","wallet":"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},"contents":"Hello, Bob!"}}

*/

export function encodeTypedDataMessage(msg: string): string {
    console.log("zzz1,encodeTypedDataMessage:", msg);
    const data = TypedDataUtils.sanitizeData(JSON.parse(msg));
    const buf = Buffer.concat([
        Buffer.from("1901", "hex"),
        TypedDataUtils.hashStruct("EIP712Domain", data.domain, data.types),
        TypedDataUtils.hashStruct(
            data.primaryType as string,
            data.message,
            data.types
        ),
    ]);
    return ethUtil.bufferToHex(buf);
}

function hashPersonalMessage(msg: string): string {
    const data = encodePersonalMessage(msg);
    const buf = ethUtil.toBuffer(data);
    const hash = ethUtil.keccak256(buf);
    return ethUtil.bufferToHex(hash);
}

function encodePersonalMessage(msg: string): string {
    const data = encoding.utf8ToBuffer(msg);
    const buf = Buffer.concat([
        Buffer.from(
            "\u0019Ethereum Signed Message:\n" + data.length.toString(),
            "utf8"
        ),
        data,
    ]);
    return ethUtil.bufferToHex(buf);
}
