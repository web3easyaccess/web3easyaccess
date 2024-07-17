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

import { generateRandomDigitInteger } from "../lib/myRandom";

import { queryEthBalance } from "../serverside/blockchain/queryAccountInfo";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { setChainCode, getChainObj } from "./blockchain/myChain";

import { parseEther } from "viem";

export async function saveChainName(
  _currentState: unknown,
  formData: FormData
) {
  const inputDataJson = formData.get("inputDataJson");
  console.log("server saveChainName....inputDataJson:", inputDataJson);
  const chainName = JSON.parse(inputDataJson).value;
  const oldChainName = getChainObj().chainCode;
  setChainCode(chainName);
  if (oldChainName != chainName) {
    // redirectTo.urlLogin();
  }
  return JSON.stringify({
    msg: "success, now chainName in cookie was:" + chainName,
  });
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
    const email = formData.get("email");
    console.log("email000:", email);
    if (
      myCookies.getChainCode() == undefined ||
      myCookies.getChainCode() == null ||
      myCookies.getChainCode() == ""
    ) {
      return JSON.stringify({ success: false, msg: "please select a chain!" });
    }
    if (myCookies.loadData()?.email == email) {
      const ownerId = myCookies.loadData().ownerId;
      const accountId = await queryAccount(ownerId);
      console.log(
        `query accountId when reuse email,  ownerId=${ownerId}, accountId=${accountId}`
      );
      myCookies.setAccountId(accountId);
      return JSON.stringify({ success: true, msg: "[existing]" });
    }
    //
    const sixNum = generateRandomDigitInteger().toString();
    verifyCode[email] = sixNum + ":" + new Date().valueOf();
    // await sendMail(email, sixNum); // ignore tmp.
    console.log("sent email", email, "::", sixNum);
    // Please log in to your email address "123@a.com" and check for the verification code.
    var rtn = {
      success: true,
      msg:
        "log in to your email[" +
        email +
        "], and check for the verification code!" +
        " " +
        sixNum,
    };
    console.log(JSON.stringify(rtn));
    return JSON.stringify(rtn); // new user
  } catch (error) {
    console.log("checkEmail error:", error);
    return JSON.stringify({ success: false, msg: "checkEmail error!" });
  }
}

export async function verifyEmail(_currentState: unknown, formData: FormData) {
  const email = formData.get("email");
  const code = formData.get("code");

  console.log("verifyEmail", email, code);

  const myCode = verifyCode[email];
  if (myCode && myCode.split(":")[0] == code) {
    delete verifyCode[email];
    const t1 = new Date().valueOf();
    if (t1 - Number(myCode.split(":")[1]) > 10 * 60 * 1000) {
      console.log("verify code time out!", email, code);
      return "verify code expire";
    }
    console.log("verify success!", email, code);

    let md = myCookies.flushData(email);

    // update accountId from chain, and loadData again.
    const ownerId = myCookies.loadData().ownerId;
    const accountId = await queryAccount(ownerId);
    console.log(
      `query accountId when verified,  ownerId=${ownerId}, accountId=${accountId}`
    );
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
  redirectTo.urlLoggedInCheckChain();

  const ownerId = formData.get("owner_id");
  const passwdAddr = formData.get("passwd_addr");
  const questionNos = formData.get("question_nos");

  var accountId = await queryAccount(ownerId);

  console.log("createAccount. accountId before create:", accountId);

  if (accountId.toString() == popularAddr.ZERO_ADDR) {
    // create new account
    let rtn = await newAccount(ownerId, passwdAddr, questionNos);
    if (rtn.success) {
      accountId = rtn.accountId;
    } else {
      redirectTo.urlError();
    }
  }

  myCookies.setAccountId(accountId.toString());

  console.log("createAccount, ownerId:", ownerId);
  console.log("createAccount, ownerAddr:", passwdAddr);

  redirectTo.urlDashboard();
}

export async function getEthBalance(accountId: string) {
  redirectTo.urlLoggedInCheckChain();
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
  redirectTo.urlLoggedInCheckChain();
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
  redirectTo.urlLoggedInCheckChain();
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
  redirectTo.urlLoggedInCheckChain();
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

    const newQuestionNos = formData.get("question_nos");

    await chgPasswdAddr(
      ownerId,
      `0x${newPasswdAddr.substring(2)}`,
      newQuestionNos,
      `0x${oldPasswdAddr.substring(2)}`,
      BigInt(nonce),
      `0x${signature.substring(2)}`
    );
  } catch (error) {
    throw error;
  }
}
