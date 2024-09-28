"use client";

import { signAuth } from "../privateinfo/lib/signAuthTypedData";

import {
    getOwnerIdBigBrother,
    getOwnerIdLittleBrother,
    getPasswdAccount,
    PrivateInfoType,
} from "../privateinfo/lib/keyTools";

import {
    generateRandomDigitInteger,
    generateRandomString,
} from "../../lib/myRandom";

import { aesEncrypt, aesDecrypt } from "../../lib/crypto.mjs";

import {
    keccak256,
    encodePacked,
    encodeAbiParameters,
    parseAbiParameters,
    parseEther,
    formatEther,
    encodeFunctionData,
    parseAbiItem,
} from "viem";
import { chainPublicClient } from "../../lib/chainQueryClient";

import abis from "../../serverside/blockchain/abi/abis";

import React, { useState, useEffect, useRef, MutableRefObject } from "react";

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Textarea,
} from "@nextui-org/react";

import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/react";
import { Switch } from "@nextui-org/react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Link,
    Image,
    Input,
    Tabs,
    Tab,
    Checkbox,
} from "@nextui-org/react";

import { useFormState, useFormStatus } from "react-dom";

import { getOwnerIdSelfByBigBrother } from "../privateinfo/lib/keyTools";
import {
    queryAccount,
    queryQuestionIdsEnc,
    queryTokenDetail,
    queryNftDetail,
    queryNftsOwnerUri,
    formatUnits,
    parseUnits,
    queryEthBalance,
} from "../../lib/chainQuery";
import { getInputValueById, setInputValueById } from "../../lib/elementById";

import {
    newAccountAndTransferETH,
    createTransaction,
    changePasswdAddr,
} from "../../serverside/blockchain/chainWrite";

import { PrivateInfo as PrivateInfo4Chg } from "./privateinfo4chg";

import { getChainObj } from "../../lib/myChain";

import { SelectedChainIcon } from "../../navbar/chainIcons";

import {
    Menu,
    UserInfo,
    uiToString,
    Transaction,
    ChainCode,
} from "../../lib/myTypes";

import lineaBridge from "./bridge/lineaBridge";
import { UserProperty } from "@/app/storage/LocalStore";

const questionNosEncode = (qNo1: string, qNo2: string, pin: string) => {
    let questionNosEnc = qNo1 + qNo2 + generateRandomString();
    console.log("questionNosEnc1:", questionNosEnc);
    questionNosEnc = aesEncrypt(questionNosEnc, pin);
    console.log("questionNosEnc2:", questionNosEnc);
    return questionNosEnc;
};

