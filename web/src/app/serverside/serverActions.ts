"use server";

// import { signIn } from "@/auth";

import redirectTo from "./redirectTo";

import myCookies from "./myCookies";
import { sendMail } from "./mailService";
import { queryAccount, formatTimestamp } from "../lib/chainQuery";
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
        await sendMail(email, sixNum); // ignore tmp.
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

        console.log(
            `verifyEmail-current owner ${email} have account ${md.accountId}, redirect to urlDashboard.`
        );
        redirectTo.urlDashboard();
        // return "";
    } else {
        console.log("verify failure!", email, code, "stored code:" + myCode);
        return "verify code invalid";
    }
}

export async function saveSelectedOrderNo(
    _currentUserInfo: unknown,
    formData: FormData
) {
    const sNo = formData.get("selectedOrderNo");
    const selectedAccountAddr = formData.get("selectedAccountAddr");
    myCookies.flushSelectedOrderNo(Number(sNo), selectedAccountAddr);
    console.log("cookie saveSelectedOrderNo:", sNo);
}

const THEGRAPH_API_KEY = "27078366ee0927aec4a68aae6d7ce9e6";
export async function thegraphQueryOpLog(accountAddr) {
    const query =
        "{" +
        // " createAccounts(first: 999) { id ownerId account blockNumber blockTimestamp transactionHash}" +
        ` initAccounts(where: { account: "${accountAddr}" } ) { id account passwdAddr factory blockNumber blockTimestamp transactionHash} ` +
        ` chgEntries(where: { account: "${accountAddr}" } ) { id account newEntry blockNumber blockTimestamp transactionHash} ` +
        ` chgPasswdAddrs(where: { account: "${accountAddr}" } ) { id account oldPasswdAddr newPasswdAddr blockNumber blockTimestamp transactionHash} ` +
        ` syncEntryEOAs(where: { account: "${accountAddr}" } ) { id account newEntryEOA blockNumber blockTimestamp transactionHash} ` +
        ` upgradeImpls(where: { account: "${accountAddr}" } ) { id account oldImpl newImpl blockTimestamp transactionHash} ` +
        ` sendTransactions(where: { account: "${accountAddr}" } ) { id account to data value blockTimestamp transactionHash} ` +
        "}";
    console.log("xxx==============================:", accountAddr, query);
    const myData = await fetch(
        `https://gateway-arbitrum.network.thegraph.com/api/${THEGRAPH_API_KEY}/subgraphs/id/4pPyuX64mqazXXjL2xUCJESDbhHj9KPnzWudeZrfDs1R`,
        {
            method: "POST",
            body: JSON.stringify({
                query: query,
                operationName: "Subgraphs",
                variables: {},
            }),
        }
    );
    const sss = await myData.json();
    const result: {
        operationType: string;
        description: string;
        timestamp: string;
        hash: string;
    }[] = [];

    sss.data.chgEntries.forEach((e: any) => {
        result.push({
            operationType: "Change Entry",
            description: "new entry:" + e.newEntry,
            timestamp: formatTimestamp(e.blockTimestamp),
            hash: e.transactionHash,
        });
    });

    sss.data.chgPasswdAddrs.forEach((e: any) => {
        result.push({
            operationType: "Change Password",
            description: "",
            timestamp: formatTimestamp(e.blockTimestamp),
            hash: e.transactionHash,
        });
    });

    sss.data.initAccounts.forEach((e: any) => {
        result.push({
            operationType: "Init Account",
            description: "",
            timestamp: formatTimestamp(e.blockTimestamp),
            hash: e.transactionHash,
        });
    });

    sss.data.sendTransactions.forEach((e: any) => {
        result.push({
            operationType: "Send Transaction",
            description:
                "to:" + e.to + "; value:" + e.value + "; data:" + e.data,
            timestamp: formatTimestamp(e.blockTimestamp),
            hash: e.transactionHash,
        });
    });

    sss.data.syncEntryEOAs.forEach((e: any) => {
        result.push({
            operationType: "Send Transaction",
            description: "newEntryEOA:" + e.newEntryEOA,
            timestamp: formatTimestamp(e.blockTimestamp),
            hash: e.transactionHash,
        });
    });

    sss.data.upgradeImpls.forEach((e: any) => {
        result.push({
            operationType: "Upgrade Implementation",
            description: "oldImpl:" + e.oldImpl + "; newImpl:" + e.newImpl,
            timestamp: formatTimestamp(e.blockTimestamp),
            hash: e.transactionHash,
        });
    });

    result.sort((a: any, b: any) => {
        if (a.timestamp < b.timestamp) {
            return -1;
        } else {
            return 1;
        }
    });

    return result;
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
