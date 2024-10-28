import { UserProperty } from "@/app/storage/userPropertyStore";
import { useRef } from "react";
import {
    getAccountAddr,
    getChainObject,
    sendTransaction,
    signTextMessage,
    signTypedDataMessage,
} from "./connect2dapps";

export type Message = {
    msgType:
        | "reportReceived"
        | "connect"
        | "wcReset"
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

let setSignal: (key: string, value: string) => void;
let getSignal: (key: string) => any;
let removeSignal: (key: string) => void;

export let setWalletConnectHost: (host: string) => void;
export let setMainHost: (host: string) => void;

export let getWalletConnectHost: () => string;
export let getMainHost: () => string;

export default function ChannelInMain({}: // userProp,
{
    // userProp: UserProperty;
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
        console.log("MainHost:signalMap:", signalMap.current);
        signalMap.current.delete(key);
        console.log("MainHost:signalMap2:", signalMap.current);
    };

    const walletconnectHost = useRef("");
    const mainHost = useRef("");

    getWalletConnectHost = () => {
        return walletconnectHost.current;
    };

    getMainHost = () => {
        return mainHost.current;
    };

    setWalletConnectHost = (host: string) => {
        walletconnectHost.current = host;
        if (
            walletconnectHost.current == undefined ||
            walletconnectHost.current == ""
        ) {
            console.log(
                "MainHost:host123,walletconnectHost is empty, set to 3001"
            );
            walletconnectHost.current = "http://localhost:3001";
        }
    };

    setMainHost = (host: string) => {
        mainHost.current = host;

        if (mainHost.current == undefined || mainHost.current == "") {
            console.log("MainHost:host123,mainHost is empty, set to 3000");
            mainHost.current = "http://localhost:3000";
        }
    };

    //监听message事件
    window.addEventListener("message", handleMsgReceived, false);

    return <div></div>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const connect2WcHost = async (
    chainId: string | number,
    accountAddr: string
) => {
    const chainKey = "eip155:" + chainId;
    // msgIndex.current = msgIndex.current + 1;
    const msg: Message = {
        msgType: "connect",
        chainKey: chainKey,
        address: accountAddr,
        msgIdx: new Date().getTime(), // msgIndex.current,
        msg: {
            chatId: "",
            content: {
                mainHost: getMainHost(),
                walletconnectHost: getWalletConnectHost(),
            },
        },
    };

    await sendMsgUntilSuccess(getWalletConnectHost(), msg);
};

////

////

export const sendMsgUntilSuccess = async (
    walletconnectHost: string,
    msg: Message
) => {
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
        const ss = getSignal("" + msg.msgIdx);

        if (ss == "") {
            // here,means msg had been received success
            break;
        }
        if (getAccountAddr == undefined || getAccountAddr() == "") {
            // current page is invalid.
            console.log("ChannelInMain, current page is invalid,break");
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
                console.log(
                    "MainHost:warn, send to child error msg:",
                    e,
                    "childFrameObj:",
                    childFrameObj
                );
            }
            // console.log("MainHost:send to child error, retry.", e);
        }
        if (cnt % 10 == 0) {
            console.log("MainHost:getSignal,", ss);
            console.log(
                `MainHost,cnt=${cnt},label=${label},try sendMsgUntilSuccess to `,
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
        console.log("MainHost:reportReceived000:", getSignal("" + msg.msgIdx));
        removeSignal("" + msg.msgIdx);
        console.log("MainHost:reportReceived001:", getSignal("" + msg.msgIdx));
        return;
    }

    if (msg.msgType == "wcReset") {
        connect2WcHost(getChainObject().id, getAccountAddr());
    } else if (msg.msgType == "signMessage") {
        await signTextMessage(msg);
    } else if (msg.msgType == "signTypedData") {
        await signTypedDataMessage(msg);
    } else if (msg.msgType == "sendTransaction") {
        await sendTransaction(msg);
    } else {
        console.log("MainHost:not supported msg:", msg);
    }
}