export default function SendChgPrivateInfo({
    userProp,
    accountAddrList,
    forTransaction,
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
    forTransaction: boolean;
}) {
    const chainObj = getChainObj(userProp.state.selectedChainCode);

    const explorerUrl = chainObj.blockExplorers.default.url;

    const explorerTxUrl = (hash: string) => {
        if (hash == undefined || hash == null) {
            return "";
        }
        let idx = hash.indexOf("::");
        let xx = hash;
        if (idx > 0) {
            xx = hash.substring(0, idx);
            return `${explorerUrl}/tx/${xx}?tab=internal`;
        } else {
            return `${explorerUrl}/tx/${xx}`;
        }
    };

    const [currentTabTag, setCurrentTabTag] = useState("chgPrivate");

    const handleSelectionChage = (e: any) => {
        setCurrentTabTag(e.toString());
    };

    const [privateinfoHidden, setPrivateinfoHidden] = useState(false);

    const [buttonText, setButtonText] = useState("Send ETH");

    const bigBrotherAccountCreated = () => {
        return accountAddrList.length > 1;
    };
    const [privateFillInOk, setPrivateFillInOk] = useState(0);

    const updateFillInOk = () => {
        let x = privateFillInOk;
        setPrivateFillInOk(x + 1);

        console.log("updateFillInOk, currentTabTag:", currentTabTag);
        // Send transactions while creating an account
        let msg = "Send ETH";
        if (currentTabTag == "sendETH") {
            if (myAccountCreated) {
                msg = "Send ETH";
            } else {
                // todo it's different when create other account.
                msg = "Create Account and Send ETH";
            }
        } else if (currentTabTag == "chgPrivate") {
            if (myAccountCreated) {
                msg = "Change PrivateInfo";
            } else {
                // todo it's different when create other account.
                msg = "Create First Account";
            }
        }
        setButtonText(msg);
    };
    const [inputFillInChange, setInputFillInChange] = useState(0);
    const updateInputFillInChange = () => {
        let x = inputFillInChange + 1;
        setInputFillInChange(x);
    };

    const [myAccountCreated, setMyAccountCreated] = useState(false);

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

    const [currentTx, setCurrentTx] = useState("");
    const updateCurrentTx = (tx: string) => {
        setCurrentTx(tx);
    };

    const preparedPriceRef = useRef({
        preparedMaxFeePerGas: undefined,
        preparedGasPrice: undefined,
    });
    const [transactionFee, setTransactionFee] = useState("? SOL");

    const getOwnerId = () => {
        return getOwnerIdLittleBrother(
            userProp.state.bigBrotherOwnerId,
            userProp.state.selectedOrderNo
        );
    };

    useEffect(() => {
        const refreshFee = async () => {
            try {
                const receiverAddr = getInputValueById(
                    "id_newtrans_receiver_addr_ui"
                );
                const amountETH = getInputValueById("id_newtrans_amount_ui");

                if (
                    currentPriInfoRef.current.email != "" &&
                    currentPriInfoRef.current.pin != "" &&
                    currentPriInfoRef.current.question1answer != "" &&
                    currentPriInfoRef.current.question2answer != "" &&
                    currentPriInfoRef.current.confirmedSecondary == true
                ) {
                    const passwdAccount = getPasswdAccount(
                        currentPriInfoRef.current
                    );

                    const questionNosEnc = questionNosEncode(
                        currentPriInfoRef.current.firstQuestionNo,
                        currentPriInfoRef.current.secondQuestionNo,
                        currentPriInfoRef.current.pin
                    );

                    let eFee = {};
                    if (currentTabTag == "chgPrivate") {
                        const oldPasswdAccount = getPasswdAccount(
                            oldPriInfoRef.current
                        );

                        eFee = await estimateChgPasswdFee(
                            userProp.state.bigBrotherOwnerId,
                            accountAddrList[0],
                            oldPasswdAccount,
                            passwdAccount.address,
                            chainObj,
                            bigBrotherAccountCreated(),
                            questionNosEnc,
                            preparedPriceRef
                        );
                    } else {
                        if (receiverAddr != "" && amountETH != "") {
                            eFee = await estimateTransFee(
                                getOwnerId(),
                                userProp.state.selectedAccountAddr,
                                passwdAccount,
                                receiverAddr,
                                amountETH,
                                "",
                                chainObj,
                                myAccountCreated,
                                questionNosEnc,
                                preparedPriceRef
                            );
                        } else {
                            return;
                        }
                    }

                    console.log(
                        ",estimateFee...XXX:",
                        currentTabTag,
                        "Fee:",
                        eFee
                    );

                    if (eFee.feeDisplay.indexOf("ERROR") >= 0) {
                        console.log(
                            "[ERROR]1:" +
                                eFee.feeDisplay +
                                "....currentPriInfoRef.current:",
                            currentPriInfoRef.current
                        );
                        console.log(
                            "[ERROR]2:" +
                                eFee.feeDisplay +
                                "....oldPriInfoRef.current:",
                            oldPriInfoRef.current
                        );
                    } else {
                        if (privateFillInOk > 0) {
                            setPrivateinfoHidden(true);
                        }
                    }
                    setTransactionFee(eFee.feeDisplay);
                } else {
                    setTransactionFee("? SOL.");
                }
            } catch (e) {
                console.log("seek error:", e);
                let kk = e.toString().indexOf(" ");
                setTransactionFee(e.toString().substring(0, kk));
            }
        };

        //
        refreshFee();
    }, [privateFillInOk, inputFillInChange]);

    //   const privateInfo: PrivateInfoType = {
    //     email: email,
    //     pin: pin1,
    //     question1answer: question1_answer_1,
    //     question2answer: question2_answer_1,
    //   };

    // className="max-w-[400px]"

    useEffect(() => {
        // init this component page.
        // console.log("init ...xxx...");
        // setCurrentTabTag("sendETH");
        // setPrivateinfoHidden(false);
        // setPrivateFillInOk(0);
        // setButtonText("Send ETH");
        // setInputFillInChange(0);
        // currentPriInfoRef.current = piInit;
        // oldPriInfoRef.current = piInit;
        // setCurrentTx("");
        // inputMaxFeePerGasRef.current = "0";
        // setTransactionFee("? ETH");
        //
        //

        const fetchMyAccountStatus = async () => {
            // suffix with 0000
            console.log(
                "queryAccount...1,sendchgprivateinfo:",
                userProp.state.selectedChainCode,
                ",",
                userProp.serverSidePropState.factoryAddr,
                ",",
                getOwnerId()
            );

            if (
                userProp.state.selectedChainCode == ChainCode.UNKNOW ||
                userProp.serverSidePropState.factoryAddr == "" ||
                userProp.serverSidePropState.factoryAddr == undefined
            ) {
                return;
            }

            const acct = await queryAccount(
                userProp.state.selectedChainCode,
                userProp.serverSidePropState.factoryAddr,
                getOwnerId()
            );
            console.log(
                "my Account for new transaction:",
                acct,
                getOwnerId(),
                userProp.state.bigBrotherOwnerId
            );
            if (acct.accountAddr != userProp.state.selectedAccountAddr) {
                console.log(
                    "develop error!",
                    userProp.state.bigBrotherOwnerId,
                    userProp.state.selectedAccountAddr,
                    getOwnerId(),
                    acct.accountAddr
                );
                // demo 临时注释
                // throw new Error("develop error2!");
            }
            setMyAccountCreated(acct?.created);
        };
        if (userProp.state.selectedAccountAddr != "") {
            fetchMyAccountStatus();
        }
    }, [userProp.state, userProp.serverSidePropState]);

    return (
        <>
            <div id="var_tmp" style={{ display: "none" }}>
                <input id="id_estimateTransFeeTriggerText" />
                <input id="id_estimateTransFeeTriggerTime" />
                <input id="id_qCount" />
                <input id="id_lastError" />
            </div>

            <div>
                <PrivateInfo4Chg
                    userProp={userProp}
                    accountAddrList={accountAddrList}
                    forTransaction={false}
                    currentPriInfoRef={currentPriInfoRef}
                    oldPriInfoRef={oldPriInfoRef}
                    updateFillInOk={updateFillInOk}
                    privateinfoHidden={privateinfoHidden}
                ></PrivateInfo4Chg>
            </div>
            <div
                style={
                    transactionFee.indexOf("ERROR") >= 0
                        ? {
                              marginTop: "10px",
                              width: "800px",
                              fontWeight: "bold",
                          }
                        : {
                              marginTop: "10px",
                              width: "300px",
                              fontWeight: "bold",
                          }
                }
            >
                <Input
                    readOnly
                    color="secondary"
                    type="text"
                    label="Transaction Fee:"
                    placeholder=""
                    defaultValue={transactionFee}
                    value={transactionFee}
                    radius="sm"
                    style={{ fontWeight: "bold", fontSize: "18px" }}
                />
            </div>
            <div
                style={
                    currentTx != ""
                        ? { display: "block", marginTop: "10px" }
                        : { display: "none" }
                }
            >
                <p>Transaction:</p>
                <Link
                    isExternal
                    href={`${explorerTxUrl(currentTx)}`}
                    showAnchorIcon
                >
                    {currentTx}
                </Link>
            </div>
            <div
                style={
                    currentTx == undefined || currentTx == ""
                        ? { display: "block" }
                        : { display: "none" }
                }
            >
                <div
                    style={
                        privateFillInOk > 0 &&
                        transactionFee.indexOf("ERROR") < 0
                            ? { display: "block" }
                            : { display: "none" }
                    }
                >
                    <CreateTransaction
                        myOwnerId={getOwnerId()}
                        verifyingContract={userProp.state.selectedAccountAddr}
                        email={userProp.state.email}
                        chainObj={chainObj}
                        buttonText={buttonText}
                        myAccountCreated={myAccountCreated}
                        oldPriInfoRef={oldPriInfoRef}
                        currentPriInfoRef={currentPriInfoRef}
                        preparedPriceRef={preparedPriceRef}
                        updateCurrentTx={updateCurrentTx}
                        currentTabTag={currentTabTag}
                    />
                </div>
            </div>
        </>
    );
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function CreateTransaction({
    myOwnerId,
    verifyingContract,
    email,
    chainObj,
    buttonText,
    myAccountCreated,
    oldPriInfoRef,
    currentPriInfoRef,
    preparedPriceRef,
    updateCurrentTx,
    currentTabTag,
}: {
    myOwnerId: string;
    verifyingContract: string;
    email: string;
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
    };
    buttonText: string;
    myAccountCreated: boolean;
    oldPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    preparedPriceRef: any;
    updateCurrentTx: any;
    currentTabTag: string;
}) {
    const { pending } = useFormStatus();

    const handleClick = async (event) => {
        if (pending) {
            event.preventDefault();
            return;
        }

        if (
            currentPriInfoRef.current.pin == "" ||
            currentPriInfoRef.current.question1answer == "" ||
            currentPriInfoRef.current.question2answer == ""
        ) {
            console.log("private info invalid:", currentPriInfoRef.current);
            alert("please input private info first!");
            return;
        }

        if (currentTabTag == "chgPrivate") {
            if (
                oldPriInfoRef.current.pin == "" ||
                oldPriInfoRef.current.question1answer == "" ||
                oldPriInfoRef.current.question2answer == ""
            ) {
                console.log("old private info invalid:", oldPriInfoRef.current);
                alert("please input old private info first!");
                return;
            }

            const oldPasswdAccount = getPasswdAccount(oldPriInfoRef.current);
            const newPasswdAccount = getPasswdAccount(
                currentPriInfoRef.current
            );

            let myDetectEstimatedFee = BigInt(0);

            const newQuestionNosEnc = questionNosEncode(
                currentPriInfoRef.current.firstQuestionNo,
                currentPriInfoRef.current.secondQuestionNo,
                currentPriInfoRef.current.pin
            );

            const tx = await executeChgPasswd(
                myOwnerId, // bigBrotherOwnerId,
                verifyingContract, // bigBrotherAccountAddr,
                oldPasswdAccount,
                newPasswdAccount.address,
                chainObj,
                myAccountCreated,
                newQuestionNosEnc,
                preparedPriceRef
            );

            updateCurrentTx(tx);
        } else {
            let receiverAddr = getInputValueById(
                "id_newtrans_receiver_addr_ui"
            );
            setInputValueById("id_newtrans_receiver_addr", receiverAddr);

            let amountETH = getInputValueById("id_newtrans_amount_ui");

            if (
                receiverAddr == null ||
                receiverAddr.trim().length != 42 ||
                receiverAddr.trim().startsWith("0x") == false
            ) {
                alert("Receiver Address invalid!");
                return;
            }
            if (isNaN(parseFloat(amountETH))) {
                alert("Amount invalid!");
                return;
            }

            // let pin1 = getInputValueById("id_private_pin_1");
            // let question1_answer_1 = getInputValueById(
            //     "id_private_question1_answer_1"
            // );
            // let question2_answer_1 = getInputValueById(
            //     "id_private_question2_answer_1"
            // );

            // myOwnerId
            const passwdAccount = getPasswdAccount(currentPriInfoRef.current);

            // keccak256(abi.encode(...));
            console.log(
                "encodeAbiParameters1111zzzz:",
                receiverAddr,
                amountETH
            );
            let myDetectEstimatedFee = BigInt(0);

            const questionNosEnc = questionNosEncode(
                currentPriInfoRef.current.firstQuestionNo,
                currentPriInfoRef.current.secondQuestionNo,
                currentPriInfoRef.current.pin
            );

            const tx = await executeTransaction(
                myOwnerId,
                verifyingContract,
                passwdAccount,
                receiverAddr,
                amountETH,
                "",
                chainObj,
                myAccountCreated,
                questionNosEnc,
                preparedPriceRef
            );

            updateCurrentTx(tx);
        }

        // signature: signature, eoa: eoa, nonce: nonce.toString()
        // document.getElementById("id_newtrans_owner_id").value = ownerId;
        // document.getElementById("id_newtrans_signature").value = sign.signature;
        // document.getElementById("id_newtrans_passwd_addr").value = sign.eoa;
        // document.getElementById("id_newtrans_nonce").value = sign.nonce;
    };

    return (
        // <button aria-disabled={pending} type="submit" onClick={handleClick}>
        //   Login
        // </button>
        <div
            style={{
                marginTop: "10px",
                marginLeft: "300px",
                width: "300px",
            }}
        >
            <div>
                {/* <Checkbox defaultSelected={false}>
                    <p style={{ fontSize: "14px" }}>Add to Batch</p>
                </Checkbox> */}
            </div>
            <Button
                disabled={pending}
                type="button"
                onPress={handleClick}
                color="primary"
                style={{ marginTop: "3px", marginLeft: "28px" }}
            >
                {buttonText}
            </Button>
        </div>
    );
}

