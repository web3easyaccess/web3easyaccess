import { UserProperty } from "@/app/storage/userPropertyStore";
import { useRef } from "react";
import {
    getAccountAddr,
    getChainObject,
    getChannelId,
    getMainHost,
    getWalletConnectHost,
    sendTransaction,
    signTextMessage,
    signTypedDataMessage,
} from "./connect2dapps";

export type Message = {
    channelId: string;
    msgType:
        | "reportReceived"
        | "syncAddress"
        | "signMessage"
        | "signTypedData"
        | "signTransaction"
        | "sendTransaction"
        | "checkPasswd";
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

let setReceivedMsgId: (msgId: number) => void = (msgId: number) => {
    throw Error("setReceivedMsgId un init.");
};
let isMsgIdReceived: (msgId: number) => boolean = (msgId: number) => {
    throw Error("isMsgIdReceived un init.");
};

export default function ChannelInMain({}: // userProp,
{
    // userProp: UserProperty;
}) {
    // const vvv: Map<string, string> = new Map();
    // const signalMap = useRef(vvv);
    // setSignal = (key: string, value: string) => {
    //     signalMap.current.set(key, value);
    // };
    // getSignal = (key: string) => {
    //     let val = signalMap.current.get(key);
    //     if (val == undefined || val == null) {
    //         val = "";
    //     }
    //     return val;
    // };
    // removeSignal = (key: string) => {
    //     console.log("MainHost:signalMap:", signalMap.current);
    //     signalMap.current.delete(key);
    //     console.log("MainHost:signalMap2:", signalMap.current);
    // };

    const receivedMsgId = useRef(0);
    setReceivedMsgId = (msgId: number) => {
        receivedMsgId.current = msgId;
    };
    isMsgIdReceived = (msgId: number) => {
        return msgId <= receivedMsgId.current;
    };

    //监听message事件
    window.addEventListener("message", handleMsgReceived, false);

    return <div></div>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const syncAddress2WcHost = async (
    chainId: string | number,
    accountAddr: string
) => {
    const chainKey = "eip155:" + chainId;
    // msgIndex.current = msgIndex.current + 1;
    const msg: Message = {
        channelId: getChannelId(),
        msgType: "syncAddress",
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

    await sendMsgToWcHost(getWalletConnectHost(), msg);
};

////

////

export const sendMsgToWcHost = async (
    walletconnectHost: string,
    msg: Message
) => {
    let childFrameObj = document.getElementById("w3eaWalletconnect");
    if (childFrameObj == null || childFrameObj == undefined) {
        const emsg =
            "error sendMsgToWcHost, w3eaWalletconnect obj error:" +
            childFrameObj;
        console.log(emsg);
        throw Error(emsg);
    }
    try {
        childFrameObj.contentWindow.postMessage(
            JSON.stringify(msg),
            walletconnectHost
        ); //window.postMessage
    } catch (e) {
        const emst = "error sendMsgToWcHost2.";
        console.log(emst, e);
        throw Error(emst);
    }
};

// const sendMsgUntilSuccess = async (walletconnectHost: string, msg: Message) => {
//     let childFrameObj = document.getElementById("w3eaWalletconnect");
//     let cnt = 0;
//     setSignal("" + msg.msgIdx, "" + msg.msgIdx);

//     while (true) {
//         await sleep(1000);

//         if (childFrameObj == undefined || childFrameObj == null) {
//             childFrameObj = document.getElementById("w3eaWalletconnect");
//         }
//         if (childFrameObj == null || childFrameObj == undefined) {
//             continue;
//         }
//         const ss = getSignal("" + msg.msgIdx);

//         if (ss == "") {
//             // here,means msg had been received success
//             break;
//         }
//         if (getAccountAddr == undefined || getAccountAddr() == "") {
//             // current page is invalid.
//             console.log("ChannelInMain, current page is invalid,break");
//             break;
//         }

//         let label = "ok";
//         try {
//             childFrameObj.contentWindow.postMessage(
//                 JSON.stringify(msg),
//                 walletconnectHost
//             ); //window.postMessage
//             label = "ok";
//         } catch (e) {
//             label = "error";
//             if (cnt % 10 == 0) {
//                 console.log(
//                     "MainHost:warn, send to child error msg:",
//                     e,
//                     "childFrameObj:",
//                     childFrameObj
//                 );
//             }
//             // console.log("MainHost:send to child error, retry.", e);
//         }
//         if (cnt % 10 == 0) {
//             console.log("MainHost:getSignal,", ss);
//             console.log(
//                 `MainHost,cnt=${cnt},label=${label},try sendMsgToWcHost to `,
//                 walletconnectHost,
//                 msg
//             );
//         }

//         cnt++;
//     }
// };

async function handleMsgReceived(event: { origin: any; data: string }) {
    console.log("Main,handleMsgReceived,event:", event);
    console.log(
        "Main,handleMsgReceived,getWalletConnectHost:",
        getWalletConnectHost()
    );
    if (event.origin != getWalletConnectHost()) {
        return;
    }

    const msg: Message = JSON.parse(event.data);

    if (msg.channelId != getChannelId()) {
        console.log(
            "in main,channelId error.getChannelId=" + getChannelId(),
            ",msg.channelId=" + msg.channelId,
            "msgType=" + msg.msgType
        );
        return;
    }

    if (isMsgIdReceived(msg.msgIdx)) {
        console.log("in main,msgIdx isMsgIdReceived.", msg.msgIdx);
        return;
    }

    setReceivedMsgId(msg.msgIdx);

    if (msg.msgType == "syncAddress") {
        syncAddress2WcHost(getChainObject().id, getAccountAddr());
    } else if (msg.msgType == "signMessage") {
        await signTextMessage(msg);
    } else if (msg.msgType == "signTypedData") {
        await signTypedDataMessage(msg);
    } else if (msg.msgType == "sendTransaction") {
        await sendTransaction(msg);
    } else if (msg.msgType == "checkPasswd") {
        checkPasswd();
    } else {
        console.log("MainHost:not supported msg:", msg);
    }
}
