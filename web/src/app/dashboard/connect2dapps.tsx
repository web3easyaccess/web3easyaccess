"use client";

type Message = {
    msgType:
        | "reportReceived"
        | "connect"
        | "childReady"
        | "initializeChild"
        | "signMessage"
        | "signTypedData"
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

let setSignal: (key: string, value: string) => void;
let getSignal: (key: string) => any;
let removeSignal: (key: string) => void;

let getWalletConnectHost: () => string;

export default function Connect2Dapps({
    userProp,
}: {
    userProp: UserProperty;
}) {
    const vvv: Map<string, string> = new Map();
    const signalMap = useRef(vvv);
    setSignal = (key: string, value: string) => {
        signalMap.current.set(key, value);
    };
    getSignal = (key: string) => {
        let val = signalMap.current.get(key);
        if (val == undefined || val == null) {
            val = "";
        }
        return val;
    };
    removeSignal = (key: string) => {
        console.log("signalMap:", signalMap.current);
        signalMap.current.delete(key);
        console.log("signalMap2:", signalMap.current);
    };

    /////

    const walletconnectHost = useRef("");
    getWalletConnectHost = () => {
        return walletconnectHost.current;
    };

    const chainObj = useRef(getChainObj(userProp.selectedChainCode));
    const accountAddr = useRef(readAccountAddr(userProp));
    const factoryAddr = useRef(readFactoryAddr(userProp));

    const lastEffectPropJson = useRef("");
    useEffect(() => {
        const propJson = JSON.stringify(userProp);
        if (propJson == lastEffectPropJson.current) {
            console.log("same prop effected, skip:", userProp);
            return;
        } else {
            console.log("new prop effecting...", userProp);
            lastEffectPropJson.current = propJson;
        }

        if (
            userProp.bigBrotherOwnerId != undefined &&
            userProp.bigBrotherOwnerId != ""
        ) {
            // userProp is valid.
            accountAddr.current = readAccountAddr(userProp);
            factoryAddr.current = readFactoryAddr(userProp);
            chainObj.current = getChainObj(userProp.selectedChainCode);
            let myselfHost = userProp.myselfHost;
            walletconnectHost.current = userProp.walletconnectHost;
            if (myselfHost == undefined || myselfHost == "") {
                console.log("host123,myselfHost is empty, set to 3000");
                myselfHost = "http://localhost:3000";
            }
            if (
                walletconnectHost.current == undefined ||
                walletconnectHost.current == ""
            ) {
                console.log("host123,walletconnectHost is empty, set to 3001");
                walletconnectHost.current = "http://localhost:3001";
            }
            const chainKey = "eip155:" + chainObj.current.id;
            connect2WcHost(
                myselfHost,
                walletconnectHost.current,
                chainKey,
                accountAddr.current
            );
        }
    }, [userProp]);

    const preparedPriceRef = useRef({
        preparedMaxFeePerGas: undefined,
        preparedGasPrice: undefined,
    });

    const msgIdFromChild = useRef(0);
    //回调函数
    async function receiveMessageFromChild(event) {
        // if (event.origin == walleconnectHost.current) {
        //     console.log(
        //         "parent here,receve msg from walletconnect: ",
        //         event.data
        //     );
        //     const msg: Message = JSON.parse(event.data);
        //     if (msg.msgIdx <= msgIdFromChild.current) {
        //         return;
        //     }
        //     msgIdFromChild.current = msg.msgIdx;
        //     if (msg.msgType == "childReady") {
        //         writeWalletConnectData("initializeChild", "", "");
        //     } else if (msg.msgType == "signMessage") {
        //         const chatId = msg.msg.chatId;
        //         const content = msg.msg.content;
        //         const { rtnVal, signature } = await signMessage(
        //             currentPriInfoRef.current,
        //             accountAddr.current,
        //             content,
        //             chainObj.current,
        //             factoryAddr.current,
        //             false
        //         );
        //         if ("" + rtnVal == "0x1626ba7e") {
        //             console.log(
        //                 "signMessage x valid... go!aaa,signature:",
        //                 signature
        //             );
        //             writeWalletConnectData("signMessage", chatId, signature);
        //         } else {
        //             console.log("signMessage x invalid..aaa. skip!");
        //         }
        //     } else if (msg.msgType == "signTypedData") {
        //         const chatId = msg.msg.chatId;
        //         const content = msg.msg.content;
        //         const { rtnVal, signature } = await signMessage(
        //             currentPriInfoRef.current,
        //             accountAddr.current,
        //             content,
        //             chainObj.current,
        //             factoryAddr.current,
        //             true
        //         );
        //         if ("" + rtnVal == "0x1626ba7e") {
        //             console.log(
        //                 "signMessage x valid... go!bbb,signature:",
        //                 signature
        //             );
        //             writeWalletConnectData("signMessage", chatId, signature);
        //         } else {
        //             console.log("signMessage x invalid..bbb. skip!");
        //         }
        //     } else if (msg.msgType == "sendTransaction") {
        //         const chatId = msg.msg.chatId;
        //         const txReq = msg.msg.content as TransactionRequest;
        //         const hash = await sendTransaction(
        //             currentPriInfoRef,
        //             preparedPriceRef,
        //             accountAddr.current,
        //             txReq,
        //             chainObj.current,
        //             factoryAddr.current,
        //             readOwnerId(userProp)
        //         );
        //         writeWalletConnectData("sendTransaction", chatId, hash);
        //     } else {
        //         console.log("not supported msg:", msg);
        //     }
        // }
    }
    //监听message事件
    window.addEventListener("message", handleMsgReceived, false);

    // const msgIndex = useRef(0);
    // const lastMsgIndex = useRef(0);

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

    // const Wallet = () => {
    //     return (
    //         <div>
    //             {privateinfoHidden ? (
    //                 <>
    //                     <iframe
    //                         id="w3eaWalletconnect"
    //                         title="w3eaWalletconnect"
    //                         width="800"
    //                         height="500"
    //                         src={walleconnectHost.current + "/walletconnect"}
    //                     ></iframe>
    //                 </>
    //             ) : (
    //                 <div></div>
    //             )}
    //         </div>
    //     );
    // };

    return (
        <div>
            {accountAddrCreated(userProp) ? (
                <>
                    {/* <p>{accountAddr.current}</p>
                    <PrivateInfo
                        userProp={userProp}
                        forTransaction={true}
                        currentPriInfoRef={currentPriInfoRef}
                        oldPriInfoRef={oldPriInfoRef}
                        updateFillInOk={updateFillInOk}
                        privateinfoHidden={privateinfoHidden}
                        updatePrivateinfoHidden={updatePrivateinfoHidden}
                    ></PrivateInfo> */}
                    <IframeWallet src={getWalletConnectHost()}></IframeWallet>
                </>
            ) : (
                <p>
                    this account[ {readAccountAddr(userProp)} ] has not created!
                </p>
            )}
        </div>
    );
}

const IframeWallet = ({ src }: { src: string }) => {
    useEffect(() => {
        console.log("iframeWallet,src:", src);
        if (src == null || src == undefined || src == "") {
            return;
        }
        const iframe = document.createElement("iframe");
        iframe.src = src + "/walletconnect";
        iframe.style.width = "800px";
        iframe.style.height = "500px";
        iframe.id = "w3eaWalletconnect";
        const container = document.getElementById("div_w3eaWalletconnect");
        container.appendChild(iframe);

        // return () => {
        //     container.removeChild(iframe);
        // };
    }, [src]);

    return <div id="div_w3eaWalletconnect"></div>;
};

const connect2WcHost = async (
    myselfHost: string,
    walletconnectHost: string,
    chainKey: string,
    accountAddr: string
) => {
    // msgIndex.current = msgIndex.current + 1;
    const msg: Message = {
        msgType: "connect",
        chainKey: chainKey,
        address: accountAddr,
        msgIdx: new Date().getTime(), // msgIndex.current,
        msg: {
            chatId: "",
            content: {
                mainHost: myselfHost,
                walletconnectHost: walletconnectHost,
            },
        },
    };

    await sendMsgUntilSuccess(walletconnectHost, msg);
};

const sendMsgUntilSuccess = async (walletconnectHost: string, msg: Message) => {
    let childFrameObj = document.getElementById("w3eaWalletconnect");
    let cnt = 0;
    setSignal("" + msg.msgIdx, "" + msg.msgIdx);

    while (true) {
        await sleep(1000);

        if (childFrameObj == undefined || childFrameObj == null) {
            childFrameObj = document.getElementById("w3eaWalletconnect");
        }
        if (childFrameObj == null || childFrameObj == undefined) {
            continue;
        }
        if (getSignal("" + msg.msgIdx) == "") {
            // here,means msg had received success
            break;
        }

        let label = "ok";
        try {
            childFrameObj.contentWindow.postMessage(
                JSON.stringify(msg),
                walletconnectHost
            ); //window.postMessage
            label = "ok";
        } catch (e) {
            label = "error";
            if (cnt % 10 == 0) {
                console.log("warn, send to child error msg:", e);
            }
            // console.log("send to child error, retry.", e);
        }
        if (cnt % 10 == 0) {
            console.log(
                `cnt=${cnt},label=${label},try sendMsgUntilSuccess to `,
                walletconnectHost,
                msg
            );
        }

        cnt++;
    }
};

async function handleMsgReceived(event: { origin: any; data: string }) {
    if (event.origin != getWalletConnectHost()) {
        return;
    }

    const msg: Message = JSON.parse(event.data);
    if (msg.msgType == "reportReceived") {
        console.log("reportReceived000:", getSignal("" + msg.msgIdx));
        removeSignal("" + msg.msgIdx);
        console.log("reportReceived001:", getSignal("" + msg.msgIdx));
    }

    // if (event.origin == walleconnectHost.current) {
    //     console.log("parent here,receve msg from walletconnect: ", event.data);
    //     const msg: Message = JSON.parse(event.data);
    //     if (msg.msgIdx <= msgIdFromChild.current) {
    //         return;
    //     }
    //     msgIdFromChild.current = msg.msgIdx;
    //     if (msg.msgType == "childReady") {
    //         writeWalletConnectData("initializeChild", "", "");
    //     } else if (msg.msgType == "signMessage") {
    //         const chatId = msg.msg.chatId;
    //         const content = msg.msg.content;
    //         const { rtnVal, signature } = await signMessage(
    //             currentPriInfoRef.current,
    //             accountAddr.current,
    //             content,
    //             chainObj.current,
    //             factoryAddr.current,
    //             false
    //         );
    //         if ("" + rtnVal == "0x1626ba7e") {
    //             console.log(
    //                 "signMessage x valid... go!aaa,signature:",
    //                 signature
    //             );
    //             writeWalletConnectData("signMessage", chatId, signature);
    //         } else {
    //             console.log("signMessage x invalid..aaa. skip!");
    //         }
    //     } else if (msg.msgType == "signTypedData") {
    //         const chatId = msg.msg.chatId;
    //         const content = msg.msg.content;
    //         const { rtnVal, signature } = await signMessage(
    //             currentPriInfoRef.current,
    //             accountAddr.current,
    //             content,
    //             chainObj.current,
    //             factoryAddr.current,
    //             true
    //         );
    //         if ("" + rtnVal == "0x1626ba7e") {
    //             console.log(
    //                 "signMessage x valid... go!bbb,signature:",
    //                 signature
    //             );
    //             writeWalletConnectData("signMessage", chatId, signature);
    //         } else {
    //             console.log("signMessage x invalid..bbb. skip!");
    //         }
    //     } else if (msg.msgType == "sendTransaction") {
    //         const chatId = msg.msg.chatId;
    //         const txReq = msg.msg.content as TransactionRequest;
    //         const hash = await sendTransaction(
    //             currentPriInfoRef,
    //             preparedPriceRef,
    //             accountAddr.current,
    //             txReq,
    //             chainObj.current,
    //             factoryAddr.current,
    //             readOwnerId(userProp)
    //         );
    //         writeWalletConnectData("sendTransaction", chatId, hash);
    //     } else {
    //         console.log("not supported msg:", msg);
    //     }
    // }
}

///////////

///////////

///////////

///////

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

    console.log("writeWalletConnectData....:", msg, walleconnectHost.current);

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
    factoryAddr: string,
    isTypedData: boolean
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
            msg,
            isTypedData
        );
        console.log("signAuth,777,:", sign);

        const rtnVal = await testIsValidSignature(
            chainObj.chainCode,
            factoryAddr,
            accountAddr,
            sign.msgHash,
            sign.signature
        );

        return { rtnVal: rtnVal, signature: sign.signature };
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