async function estimateChgPasswdFee(
    bigBrotherOwnerId: string,
    bigBrotherAccountAddr: string,
    passwdAccount: any,
    newPasswdAddr: string,
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
    bigBrotherAccountCreated: boolean,
    questionNos: string,
    preparedPriceRef: any
) {
    let myDetectEstimatedFee = BigInt(0);
    console.log(
        "estimateChgPasswdFee...",
        bigBrotherOwnerId,
        bigBrotherAccountAddr,
        "bigBrotherAccountCreated=" + bigBrotherAccountCreated
    );
    let detectRes: {
        realEstimatedFee: bigint;
        maxFeePerGas: bigint; //eip-1559
        gasPrice: bigint; // Legacy
        gasCount: bigint;
        success: boolean;
        msg: string;
    } = {};
    for (let k = 0; k < 15; k++) {
        let argumentsHash = encodeAbiParameters(
            [
                { name: "funcId", type: "uint256" },
                { name: "newPasswdAddr", type: "address" },
                { name: "newQuestionNos", type: "bytes32" },
                { name: "estimatedFee", type: "uint256" },
            ],
            [
                BigInt(2),
                newPasswdAddr,
                keccak256(questionNos),
                myDetectEstimatedFee,
            ]
        );
        console.log("encodeAbiParametersxx2222:", argumentsHash);
        argumentsHash = keccak256(argumentsHash);
        console.log("encodeAbiParametersxx3333:", argumentsHash);
        let chainId = chainObj.id;
        if (!bigBrotherAccountCreated) {
            alert("No account is currently created in email. not supported.");
            return {};
        }
        let withZeroNonce = !bigBrotherAccountCreated;
        const sign = await signAuth(
            passwdAccount,
            chainId,
            bigBrotherAccountAddr,
            chainObj,
            argumentsHash, // "" //
            withZeroNonce
        );

        const onlyQueryFee = true;

        if (bigBrotherAccountCreated) {
            console.log(
                "account has created, do chg password:",
                bigBrotherOwnerId,
                bigBrotherAccountAddr
            );
            detectRes = await changePasswdAddr(
                chainObj.chainCode,
                bigBrotherOwnerId,
                bigBrotherAccountAddr,
                passwdAccount.address,
                newPasswdAddr,
                questionNos,
                sign.signature,
                onlyQueryFee,
                myDetectEstimatedFee,
                BigInt(0),
                BigInt(0)
            );
        } else {
            console.log("error...not supported...");
            return {};
        }

        if (!detectRes.success) {
            return { feeDisplay: "ERROR: " + detectRes.msg };
        }
        console.log(
            "chg passwd myDetectEstimatedFee=" + myDetectEstimatedFee,
            "query estimatedFee detect,k=" + k + ",result:",
            detectRes
        );
        if (Number(myDetectEstimatedFee) > Number(detectRes.realEstimatedFee)) {
            preparedPriceRef.current = {
                preparedMaxFeePerGas: detectRes.maxFeePerGas,
                preparedGasPrice: detectRes.gasPrice,
            };
            break;
        } else {
            myDetectEstimatedFee = BigInt(
                Number(detectRes.realEstimatedFee) +
                    Number(
                        detectRes.maxFeePerGas != undefined &&
                            detectRes.maxFeePerGas > 0
                            ? detectRes.maxFeePerGas
                            : detectRes.gasPrice
                    ) *
                        1000
            );
        }
    }
    const feeDisplay = formatEther(myDetectEstimatedFee) + " ETH";
    return { ...detectRes, feeDisplay, feeWei: myDetectEstimatedFee };
}

