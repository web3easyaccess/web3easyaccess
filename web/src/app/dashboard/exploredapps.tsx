"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { UserProperty } from "../storage/LocalStore";
import { Button } from "@nextui-org/react";

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

    const childOK = useRef(false);
    //回调函数
    function receiveMessageFromChild(event) {
        if (event.origin == "http://localhost:3001") {
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

        const thisValue =
            userProp.ref.current.selectedChainCode +
            ":" +
            userProp.ref.current.selectedAccountAddr;
        if (lastWriteValue.current != thisValue) {
            //必须是iframe加载完成后才可以向子域发送数据
            const childFrameObj = document.getElementById("w3eaWalletconnect");
            msgIndex.current = msgIndex.current + 1;
            const data = {
                msgIdx: msgIndex.current,
                address: userProp.ref.current.selectedAccountAddr,
                chainCode: userProp.ref.current.selectedChainCode,
            };
            console.log("writeWalletConnectData....:");
            childFrameObj.contentWindow.postMessage(
                data,
                "http://localhost:3001"
            ); //window.postMessage
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
                    src="http://localhost:3001/"
                ></iframe>
            </div>
        );
    };

    return <div>{wallet()}</div>;
}
