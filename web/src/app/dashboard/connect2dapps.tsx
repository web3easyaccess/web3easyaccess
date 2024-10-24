"use client";

type Message = {
    msgType:
        | "childReady"
        | "initializeChild"
        | "signMessage"
        | "signTransaction"
        | "sendTransaction";
    chainKey: string;
    address: string;
    msgIdx: number;
    msg: {
        chatId: string;
        content: any;
    };
};

export type TransactionRequest = {
    to?: string;
    from?: string;
    nonce?: string;

    gasLimit?: string;
    gasPrice?: string;

    data?: string;
    value?: string;
    chainId?: string;

    type?: string;
    accessList?: string;

    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;

    customData?: Record<string, any>;
    ccipReadEnabled?: boolean;
};

import * as libsolana from "@/app/lib/client/solana/libsolana";

import * as funNewTrans from "@/app/dashboard/newtransaction/funNewTrans";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import {
    accountAddrCreated,
    readAccountAddr,
    readFactoryAddr,
    readOwnerId,
    UserProperty,
} from "../storage/userPropertyStore";
import { Button, Progress } from "@nextui-org/react";
import { getChainObj } from "../lib/myChain";
import { ChainCode } from "../lib/myTypes";
import {
    encodeAbiParameters,
    keccak256,
    hashMessage,
    hexToBigInt,
    parseEther,
    parseUnits,
} from "viem";
import { signAuth, signPersonalMessage } from "../lib/client/signAuthTypedData";
import {
    getOwnerIdLittleBrother,
    getPasswdAccount,
    PrivateInfoType,
} from "../lib/client/keyTools";
import { testIsValidSignature } from "../lib/chainQuery";
import { PrivateInfo } from "./newtransaction/privateinfo";
import { executeTransaction } from "./newtransaction/sendtransaction";

