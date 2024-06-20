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

import abis from "./abi/abis";

/**
 */
export async function queryAccount(ownerAddr: `0x${string}`) {
  try {
    const accountAddr = await publicClient.readContract({
      account: account,
      address: adminAddr,
      abi: abis.queryAccount,
      functionName: "queryAccount",
      args: [ownerAddr],
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
  emailKey: `0x${string}`,
  ownerAddr: `0x${string}`
) {
  console.log(`newAccount called ... ownerId= ${ownerAddr}`);
  var newAccountData;
  try {
    newAccountData = encodeFunctionData({
      abi: abis.newAccount,
      functionName: "newAccount",
      args: [emailKey, ownerAddr],
    });

    const hash = await walletClient.sendTransaction({
      account: account,
      to: adminAddr,
      value: BigInt(0), // parseEther("0.0"),
      data: newAccountData,
    });

    console.log(`newAccount, hash=${hash}`);
    return hash;
  } catch (e) {
    console.log("newAccount error:", e);
    return popularAddr.ZERO_ADDRError;
  }
}

export async function transferETH(
  emailKey: `0x${string}`,
  to: `0x${string}`,
  amount: bigint,
  ownerAddr: `0x${string}`,
  nonce: bigint,
  signature: `0x${string}`
) {
  console.log(`transferETH called ... ownerId= ${ownerAddr}, amount=${amount}`);
  var callAccountData;

  try {
    callAccountData = encodeFunctionData({
      abi: abis.transferETH,
      functionName: "transferETH",
      args: [to, amount, ownerAddr, nonce, signature],
    });

    console.log("transferETH , _execute");
    const hash = await _execute(emailKey, callAccountData);

    console.log(`transferETH finished, transHash=${hash}`);
    return hash;
  } catch (e) {
    console.log("transferETH error:ownerAddr=" + ownerAddr + ":", e);
    return popularAddr.ZERO_ADDRError;
  }
}

async function _execute(
  emailKey: `0x${string}`,
  callAccountData: `0x${string}`
) {
  console.log(`_execute callAccountData= ${callAccountData}`);
  var callAdminData = encodeFunctionData({
    abi: abis.execute,
    functionName: "execute",
    args: [emailKey, callAccountData],
  });

  console.log(`_execute callAdminData= ${callAdminData}`);

  const hash = await walletClient.sendTransaction({
    account: account,
    to: adminAddr,
    value: BigInt(0), // parseEther("0.0"),
    data: callAdminData,
  });
  console.log(`_execute hash=${hash}`);
  return hash;
}