async function executeChgPasswd(
    bigBrotherOwnerId: string,
    bigBrotherAccountAddr: string,
    passwdAccount: any,
    newPasswdAddr: string,
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
    bigBrotherAccountCreated: boolean,
    newQuestionNos: string,
    preparedPriceRef: any
) {
    let eFee = await estimateChgPasswdFee(
        bigBrotherOwnerId,
        bigBrotherAccountAddr,
        passwdAccount,
        newPasswdAddr,
        chainObj,
        bigBrotherAccountCreated,
        newQuestionNos,
        preparedPriceRef
    );
    console.log("user realtime fee, when changing Passwd:", eFee);
    if (eFee.feeWei == undefined || eFee.feeWei == 0) {
        throw Error("estimateChgPasswdFee realtime fee ERROR.");
    }

    let argumentsHash = encodeAbiParameters(
        [
            { name: "funcId", type: "uint256" },
            { name: "newPasswdAddr", type: "address" },
            { name: "newQuestionNos", type: "bytes32" },
            { name: "estimatedFee", type: "uint256" },
        ],
        [BigInt(2), newPasswdAddr, keccak256(newQuestionNos), eFee.feeWei]
    );

    console.log("encodeAbiParameters2222ccc:", argumentsHash);
    argumentsHash = keccak256(argumentsHash);
    console.log("encodeAbiParameters3333ddd:", argumentsHash);
    let chainId = chainObj.id;

    if (!bigBrotherAccountCreated) {
        alert("No account is currently created in email. not supported2.");
        return;
    }
    let withZeroNonce = !bigBrotherAccountCreated;
    const sign = await signAuth(
        passwdAccount,
        chainId,
        bigBrotherAccountAddr,
        chainObj,
        argumentsHash, // "" //
        withZeroNonce
    );

    let detectRes: {
        realEstimatedFee: bigint;
        preparedMaxfeePerGas: bigint;
        preparedGasPrice: bigint;
        gasCount: bigint;
        success: boolean;
        msg: string;
    } = {};

    const onlyQueryFee = false;

    if (bigBrotherAccountCreated) {
        console.log(
            "big brother account has created, do chg passwd:",
            bigBrotherOwnerId,
            bigBrotherAccountAddr
        );
        detectRes = await changePasswdAddr(
            chainObj.chainCode,
            bigBrotherOwnerId,
            bigBrotherAccountAddr,
            passwdAccount.address,
            newPasswdAddr,
            newQuestionNos,
            sign.signature,
            onlyQueryFee,
            eFee.feeWei,
            preparedPriceRef.current.preparedMaxFeePerGas,
            preparedPriceRef.current.preparedGasPrice
        );
    } else {
        console.log(
            "big brother account has not created, not supperoted...!!!:",
            bigBrotherOwnerId,
            bigBrotherAccountAddr
        );
        alert("not supported ...!");
    }

    if (!detectRes.success) {
        console.log("ERRORx1:", detectRes);
        return "ERROR: " + detectRes.msg;
    }

    console.log("detectRes.x1.tx=" + detectRes.tx);
    return detectRes.tx;
}

