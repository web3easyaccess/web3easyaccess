"use server";

// import { signIn } from "@/auth";

import redirectTo from "./redirectTo";

import myCookies from "./myCookies";
import { sendMail } from "./mailService";
import { queryAccount } from "../lib/chainQuery";
import { getFactoryAddr } from "./blockchain/chainWriteClient";
import {
    newAccount,
    newAccountAndTransferETH,
    transferETH,
    chgPasswdAddr,
} from "./blockchain/chainWrite";

import {
    generateRandomDigitInteger,
    generateRandomString,
} from "../lib/myRandom";

import { queryEthBalance } from "../serverside/blockchain/queryAccountInfo";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { parseEther } from "viem";

export async function userLogout(
    _currentUserInfo: unknown,
    formData: FormData
) {
    console.log("server action,userLogout.");
    myCookies.clearData();
    console.log("byebye...");
    redirectTo.urlLogin();
    return "byebye to server.";
}

export async function saveChainCode(
    _currentUserInfo: unknown,
    formData: FormData
) {
    console.log("server action,saveChainCode.");
    const newChainCode = formData.get("newChainCode");
    const oldChainCode = myCookies.getChainCode();
    // setChainCode(chainName);
    myCookies.setChainCode(newChainCode);
    if (oldChainCode != newChainCode) {
        // redirectTo.urlLogin();
    }
    console.log("chain code updated in cookie!", newChainCode);
}

const verifyCode = {};

export async function test001(_currentUserInfo: unknown, formData: FormData) {
    const inputDataJson = formData.get("inputDataJson");
    console.log("inputDataJsonxxxx:", inputDataJson);
    var obj = JSON.parse(inputDataJson);
    obj.kk = "kk123";
    await sleep(5000);
    console.log("inputDataJsonxxxx2::", inputDataJson);
    return JSON.stringify(obj);
}

export async function checkEmail(
    _currentUserInfo: unknown,
    formData: FormData
) {
    try {
        const email = formData.get("email");
        console.log("email000:", email);
        if (
            myCookies.getChainCode() == undefined ||
            myCookies.getChainCode() == null ||
            myCookies.getChainCode() == ""
        ) {
            return JSON.stringify({
                success: false,
                msg: "please select a chain at the top-right corner!",
            });
        }
        if (myCookies.loadData()?.email == email) {
            const ownerId = myCookies.loadData().ownerId;
            const acct = await queryAccount(
                myCookies.getChainCode(),
                getFactoryAddr(myCookies.getChainCode()),
                ownerId
            );
            const accountId = acct?.accountAddr;
            console.log(
                `query accountId when reuse email,  ownerId=${ownerId}, accountId=${accountId},created=${acct?.created}`
            );
            return JSON.stringify({ success: true, msg: "[existing]" });
        }
        //
        const sixNum = generateRandomDigitInteger().toString();
        verifyCode[email] = sixNum + ":" + new Date().valueOf();
        // await sendMail(email, sixNum); // ignore tmp.
        console.log("sent email", email, "========> [" + sixNum + "]");
        // Please log in to your email address "123@a.com" and check for the verification code.
        var rtn = {
            success: true,
            msg:
                "log in to your email[" +
                email +
                "], and check for the verification code!" +
                " ",
        };
        console.log(JSON.stringify(rtn));
        return JSON.stringify(rtn); // new user
    } catch (error) {
        console.log("checkEmail error:", error);
        return JSON.stringify({ success: false, msg: "checkEmail error!" });
    }
}

export async function verifyEmail(
    _currentUserInfo: unknown,
    formData: FormData
) {
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
        const acct = await queryAccount(
            myCookies.getChainCode(),
            getFactoryAddr(myCookies.getChainCode()),
            ownerId
        );
        const accountId = acct?.accountAddr;
        console.log(
            `query accountId when verified,  ownerId=${ownerId}, account=${acct?.accountAddr},created=${acct?.created}`
        );

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

export async function saveSelectedOrderNo(
    _currentUserInfo: unknown,
    formData: FormData
) {
    const sNo = formData.get("selectedOrderNo");
    myCookies.flushSelectedOrderNo(Number(sNo));
    console.log("cookie saveSelectedOrderNo:", sNo);
}

export async function createAccount(
    _currentUserInfo: unknown,
    formData: FormData
) {
    redirectTo.urlLoggedInCheckChain();

    const ownerId = formData.get("owner_id");
    const passwdAddr = formData.get("passwd_addr");
    const questionNosEnc = formData.get("question_nos_enc");
    console.log(
        `createAccount, input: ownerId=${ownerId}, passwdAddr=${passwdAddr}, questionNosEnc=${questionNosEnc}`
    );
    var acct = await queryAccount(
        myCookies.getChainCode(),
        getFactoryAddr(myCookies.getChainCode()),
        ownerId
    );

    console.log("createAccount. accountId before create:", acct);

    if (acct?.created == false) {
        // create new account
        let rtn = await newAccount(ownerId, passwdAddr, questionNosEnc);
        if (rtn.success) {
            accountId = rtn.accountId;
        } else {
            redirectTo.urlError();
        }
    }

    acct = await queryAccount(
        myCookies.getChainCode(),
        getFactoryAddr(myCookies.getChainCode()),
        ownerId
    );
    console.log("createAccount finished, acct:", acct);

    console.log("createAccount, ownerId:", ownerId);
    console.log("createAccount, passwdAddr:", passwdAddr);

    redirectTo.urlDashboard();
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

export async function createAccountAndSendTransaction(
    _currentUserInfo: unknown,
    formData: FormData
) {
    redirectTo.urlLoggedInCheckChain();
    redirectTo.urlLoggedInCheck();
    console.log("createAccountAndSendTransaction...");
    try {
        const ownerId = formData.get("owner_id");
        const passwdAddr = formData.get("passwd_addr");
        const questionNos = formData.get("question_nos");
        const receiverAddr = formData.get("receiver_addr");
        const amount = parseEther(formData.get("amount"));
        const signature = formData.get("signature");
        const _onlyQueryFee = formData.get("only_query_fee");
        const onlyQueryFee = _onlyQueryFee == "true" ? true : false;
        const res = await newAccountAndTransferETH(
            ownerId,
            passwdAddr,
            questionNos,
            receiverAddr, // to
            amount,
            signature,
            onlyQueryFee
        );

        return res;
    } catch (error) {
        console.log("newAccountAndTransferETH error:", error);
        throw error;
    }
}

export async function newTransaction(
    _currentUserInfo: unknown,
    formData: FormData
) {
    redirectTo.urlLoggedInCheckChain();
    redirectTo.urlLoggedInCheck();
    console.log("newTransaction...");

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
    _currentUserInfo: unknown,
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
