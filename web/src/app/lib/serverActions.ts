"use server";

// import { signIn } from "@/auth";

import redirectTo from "./redirectTo";

import myCookies from "./myCookies";
import { sendMail } from "./mailService";
import {
  getOwnerId,
  getPrivateKey,
  PrivateInfoType,
} from "../blockchain/client/keyTools";
import {
  queryAccount,
  newAccount,
  transferETH,
} from "../blockchain/server/callAdmin";

import { queryEthBalance } from "../blockchain/server/queryAccountInfo";

import popularAddr from "../blockchain/client/popularAddr";
import { parseEther } from "viem";

const verifyCode = {};
const verifiedEmail = {};

export async function checkEmail(_currentState: unknown, formData: FormData) {
  try {
    await signIn("credentials", formData);

    const email = formData.get("email");
    console.log("email000:", email);
    const ownerId = getOwnerId(email.toString());
    console.log("ownerId:", ownerId.toString());

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
    verifiedEmail[email] = true;
    delete verifyCode[email];
    const ownerId = getOwnerId(email?.toString());

    const accountId = await queryAccount(ownerId);
    console.log("accountId:", accountId.toString());

    myCookies.setOwnerId(ownerId);
    myCookies.setAccountId(accountId);
    myCookies.setEmail(email);

    redirectTo.dashboard(ownerId);
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
  const signature = formData.get("signature"); // didn't used at here.
  const passwdAddr = formData.get("passwdAddr");
  const ownerId = formData.get("ownerId");
  const nonce = formData.get("nonce");

  const accountId = await queryAccount(ownerId);
  console.log("createAccount. accountId before create:", accountId);

  if (accountId.toString() == popularAddr.ZERO_ADDR) {
    // create new account
    await newAccount(ownerId, passwdAddr);

    while (true) {
      const acctId = await queryAccount(ownerId);
      if (acctId.toString() == popularAddr.ZERO_ADDR) {
        console.log("waiting for creating new account...");
        await sleep(1000);
      } else {
        myCookies.setAccountId(acctId);
        console.log("created new account:", acctId);
        break;
      }
    }
  } else {
    myCookies.setAccountId(accountId);
  }
  console.log(
    "createAccount signature:",
    signature,
    "====",
    passwdAddr,
    "===",
    nonce
  );
  redirectTo.dashboard(ownerId);
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
  try {
    const receiverAddr = formData.get("receiver_addr");
    console.log("receiverAddr:", receiverAddr);
    const amount = formData.get("amount");
    console.log("amount:", amount);
    const ownerId = formData.get("ownerId");
    console.log("newTransaction, ownerId:", ownerId);
    const passwdAddr = formData.get("passwdAddr");
    const nonce = formData.get("nonce");
    const signature = formData.get("signature");
    const inputData = formData.get("input_data");
    console.log("inputData:", inputData);

    await transferETH(
      `0x${receiverAddr.substring(2)}`,
      parseEther(amount),
      `0x${ownerId.substring(2)}`,
      `0x${passwdAddr.substring(2)}`,
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

function encrypt(d) {
  return d;
}

export async function handleLogin(sessionData) {
  const encryptedSessionData = encrypt(sessionData); // Encrypt your session data
  cookies().set("session", encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // One week
    path: "/",
  });
  // Redirect or handle the response after setting the cookie
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