async function estimateTransFee(
    myOwnerId: string,
    myContractAccount: string,
    passwdAccount: any,
    receiverAddr: string,
    receiverAmountETH: string,
    receiverData: string,
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
    myAccountCreated: boolean,
    questionNos: string,
    preparedPriceRef: any
) {
    let myDetectEstimatedFee = BigInt(0);
    const receiverAmt = parseEther(receiverAmountETH);
    console.log(
        "estimateTransFee...",
        myOwnerId,
        myContractAccount,
        "myAccountCreated=" + myAccountCreated
    );
    let detectRes: {
        realEstimatedFee: bigint;
        maxFeePerGas: bigint; //eip-1559
        gasPrice: bigint; // Legacy
        gasCount: bigint;
        success: boolean;
        msg: string;
    } = {};
    for (let k = 0; k < 15; k++) {
        let argumentsHash = encodeAbiParameters(
            [
                { name: "funcId", type: "uint256" },
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "data", type: "bytes" },
                { name: "estimatedFee", type: "uint256" },
            ],
            [
                BigInt(3),
                receiverAddr,
                receiverAmt,
                receiverData,
                myDetectEstimatedFee,
            ]
        );
        console.log("encodeAbiParameters2222:", argumentsHash);
        argumentsHash = keccak256(argumentsHash);
        console.log("encodeAbiParameters3333:", argumentsHash);
        let chainId = chainObj.id;
        let withZeroNonce = !myAccountCreated;
        const sign = await signAuth(
            passwdAccount,
            chainId,
            myContractAccount,
            chainObj,
            argumentsHash, // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" //
            withZeroNonce
        );

        const onlyQueryFee = true;

        if (myAccountCreated) {
            console.log(
                "account has created, do createTransaction0:",
                myOwnerId,
                myContractAccount
            );
            detectRes = await createTransaction(
                chainCode,
                myOwnerId,
                myContractAccount,
                passwdAccount.address,
                receiverAddr,
                receiverAmt,
                receiverData,
                sign.signature,
                onlyQueryFee,
                myDetectEstimatedFee,
                BigInt(0),
                BigInt(0)
            );
        } else {
            console.log(
                "account has not created, do newAccountAndTrans0:",
                myOwnerId,
                myContractAccount
            );
            detectRes = await newAccountAndTransferETH(
                myOwnerId,
                passwdAccount.address,
                questionNos,
                receiverAddr,
                receiverAmt,
                receiverData,
                sign.signature,
                onlyQueryFee,
                myDetectEstimatedFee,
                BigInt(0),
                BigInt(0)
            );
        }

        if (!detectRes.success) {
            return { feeDisplay: "ERROR: " + detectRes.msg };
        }
        console.log(
            "myDetectEstimatedFee=" + myDetectEstimatedFee,
            "query estimatedFee detect,k=" + k + ",result:",
            detectRes
        );
        if (Number(myDetectEstimatedFee) > Number(detectRes.realEstimatedFee)) {
            preparedPriceRef.current = {
                preparedMaxFeePerGas: detectRes.maxFeePerGas,
                preparedGasPrice: detectRes.gasPrice,
            };
            break;
        } else {
            myDetectEstimatedFee = BigInt(
                Number(detectRes.realEstimatedFee) +
                    Number(
                        detectRes.maxFeePerGas != undefined &&
                            detectRes.maxFeePerGas > 0
                            ? detectRes.maxFeePerGas
                            : detectRes.gasPrice
                    ) *
                        1000
            );
        }
    }
    const feeDisplay = formatEther(myDetectEstimatedFee) + " ETH";
    return { ...detectRes, feeDisplay, feeWei: myDetectEstimatedFee };
}

