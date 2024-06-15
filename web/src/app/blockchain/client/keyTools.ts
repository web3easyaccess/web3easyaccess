import { keccak256, toHex, getContract, formatEther } from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export type PrivateInfoType = {
  email: string;
  pin: string;
};

const salt = "20240601:z1yQJixs65wO1vdRBfGwrfcPR6stFT";
const saltPrivateKey = salt + ":web3easyaccess:pri:";
const saltOwnerId = salt + ":web3easyaccess:owner:";

// todo should replaced by a algorithm like HD wallet
// todo input ownerId should replaced by email
export function getPrivateKey(privateInfo: PrivateInfoType) {
  var s1 = saltPrivateKey + privateInfo.email;
  var s2 = saltPrivateKey + privateInfo.pin;
  var ss1 = keccak256(toHex(s1));
  var ss2 = keccak256(toHex(s2));
  var ss3 = ss1.substring(2) + ss2.substring(2);
  const privateKey = keccak256(`0x${ss3}`);
  const account = privateKeyToAccount(privateKey);
  console.log("passwdAddr:", account.address);
  return privateKey;
}

export function getOwnerId(email: string) {
  var s1 = saltOwnerId + email;
  var s2 = keccak256(toHex(s1));
  const ownerId = keccak256(s2);
  return ownerId;
}