export default function Connect2Dapps({
    userProp,
}: {
    userProp: UserProperty;
}) {
    useEffect(() => {}, []);

    const walleconnectHost = useRef("http://localhost:3001"); // process.env.CHILD_W3EA_WALLETCONNECT_HOST

    const preparedPriceRef = useRef({
        preparedMaxFeePerGas: undefined,
        preparedGasPrice: undefined,
    });

    const msgIdFromChild = useRef(0);
    //回调函数
    async function receiveMessageFromChild(event) {
        if (event.origin == walleconnectHost.current) {
            console.log(
                "parent here,receve msg from walletconnect: ",
                event.data
            );
            const msg: Message = JSON.parse(event.data);
            if (msg.msgIdx <= msgIdFromChild.current) {
                return;
            }
            msgIdFromChild.current = msg.msgIdx;
            if (msg.msgType == "childReady") {
                writeWalletConnectData("initializeChild", "", "");
            } else if (msg.msgType == "signMessage") {
                const chatId = msg.msg.chatId;
                const content = msg.msg.content;
                const hash = await signMessage(
                    currentPriInfoRef.current,
                    accountAddr.current,
                    content,
                    chainObj.current,
                    readFactoryAddr(userProp)
                );
                writeWalletConnectData("signMessage", chatId, hash);
            } else if (msg.msgType == "sendTransaction") {
                const chatId = msg.msg.chatId;
                const txReq = msg.msg.content as TransactionRequest;
                const hash = await sendTransaction(
                    currentPriInfoRef,
                    preparedPriceRef,
                    accountAddr.current,
                    txReq,
                    chainObj.current,
                    readFactoryAddr(userProp),
                    readOwnerId(userProp)
                );
                writeWalletConnectData("sendTransaction", chatId, hash);
            } else {
                console.log("not supported msg:", msg);
            }
        }
    }
    //监听message事件
    window.addEventListener("message", receiveMessageFromChild, false);

    // const msgIndex = useRef(0);
    // const lastMsgIndex = useRef(0);

    const writeWalletConnectData = async (
        msgType:
            | "childReady"
            | "initializeChild"
            | "signMessage"
            | "signTransaction"
            | "sendTransaction",
        chatId: string,
        content: any
    ) => {
        const chainKey = "eip155:" + chainObj.current.id; // todo ,for evm now.
        console.log("chainKey in 2dapp, chainKey:", chainKey);

        console.log(
            "writeWalletConnectData,",
            msgType,
            chatId,
            content,
            chainKey,
            accountAddr.current
        );

        // msgIndex.current = msgIndex.current + 1;
        const msg: Message = {
            msgType: msgType,
            chainKey: chainKey,
            address: accountAddr.current,
            msgIdx: new Date().getTime(), // msgIndex.current,
            msg: {
                chatId: chatId,
                content: content,
            },
        };

        console.log(
            "writeWalletConnectData....:",
            msg,
            walleconnectHost.current
        );

        let k = 0;
        for (k = 0; k < 10 * 60; ) {
            await sleep(1000);
            const childFrameObj = document.getElementById("w3eaWalletconnect");
            try {
                // console.log("send to child 111.childFrameObj:", childFrameObj);
                childFrameObj.contentWindow.postMessage(
                    msg,
                    walleconnectHost.current
                ); //window.postMessage
                // console.log("send to child 222.");
                break;
            } catch (e) {
                // console.log("send to child error, retry.", e);
            }
            k++;
        }
        if (k > 90) {
            console.log("fff.kkkk error!");
        }
    };

    const chainObj = useRef(getChainObj(userProp.selectedChainCode));
    const accountAddr = useRef(readAccountAddr(userProp));

    useEffect(() => {
        accountAddr.current = readAccountAddr(userProp);
        chainObj.current = getChainObj(userProp.selectedChainCode);
        writeWalletConnectData("initializeChild", "", "");
    }, [userProp]);

    const piInit: PrivateInfoType = {
        email: "",
        pin: "",
        question1answer: "",
        question2answer: "",
        firstQuestionNo: "01",
        secondQuestionNo: "01",
        confirmedSecondary: true,
    };
    const currentPriInfoRef = useRef(piInit);
    const oldPriInfoRef = useRef(piInit);

    const [privateinfoHidden, setPrivateinfoHidden] = useState(false);
    const updatePrivateinfoHidden = (hidden: boolean) => {
        setPrivateinfoHidden(hidden);
    };
    const [privateFillInOk, setPrivateFillInOk] = useState(0);
    const updateFillInOk = () => {
        let x = privateFillInOk;
        setPrivateFillInOk(x + 1);
        updatePrivateinfoHidden(true);
    };

    const Wallet = () => {
        return (
            <div>
                {privateinfoHidden ? (
                    <>
                        <iframe
                            id="w3eaWalletconnect"
                            title="w3eaWalletconnect"
                            width="800"
                            height="500"
                            src={walleconnectHost.current + "/walletconnect"}
                        ></iframe>
                    </>
                ) : (
                    <div></div>
                )}
            </div>
        );
    };

    return (
        <div>
            {accountAddrCreated(userProp) ? (
                <>
                    <PrivateInfo
                        userProp={userProp}
                        forTransaction={true}
                        currentPriInfoRef={currentPriInfoRef}
                        oldPriInfoRef={oldPriInfoRef}
                        updateFillInOk={updateFillInOk}
                        privateinfoHidden={privateinfoHidden}
                        updatePrivateinfoHidden={updatePrivateinfoHidden}
                    ></PrivateInfo>
                    <Wallet></Wallet>
                </>
            ) : (
                <p>
                    this account[ {readAccountAddr(userProp)} ] has not created!
                </p>
            )}
        </div>
    );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const signMessage = async (
    privateInfo: PrivateInfoType,
    accountAddr: string,
    msg: string,
    chainObj: {
        id: number;
        name: string;
        nativeCurrency: {};
        rpcUrls: {};
        blockExplorers: {};
        contracts: {};
        testnet: boolean;
        chainCode: ChainCode;
        l1ChainCode: ChainCode;
    },
    factoryAddr: string
) => {
    let sign: {
        signature: string;
        eoa: any;
        nonce: string;
        msgHash: string;
    } = { signature: "", eoa: "", nonce: "", msgHash: "" };

    const passwdAccount = getPasswdAccount(privateInfo, chainObj.chainCode);

    let argumentsHash = "";
    if (libsolana.isSolana(chainObj.chainCode)) {
        console.log("solana useless!2");
        argumentsHash = "0x0";
        sign.signature = "solana useless!signature.22.";
    } else {
        console.log("signPersonalMessage:", msg);
        let chainId = "" + chainObj.id;
        sign = await signPersonalMessage(
            passwdAccount,
            chainId,
            accountAddr,
            chainObj,
            msg
        );
        console.log("signAuth,777,:", sign);

        testIsValidSignature(
            chainObj.chainCode,
            factoryAddr,
            accountAddr,
            sign.msgHash,
            sign.signature
        );

        return sign.signature;
    }
};

const sendTransaction = async (
    privateInfoRef: MutableRefObject<PrivateInfoType>,
    preparedPriceRef: MutableRefObject<{
        preparedMaxFeePerGas: undefined;
        preparedGasPrice: undefined;
    }>,
    accountAddr: string,
    txReq: TransactionRequest,
    chainObj: {
        id: number;
        name: string;
        nativeCurrency: {};
        rpcUrls: {};
        blockExplorers: {};
        contracts: {};
        testnet: boolean;
        chainCode: ChainCode;
        l1ChainCode: ChainCode;
    },
    factoryAddr: string,
    ownerId: string
) => {
    const passwdAccount = getPasswdAccount(
        privateInfoRef.current,
        chainObj.chainCode
    );

    preparedPriceRef.current = {
        preparedMaxFeePerGas:
            txReq.maxFeePerGas == undefined || txReq.maxFeePerGas == ""
                ? undefined
                : hexToBigInt(txReq.maxFeePerGas),
        preparedGasPrice:
            txReq.gasPrice == undefined || txReq.gasPrice == ""
                ? undefined
                : hexToBigInt(txReq.gasPrice),
    };

    let txVal;
    if (txReq.value == undefined || txReq.value == "") {
        txVal = 0;
    } else {
        txVal = Number(hexToBigInt(txReq.value));
    }
    const tx = executeTransaction(
        ownerId,
        accountAddr,
        passwdAccount,
        txReq.to,
        "" + txVal / 1e18,
        txReq.data,
        chainObj,
        true,
        "",
        preparedPriceRef,
        "",
        privateInfoRef,
        "ETH",
        false
    );
    if (tx.toString().startsWith("ERROR")) {
        console.log("ERROR,executeTransaction error!.", tx);
        throw Error("executeTransaction error!");
    }
    return tx;
};
