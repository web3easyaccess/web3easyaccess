"use client";
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

    const childOK = useRef(false);
    //回调函数
    function receiveMessageFromChild(event) {
        if (event.origin == walleconnectHost) {
            console.log(
                "我是parent,我接收到 walletconnect的消息: ",
                event.data
            );
            const reportMsg = "child[walletconnect]OK";
            if (event.data == reportMsg) {
                childOK.current = true;
                writeWalletConnectData();
            }
        }
    }
    //监听message事件
    window.addEventListener("message", receiveMessageFromChild, false);

    const msgIndex = useRef(0);
    const lastWriteValue = useRef("");
    const writeWalletConnectData = () => {
        if (childOK.current != true) {
            return;
        }

        const thisValue = chainKey + ":" + accountAddr;
        if (lastWriteValue.current != thisValue) {
            //必须是iframe加载完成后才可以向子域发送数据
            const childFrameObj = document.getElementById("w3eaWalletconnect");
            msgIndex.current = msgIndex.current + 1;
            const data = {
                msgIdx: msgIndex.current,
                address: accountAddr,
                chainKey: chainKey,
            };
            console.log("writeWalletConnectData....:", data, walleconnectHost);
            childFrameObj.contentWindow.postMessage(data, walleconnectHost); //window.postMessage
            lastWriteValue.current = thisValue;
        }
    };

    useEffect(() => {
        writeWalletConnectData();
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
