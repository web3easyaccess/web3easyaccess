import {
    keccak256,
    toHex,
    numberToHex,
    encodePacked,
    getContract,
    formatEther,
} from "viem";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

import { entropyToMnemonic } from "@scure/bip39";

import { english, simplifiedChinese, generateMnemonic } from "viem/accounts";
import { mnemonicToAccount } from "viem/accounts";

export type PrivateInfoType = {
    email: string;
    pin: string;
    question1answer: string;
    question2answer: string;
    firstQuestionNo: string;
    secondQuestionNo: string;
    confirmedSecondary: boolean;
};

const salt = "20240601:z1yQJixs65wO1vdRBfGwrfcPR6stFT";
const saltPrivateKey = salt + ":web3easyaccess:pri:";
const saltOwnerId = salt + ":web3easyaccess:owner:";

function _getMnemonic(privateInfo: PrivateInfoType) {
    var s1 = saltPrivateKey + privateInfo.email;
    var s2 = saltPrivateKey + privateInfo.pin;
    var s3 = saltPrivateKey + privateInfo.question1answer;
    var s4 = saltPrivateKey + privateInfo.question2answer;
    var ss1 = keccak256(toHex(s1));
    var ss2 = keccak256(toHex(s2));
    var ss3 = keccak256(toHex(s3));
    var ss4 = keccak256(toHex(s4));
    var xxx =
        ss1.substring(2) +
        ss2.substring(2) +
        ss3.substring(2) +
        ss4.substring(2);
    const entropyHex = keccak256(`0x${xxx}`);
    const entropy = Uint8Array.from(
        Buffer.from(entropyHex.toString().substring(2), "hex")
    );
    const mnemonic = entropyToMnemonic(entropy, english);
    return mnemonic;
}

// only select index 0.
const ADDRESS_INDEX = 0;

export function getPasswdAccount(privateInfo: PrivateInfoType) {
    // const account = privateKeyToAccount(privateKey);
    const account = mnemonicToAccount(
        _getMnemonic(privateInfo), // "legal winner thank year wave sausage worth useful legal winner thank yellow",
        {
            addressIndex: ADDRESS_INDEX,
        }
    );
    console.log("passwdAddr:", account.address);
    return account;
}

export function getOwnerIdBigBrother(email: string) {
    if (!email || email.trim() == "") {
        console.log("email is invalid:", email);
        throw new Error("email is invalid!");
    }
    var s1 = saltOwnerId + email;
    var s2 = keccak256(toHex(s1)).toString();
    var sss = email + s2.substring(2) + "." + ADDRESS_INDEX;
    let ownerId = keccak256(toHex(sss));
    console.log("getOwnerIdBigBrother-1:", ownerId, email);
    // left shift 4 letter, and append 4 ZEROs.
    ownerId = "0x" + ownerId.toString().substring(6) + "0000"; // this is BigBrother
    console.log("getOwnerIdBigBrother-2:", ownerId);
    return ownerId;
}

export function getOwnerIdSelfByBigBrother(
    ownerIdBigBrother: string,
    orderNo: number
) {
    const myOwnerId =
        ownerIdBigBrother.substring(0, ownerIdBigBrother.length - 4) +
        orderNo.toString().padStart(4, "0"); // this is BigBrother
    return myOwnerId;
}

export function getOwnerIdLittleBrother(ownerId: string, orderNo: number) {
    if (orderNo > 255) {
        throw new Error("orderNo too big!");
    }
    let orderS = numberToHex(orderNo, { size: 32 }).toString();
    return `${ownerId.substring(0, ownerId.length - 4)}${orderS.substring(
        orderS.length - 4
    )}`;
}
