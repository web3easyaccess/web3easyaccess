"use client";
import {
  getContract,
  formatEther,
  parseEther,
  encodeAbiParameters,
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { mnemonicToAccount } from "viem/accounts";

import { walletClient } from "./chainClientInBrowser";

import { type TypedData } from "viem";

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

// 需要修改   chainId 与 verifyingContract

export const signAuth = async (
  passwdAccount,
  chainId: string,
  verifyingContract: string,
  chainObj,
  argumentsHash: `0x${string}` // keccak256(abi.encode(...))
) => {
  const account = passwdAccount; // privateKeyToAccount(privateKey);
  const nonce = BigInt(new Date().getTime());

  domain.chainId = Number(chainId);
  domain.verifyingContract = verifyingContract;

  console.log("signAuth,domain:", domain);

  const signature = await walletClient(chainObj).signTypedData({
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

  const rtn = {
    signature: signature,
    eoa: account.address,
    nonce: nonce.toString(),
  };
  console.log("my-signature:", rtn);
  return rtn;
};

// signAuth("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
