"use client";
import {
  getContract,
  formatEther,
  parseEther,
  encodeAbiParameters,
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

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
    { name: "_ownerId", type: "uint256" },
    { name: "_passwdAddr", type: "address" },
    { name: "_nonce", type: "uint256" },
  ],
};

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 5000));
}

// 需要修改   chainId 与 verifyingContract

export const signAuth = async (
  ownerId: string,
  privateKey: `0x${string}`,
  chainId: string,
  verifyingContract: string,
  currentNet
) => {
  const account = privateKeyToAccount(privateKey);
  const nonce = BigInt(new Date().getTime());

  domain.chainId = Number(chainId);
  domain.verifyingContract = verifyingContract;

  console.log("signAuth,domain:", domain);

  const signature = await walletClient(currentNet).signTypedData({
    account,
    domain,
    types,
    primaryType: "_permit",
    message: {
      _ownerId: ownerId,
      _passwdAddr: account.address,
      _nonce: nonce,
    },
  });

  console.log("my-signature:", signature);
  return {
    ownerId: ownerId,
    signature: signature,
    eoa: account.address,
    nonce: nonce.toString(),
  };
};

// signAuth("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