async function executeTransaction(
    myOwnerId: string,
    myContractAccount: string,
    passwdAccount: any,
    receiverAddr: string,
    receiverAmountETH: string,
    receiverData: string,
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
    myAccountCreated: boolean,
    questionNos: string,
    preparedPriceRef: any
) {
    let eFee = await estimateTransFee(
        myOwnerId,
        myContractAccount,
        passwdAccount,
        receiverAddr,
        receiverAmountETH,
        receiverData,
        chainObj,
        myAccountCreated,
        questionNos,
        preparedPriceRef
    );
    console.log("user realtime fee, when executeing:", eFee);
    if (eFee.feeWei == undefined || eFee.feeWei == 0) {
        throw Error("estimateTransFee realtime fee ERROR.");
    }
    const receiverAmt = parseEther(receiverAmountETH);

    let argumentsHash = encodeAbiParameters(
        [
            { name: "funcId", type: "uint256" },
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "data", type: "bytes" },
            { name: "estimatedFee", type: "uint256" },
        ],
        [BigInt(3), receiverAddr, receiverAmt, receiverData, eFee.feeWei]
    );
    console.log("encodeAbiParameters2222aaa:", argumentsHash);
    argumentsHash = keccak256(argumentsHash);
    console.log("encodeAbiParameters3333bbb:", argumentsHash);
    let chainId = chainObj.id;
    let withZeroNonce = !myAccountCreated;
    const sign = await signAuth(
        passwdAccount,
        chainId,
        myContractAccount,
        chainObj,
        argumentsHash, // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" //
        withZeroNonce
    );

    let detectRes: {
        realEstimatedFee: bigint;
        preparedMaxfeePerGas: bigint;
        preparedGasPrice: bigint;
        gasCount: bigint;
        success: boolean;
        msg: string;
    } = {};

    const onlyQueryFee = false;

    if (myAccountCreated) {
        console.log(
            "account has created, do createTransaction:",
            myOwnerId,
            myContractAccount
        );
        detectRes = await createTransaction(
            chainCode,
            myOwnerId,
            myContractAccount,
            passwdAccount.address,
            receiverAddr,
            receiverAmt,
            receiverData,
            sign.signature,
            onlyQueryFee,
            eFee.feeWei,
            preparedPriceRef.current.preparedMaxFeePerGas,
            preparedPriceRef.current.preparedGasPrice
        );
    } else {
        console.log(
            "account has not created, do newAccountAndTrans:",
            myOwnerId,
            myContractAccount
        );
        detectRes = await newAccountAndTransferETH(
            myOwnerId,
            passwdAccount.address,
            questionNos,
            receiverAddr,
            receiverAmt,
            receiverData,
            sign.signature,
            onlyQueryFee,
            eFee.feeWei,
            preparedPriceRef.current.preparedMaxFeePerGas,
            preparedPriceRef.current.preparedGasPrice
        );
    }

    if (!detectRes.success) {
        console.log("ERROR:", detectRes);
        return "ERROR: " + detectRes.msg;
    }

    console.log("detectRes.tx=" + detectRes.tx);
    return detectRes.tx;
}
