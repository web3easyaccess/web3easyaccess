import { keccak256, toHex, encodePacked, getContract, formatEther } from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { entropyToMnemonic } from "@scure/bip39";

import { english, simplifiedChinese, generateMnemonic } from "viem/accounts";
import { mnemonicToAccount } from "viem/accounts";

export type PrivateInfoType = {
  email: string;
  pin: string;
  question1answer: string;
  question2answer: string;
  question3answer: string;
};

const salt = "20240601:z1yQJixs65wO1vdRBfGwrfcPR6stFT";
const saltPrivateKey = salt + ":web3easyaccess:pri:";
const saltOwnerId = salt + ":web3easyaccess:owner:";

function _getMnemonic(privateInfo: PrivateInfoType) {
  var s1 = saltPrivateKey + privateInfo.email;
  var s2 = saltPrivateKey + privateInfo.pin;
  var s3 = saltPrivateKey + privateInfo.question1answer;
  var s4 = saltPrivateKey + privateInfo.question2answer;
  var s5 = saltPrivateKey + privateInfo.question3answer;
  var ss1 = keccak256(toHex(s1));
  var ss2 = keccak256(toHex(s2));
  var ss3 = keccak256(toHex(s3));
  var ss4 = keccak256(toHex(s4));
  var ss5 = keccak256(toHex(s5));
  var xxx =
    ss1.substring(2) +
    ss2.substring(2) +
    ss3.substring(2) +
    ss4.substring(2) +
    ss5.substring(2);
  const entropyHex = keccak256(`0x${xxx}`);
  const entropy = Uint8Array.from(
    Buffer.from(entropyHex.toString().substring(2), "hex")
  );
  const mnemonic = entropyToMnemonic(entropy, english);
  return mnemonic;
}

// only support one, current!
const ADDRESS_INDEX = 0;

export function getPasswdAccount(privateInfo: PrivateInfoType) {
  // const account = privateKeyToAccount(privateKey);
  const account = mnemonicToAccount(
    _getMnemonic(privateInfo), // "legal winner thank year wave sausage worth useful legal winner thank yellow",
    {
      addressIndex: ADDRESS_INDEX,
    }
  );
  console.log("ownerAddr:", account.address);
  return account;
}

export function getOwnerId(email: string) {
  if (!email || email.trim() == "") {
    console.log("email is invalid:", email);
    throw new Error("email is invalid!");
  }
  var s1 = saltOwnerId + email;
  var s2 = keccak256(toHex(s1)).toString();
  var sss = email + s2.substring(2) + "." + ADDRESS_INDEX;
  const ownerId = keccak256(toHex(sss));
  return ownerId.toString();
}
