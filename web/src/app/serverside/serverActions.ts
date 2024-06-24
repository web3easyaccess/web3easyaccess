"use server";

// import { signIn } from "@/auth";

import redirectTo from "./redirectTo";

import myCookies from "./myCookies";
import { sendMail } from "./mailService";
import {
  queryAccount,
  newAccount,
  transferETH,
  chgPasswdAddr,
} from "../serverside/blockchain/callAdmin";

import { queryEthBalance } from "../serverside/blockchain/queryAccountInfo";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { setChainCode } from "./blockchain/myChain";

import { parseEther } from "viem";

export async function saveChainName(
  _currentState: unknown,
  formData: FormData
) {
  const inputDataJson = formData.get("inputDataJson");
  console.log("server saveChainName....inputDataJson:", inputDataJson);
  const chainName = JSON.parse(inputDataJson).value;
  setChainCode(chainName);
  return JSON.stringify({ status: "success" });
}

const verifyCode = {};

export async function test001(_currentState: unknown, formData: FormData) {
  const inputDataJson = formData.get("inputDataJson");
  console.log("inputDataJsonxxxx:", inputDataJson);
  var obj = JSON.parse(inputDataJson);
  obj.kk = "kk123";
  await sleep(5000);
  console.log("inputDataJsonxxxx2::", inputDataJson);
  return JSON.stringify(obj);
}

export async function checkEmail(_currentState: unknown, formData: FormData) {
  try {
    await signIn("credentials", formData);

    const email = formData.get("email");
    console.log("email000:", email);

    //
    const sixNum = generateRandomSixDigitInteger().toString();
    verifyCode[email] = sixNum;
    // await sendMail(email, sixNum); // ignore tmp.
    console.log("sent email", email, "::", sixNum);
    var msg =
      "has sent verify code to " + email + ", please check it!" + " " + sixNum;
    console.log(msg);
    return msg; // new user
  } catch (error) {
    console.log("checkEmail error:", error);
    if (error) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function verifyEmail(_currentState: unknown, formData: FormData) {
  const email = formData.get("email");
  const code = formData.get("code");

  console.log("verifyEmail", email, code);

  if (verifyCode[email] == code) {
    console.log("verify success!", email, code);

    delete verifyCode[email];

    let md = myCookies.flushData(email);

    // update accountId from chain, and loadData again.
    const ownerId = myCookies.loadData().ownerId;
    const accountId = await queryAccount(ownerId);
    myCookies.setAccountId(accountId);
    md = myCookies.loadData();

    if (
      md.accountId == popularAddr.ZERO_ADDR ||
      md.accountId == popularAddr.ZERO_ADDRError
    ) {
      console.log(
        `verifyEmail-current owner ${email} havn't account, redirect to urlPrivateinfo.`
      );
      redirectTo.urlPrivateinfo();
    } else {
      console.log(
        `verifyEmail-current owner ${email} have account ${md.accountId}, redirect to urlDashboard.`
      );
      redirectTo.urlDashboard();
    }
    // return "";
  } else {
    console.log("verify failure!", email, code);
    return "verify code invalid";
  }
}

export async function createAccount(
  _currentState: unknown,
  formData: FormData
) {
  const ownerId = formData.get("ownerId");
  const passwdAddr = formData.get("passwd_addr");

  var accountId = await queryAccount(ownerId);

  console.log("createAccount. accountId before create:", accountId);

  if (accountId.toString() == popularAddr.ZERO_ADDR) {
    // create new account
    await newAccount(ownerId, passwdAddr);

    for (let kk = 0; kk < 600; kk++) {
      accountId = await queryAccount(ownerId);
      if (accountId.toString() == popularAddr.ZERO_ADDR) {
        console.log("waiting for creating new account...", kk);
        await sleep(1000);
      } else {
        console.log("created new account:", accountId);
        break;
      }
    }
  } else {
  }
  myCookies.setAccountId(accountId.toString());

  console.log("createAccount, ownerId:", ownerId);
  console.log("createAccount, ownerAddr:", passwdAddr);

  redirectTo.urlDashboard();
}

export async function getEthBalance(accountId: string) {
  if (
    accountId == popularAddr.ZERO_ADDR ||
    accountId == popularAddr.ZERO_ADDRError
  ) {
    return "0.0";
  }
  const v = await queryEthBalance(accountId);
  console.log("getEthBalance,", accountId, ":", v);
  return v;
}

export async function getTransactions(accountId: string) {
  const v = await queryTransactions(accountId);
  console.log("getTransactions,", accountId, ":", v);
  return v;
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function newTransaction(
  _currentState: unknown,
  formData: FormData
) {
  redirectTo.urlLoggedInCheck();
  try {
    const receiverAddr = formData.get("receiver_addr");
    console.log("newTransaction-receiverAddr:", receiverAddr);
    const amount = formData.get("amount");
    console.log("newTransaction-amount:", amount);

    const passwdAddr = formData.get("passwd_addr");
    console.log("newTransaction-passwdAddr:", passwdAddr);
    const nonce = formData.get("nonce");
    const signature = formData.get("signature");
    const inputData = formData.get("input_data");
    console.log("newTransaction-inputData:", inputData);

    const ownerId = formData.get("owner_id");

    await transferETH(
      ownerId,
      `0x${receiverAddr.substring(2)}`,
      parseEther(amount),
      `0x${passwdAddr.substring(2)}`,
      BigInt(nonce),
      `0x${signature.substring(2)}`
    );
  } catch (error) {
    throw error;
  }
}

export async function chgPrivateInfo(
  _currentState: unknown,
  formData: FormData
) {
  redirectTo.urlLoggedInCheck();
  try {
    const newPasswdAddr = formData.get("passwd_addr");
    console.log("chgPrivateInfo-newPasswdAddr:", newPasswdAddr);

    const oldPasswdAddr = formData.get("old_passwd_addr");
    console.log("chgPrivateInfo-oldPasswdAddr:", oldPasswdAddr);
    const nonce = formData.get("nonce");
    console.log("chgPrivateInfo-nonce:", nonce);
    const signature = formData.get("signature");
    console.log("chgPrivateInfo-signature:", signature);
    if (!signature || signature == undefined || signature == "") {
      console.log("chgPrivateInfo-signature, invalid submit!");
      return;
    }
    const inputData = formData.get("input_data");
    console.log("chgPrivateInfo-inputData:", inputData);
    const ownerId = formData.get("owner_id");
    console.log("chgPrivateInfo-ownerId:", ownerId);

    await chgPasswdAddr(
      ownerId,
      `0x${newPasswdAddr.substring(2)}`,
      `0x${oldPasswdAddr.substring(2)}`,
      BigInt(nonce),
      `0x${signature.substring(2)}`
    );
  } catch (error) {
    throw error;
  }
}

async function signIn(cd, formData) {
  console.log("signIn:", cd, formData);
  return true;
}

function generateRandomSixDigitInteger() {
  const min = 100000; // Minimum 6-digit integer
  const max = 999999; // Maximum 6-digit integer

  // Generate a random number between min and max
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the random number to a string
  const randomString = randomNumber.toString();

  // Pad the string with leading zeros if necessary
  const paddedString = randomString.padStart(6, "0");

  // Convert the padded string back to an integer
  const randomSixDigitInteger = parseInt(paddedString);

  return randomSixDigitInteger;
}
