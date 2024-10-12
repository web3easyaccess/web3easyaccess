"use client";

type Message = {
    msgType:
        | "childReady"
        | "initializeChild"
        | "signMessage"
        | "signTransaction";
    chainKey: string;
    address: string;
    msgIdx: number;
    msg: {
        chatId: string;
        content: any;
    };
};

import { MutableRefObject, useEffect, useRef, useState } from "react";
import { UserProperty } from "../storage/LocalStore";
import { Button } from "@nextui-org/react";
import { getChainObj } from "../lib/myChain";

export default function Exploredapps({
    userProp,
    accountAddrList,
    forChgPasswd,
}: {
    userProp: {
        ref: MutableRefObject<UserProperty>;
        state: UserProperty;
        serverSidePropState: {
            w3eapAddr: string;
            factoryAddr: string;
            bigBrotherPasswdAddr: string;
        };
    };
    accountAddrList: string[];
    forChgPasswd: boolean;
}) {
    useEffect(() => {}, []);

    const chainObj = getChainObj(userProp.ref.current.selectedChainCode);
    const chainKey = "eip155:" + chainObj.id; // todo ,for evm now.
    const accountAddr = userProp.ref.current.selectedAccountAddr;

    const walleconnectHost = "http://localhost:3001"; // process.env.CHILD_W3EA_WALLETCONNECT_HOST

    //回调函数
    async function receiveMessageFromChild(event) {
        if (event.origin == walleconnectHost) {
            console.log(
                "parent here,receve msg from walletconnect: ",
                event.data
            );
            const msg: Message = event.data;
            if (msg.msgType == "childReady") {
                writeWalletConnectData("initializeChild", "", "");
            } else if (msg.msgType == "signMessage") {
                const chatId = msg.msg.chatId;
                const content = msg.msg.content;
                const hash = await signMessage(content);
                writeWalletConnectData("signMessage", chatId, hash);
            } else {
                console.log("not supported msg:", msg);
            }
        }
    }
    //监听message事件
    window.addEventListener("message", receiveMessageFromChild, false);

    const msgIndex = useRef(0);
    const lastMsgIndex = useRef(0);

    const writeWalletConnectData = async (
        msgType:
            | "childReady"
            | "initializeChild"
            | "signMessage"
            | "signTransaction",
        chatId: string,
        content: any
    ) => {
        console.log("writeWalletConnectData,", msgType, chatId, content);

        msgIndex.current = msgIndex.current + 1;
        const msg: Message = {
            msgType: msgType,
            chainKey: chainKey,
            address: accountAddr,
            msgIdx: msgIndex.current,
            msg: {
                chatId: chatId,
                content: content,
            },
        };

        const childFrameObj = document.getElementById("w3eaWalletconnect");

        console.log("writeWalletConnectData....:", msg, walleconnectHost);
        console.log("writeWalletConnectData....2:", childFrameObj);
        let k = 0;
        for (k = 0; k < 100; k++) {
            try {
                console.log("send to child 111.");
                childFrameObj.contentWindow.postMessage(msg, walleconnectHost); //window.postMessage
                console.log("send to child 222.");
                break;
            } catch (e) {
                console.log("send to child error, retry.", e);
                await sleep(100);
            }
        }
        if (k > 90) {
            console.log("fff.kkkk error!");
        }
    };

    useEffect(() => {
        writeWalletConnectData("initializeChild", "", "");
    }, [userProp.state]);

    const wallet = () => {
        return (
            <div>
                <iframe
                    id="w3eaWalletconnect"
                    title="w3eaWalletconnect"
                    width="800"
                    height="500"
                    src={walleconnectHost}
                ></iframe>
            </div>
        );
    };

    return <div>{wallet()}</div>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const signMessage = async (msg: string) => {
    return "sss:" + msg;
    // let sign: {
    //     signature: string;
    //     eoa: any;
    //     nonce: string;
    // } = { signature: "", eoa: "", nonce: "" };

    // let argumentsHash = "";
    // if (libsolana.isSolana(chainObj.chainCode)) {
    //     console.log("solana useless!2");
    //     argumentsHash = "0x0";
    //     sign.signature = "solana useless!signature.22.";
    // } else {
    //     argumentsHash = encodeAbiParameters(
    //         [
    //             { name: "funcId", type: "uint256" },
    //             { name: "to", type: "address" },
    //             { name: "amount", type: "uint256" },
    //             { name: "data", type: "bytes" },
    //             { name: "estimatedFee", type: "uint256" },
    //         ],
    //         [BigInt(3), receiverAddr, receiverAmt, receiverData, execCost]
    //     );

    //     argumentsHash = keccak256(argumentsHash);
    //     console.log("encodeAbiParameters3333bbb:", argumentsHash);
    //     let chainId = chainObj.id;
    //     if (bridgeDirection == "L1ToL2") {
    //         // L2 is selected, but it need to switch to L1
    //         chainId = getChainObj(chainObj.l1ChainCode).id;
    //     }
    //     let withZeroNonce = !myAccountCreated;
    //     sign = await signAuth(
    //         passwdAccount,
    //         chainId,
    //         myContractAccount,
    //         chainObj,
    //         argumentsHash,
    //         withZeroNonce
    //     );
    // }
};
