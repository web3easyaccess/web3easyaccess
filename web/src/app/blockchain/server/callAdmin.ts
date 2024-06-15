"use server";

import popularAddr from "../client/popularAddr";

import {
  getContract,
  formatEther,
  parseEther,
  encodeAbiParameters,
  encodeFunctionData,
} from "viem";

import {
  publicClient,
  account,
  walletClient,
  adminAddr,
} from "./chainClientOnServer";

import abi from "./abi/administratorAbi";

/**
 */
export async function queryAccount(ownerId: `0x${string}`) {
  try {
    const accountAddr = await publicClient.readContract({
      account: account,
      address: adminAddr,
      abi: abi.queryAccount,
      functionName: "queryAccount",
      args: [ownerId],
    });

    /*
      { name: "ca", type: "address", internalType: "address" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "gasInUsdc", type: "uint256", internalType: "uint256" },
*/
    // info["gasInUsdc"] = "0.456";
    return accountAddr;
  } catch (e) {
    console.log(
      "==================queryAccount error======================:",
      e
    );
    return popularAddr.ZERO_ADDRError;
  }
}

export async function newAccount(
  ownerId: `0x${string}`,
  passwdAddr: `0x${string}`
) {
  console.log(`newAccount called ... ownerId= ${ownerId}`);
  var encodedData;
  try {
    encodedData = encodeFunctionData({
      abi: abi.newAccount,
      functionName: "newAccount",
      args: [ownerId, passwdAddr],
    });
    console.log(`newAccount called2 ... ownerId= ${ownerId}`);
    const hash = await walletClient.sendTransaction({
      account: account,
      to: adminAddr,
      value: BigInt(0), // parseEther("0.0"),
      data: encodedData,
    });

    console.log(`newAccount finished, ownerId=${ownerId}, trans=${hash}`);
    return hash;
  } catch (e) {
    console.log("newAccount error:", e);
    return popularAddr.ZERO_ADDRError;
  }
}

export async function transferETH(
  to: `0x${string}`,
  amount: bigint,
  ownerId: `0x${string}`,
  passwdAddr: `0x${string}`,
  nonce: bigint,
  signature: `0x${string}`
) {
  console.log(`transferETH called ... ownerId= ${ownerId}, amount=${amount}`);
  var encodedData;
  try {
    encodedData = encodeFunctionData({
      abi: abi.transferETH,
      functionName: "transferETH",
      args: [to, amount, ownerId, passwdAddr, nonce, signature],
    });

    console.log(
      `transferETH called2 ... ownerId= ${ownerId}, amount=${amount}`
    );
    const hash = await walletClient.sendTransaction({
      account: account,
      to: adminAddr,
      value: BigInt(0), // parseEther("0.0"),
      data: encodedData,
    });

    console.log(`transferETH finished, ownerId=${ownerId}, transHash=${hash}`);
    return hash;
  } catch (e) {
    console.log("transferETH error:" + ownerId + ":", e);
    return popularAddr.ZERO_ADDRError;
  }
}
