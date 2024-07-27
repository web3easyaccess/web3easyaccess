"use client";

import { createAccount, chgPrivateInfo } from "../../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Autocomplete, AutocompleteItem, Textarea } from "@nextui-org/react";
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Checkbox,
    Tooltip,
} from "@nextui-org/react";

import { getInputValueById, setInputValueById } from "../../lib/elementById";
import { aesEncrypt, aesDecrypt } from "../../lib/crypto.mjs";
import {
    generateRandomDigitInteger,
    generateRandomString,
} from "../../lib/myRandom";

import {
    keccak256,
    encodePacked,
    encodeAbiParameters,
    parseAbiParameters,
    parseEther,
} from "viem";
import { useRouter } from "next/navigation";
import { queryAccount, queryQuestionIdsEnc } from "../../lib/chainQuery";

import pq from "../privateinfo/passwdQuestion.json";

import Passwd from "../privateinfo/passwd2";
import {
    getOwnerIdBigBrother,
    getPasswdAccount,
    PrivateInfoType,
} from "../privateinfo/lib/keyTools";
import { signAuth } from "../privateinfo/lib/signAuthTypedData";

import popularAddr from "../privateinfo/lib/popularAddr";
import { useRef, useState, useEffect } from "react";

import { Menu, UserInfo, uiToString, Transaction } from "../../lib/myTypes";
import { getChainObj } from "../../lib/myChain";

const OP_TYPE = {
    // "Enter the email's new information for the first time",
    OP_newInfoFirstTime: "OP_newInfoFirstTime",

    // "Enter the email's new information for the second time",
    OP_newInfoSecondTime: "OP_newInfoSecondTime",

    // "Enter the information for authentication(permit)",
    OP_infoForPermit: "OP_infoForPermit",
};

const pwdRegex = new RegExp(
    "(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{10,30}"
);

export function PrivateInfo({
    currentUserInfo,
    forTransaction,
    currentPriInfoRef,
    oldPriInfoRef,
    updateFillInOk,
    privateinfoHidden,
}: {
    currentUserInfo: UserInfo;
    forTransaction: boolean;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    oldPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    updateFillInOk: any;
    privateinfoHidden: boolean;
}) {
    const questions = pq.questions[1];
    const bigBrotherAccountCreated = () => {
        console.log(
            "in bigBrotherAccountCreated, addr length x:",
            currentUserInfo.accountAddrList.length
        );
        return currentUserInfo.accountAddrList.length > 1;
    };

    let opTypeInit = OP_TYPE.OP_infoForPermit;
    if (bigBrotherAccountCreated()) {
        opTypeInit = OP_TYPE.OP_infoForPermit;
    } else {
        opTypeInit = OP_TYPE.OP_newInfoFirstTime;
    }

    const [submitOpType, setSubmitOpType] = useState(opTypeInit);
    const updateSubmitOpType = (newType: any) => {
        setSubmitOpType(newType);
    };
    useEffect(() => {
        updateSubmitOpType(opTypeInit);
    }, [opTypeInit]);

    console.log("PrivateInfo, currentPriInfoRef init...1");
    if (currentPriInfoRef.current.email == "") {
        console.log("PrivateInfo, currentPriInfoRef init...2");
        currentPriInfoRef.current.email = currentUserInfo.email;
        currentPriInfoRef.current.pin = "";
        currentPriInfoRef.current.question1answer = "";
        currentPriInfoRef.current.question2answer = "";
        currentPriInfoRef.current.firstQuestionNo = "";
        currentPriInfoRef.current.secondQuestionNo = "";
        if (!bigBrotherAccountCreated()) {
            currentPriInfoRef.current.confirmedSecondary = false;
        } else {
            currentPriInfoRef.current.confirmedSecondary = true;
        }
    }

    oldPriInfoRef.current.email = currentUserInfo.email;
    oldPriInfoRef.current.pin = "";
    oldPriInfoRef.current.question1answer = "";
    oldPriInfoRef.current.question2answer = "";
    oldPriInfoRef.current.firstQuestionNo = "";
    oldPriInfoRef.current.secondQuestionNo = "";

    console.log("factoryAddr in privateinfo:", currentUserInfo.factoryAddr);

    const selectedQuestionIdsEncRef = useRef("");

    console.log(
        `privateinfo..123,forTransaction=${forTransaction},bigBrotherAccountCreated()=${bigBrotherAccountCreated()}`
    );

    const chainObj = getChainObj(currentUserInfo.chainCode);

    const forModification = () => {
        return bigBrotherAccountCreated() && !forTransaction;
    };

    const fetchBigBrothersQuestionNos = async (oldPin: string) => {
        if (oldPin != "") {
            console.log(
                "fetchBigBrothersQuestionNos:",
                currentUserInfo.bigBrotherOwnerId,
                currentUserInfo.accountAddrList[0]
            );
            const encQuestionNos = await queryQuestionIdsEnc(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                currentUserInfo.accountAddrList[0]
            );
            console.log("fetchBigBrothersQuestionNos, encNos:", encQuestionNos);
            const nos = aesDecrypt(encQuestionNos, oldPin);
            const no1 = nos.substring(0, 2);
            const no2 = nos.substring(2, 4);
            console.log(
                "forModification,quesion ids:",
                forModification(),
                no1,
                no2
            );
            if (forModification()) {
                oldPriInfoRef.current.firstQuestionNo = no1;
                oldPriInfoRef.current.secondQuestionNo = no2;
                // here .... setState....
            } else {
                currentPriInfoRef.current.firstQuestionNo = no1;
                currentPriInfoRef.current.secondQuestionNo = no2;
                setMyFirstQuestionNo(no1);
                setMySecondQuestionNo(no2);
            }
        }
    };

    const [pinErrorMsg, setPinErrorMsg] = useState("");

    const handlePinBlur = () => {
        console.log(
            "handlePinBlur,ac:",
            bigBrotherAccountCreated(),
            forTransaction
        );
        let pinX = getInputValueById("id_private_pin_1") as string;
        if (pinX.length == 0 || !pwdRegex.test(pinX)) {
            setPinErrorMsg(
                "PIN required: The length is greater than 10, contains special characters for upper and lower case letters"
            );
            return;
        }
        setPinErrorMsg("");

        if (!bigBrotherAccountCreated()) {
            let pin1 = getInputValueById("id_private_pin_1");
            let pin2 = getInputValueById("id_private_pin_2");
            console.log("Input lost focus,new user:", pin1, pin2);
            if (pin1.length > 0 && pin2.length > 0 && pin1 == pin2) {
                currentPriInfoRef.current = {
                    ...currentPriInfoRef.current,
                    pin: pin1,
                };
            } else {
                currentPriInfoRef.current = {
                    ...currentPriInfoRef.current,
                    pin: "",
                };
            }
        } else {
            // here, has created bigBrother.
            let myPin = "";
            if (forTransaction) {
                // just see pin1 ,forTransaction
                let pin1 = getInputValueById("id_private_pin_1");
                if (pin1.length > 0) {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        pin: pin1,
                    };
                } else {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        pin: "",
                    };
                }
                myPin = currentPriInfoRef.current.pin;
            } else {
                // here, for modification
                let pin_old = getInputValueById("id_private_pin_old");
                let pin1 = getInputValueById("id_private_pin_1");
                let pin2 = getInputValueById("id_private_pin_2");

                if (pin_old.length > 0) {
                    oldPriInfoRef.current = {
                        ...oldPriInfoRef.current,
                        pin: pin_old,
                    };
                } else {
                    oldPriInfoRef.current = {
                        ...oldPriInfoRef.current,
                        pin: "",
                    };
                }
                myPin = oldPriInfoRef.current.pin;
                if (pin1.length > 0 && pin2.length > 0 && pin1 == pin2) {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        pin: pin1,
                    };
                } else {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        pin: "",
                    };
                }
            }

            fetchBigBrothersQuestionNos(myPin);
        }
        console.log("privateinfo,pinBlur:", currentPriInfoRef.current);
        //
    };

    const handleQuestion1AnswerBlur = () => {
        // id_private_question1_answer_old
        if (!bigBrotherAccountCreated()) {
            let question1answer1 = getInputValueById(
                "id_private_question1_answer_1"
            );
            let question1answer2 = getInputValueById(
                "id_private_question1_answer_2"
            );
            console.log(
                "Input lost focus,q1,new user:",
                question1answer1,
                question1answer2
            );
            if (
                question1answer1.length > 0 &&
                question1answer2.length > 0 &&
                question1answer1 == question1answer2
            ) {
                currentPriInfoRef.current = {
                    ...currentPriInfoRef.current,
                    question1answer: question1answer1,
                };
            } else {
                currentPriInfoRef.current = {
                    ...currentPriInfoRef.current,
                    question1answer: "",
                };
            }
        } else {
            // here, has created bigBrother.
            if (forTransaction) {
                // just see question1answer1 ,forTransaction
                let question1answer1 = getInputValueById(
                    "id_private_question1_answer_1"
                );
                if (question1answer1.length > 0) {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question1answer: question1answer1,
                    };
                } else {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question1answer: "",
                    };
                }
            } else {
                // here, for modification
                let question1answer_old = getInputValueById(
                    "id_private_question1_answer_old"
                );
                let question1answer1 = getInputValueById(
                    "id_private_question1_answer_1"
                );
                let question1answer2 = getInputValueById(
                    "id_private_question1_answer_2"
                );

                if (question1answer_old.length > 0) {
                    oldPriInfoRef.current = {
                        ...oldPriInfoRef.current,
                        question1answer: question1answer_old,
                    };
                } else {
                    oldPriInfoRef.current = {
                        ...oldPriInfoRef.current,
                        question1answer: "",
                    };
                }
                if (
                    question1answer1.length > 0 &&
                    question1answer2.length > 0 &&
                    question1answer1 == question1answer2
                ) {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question1answer: question1answer1,
                    };
                } else {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question1answer: "",
                    };
                }
            }
        }
        console.log("privateinfo,q1answer blur:", currentPriInfoRef.current);
        //
    };

    const handleQuestion2AnswerBlur = () => {
        // id_private_question2_answer_old
        if (!bigBrotherAccountCreated()) {
            let question2answer1 = getInputValueById(
                "id_private_question2_answer_1"
            );
            let question2answer2 = getInputValueById(
                "id_private_question2_answer_2"
            );
            console.log(
                "Input lost focus,q1,new user:",
                question2answer1,
                question2answer2
            );
            if (
                question2answer1.length > 0 &&
                question2answer2.length > 0 &&
                question2answer1 == question2answer2
            ) {
                currentPriInfoRef.current = {
                    ...currentPriInfoRef.current,
                    question2answer: question2answer1,
                };
            } else {
                currentPriInfoRef.current = {
                    ...currentPriInfoRef.current,
                    question2answer: "",
                };
            }
        } else {
            // here, has created bigBrother.
            if (forTransaction) {
                // just see question2answer1 ,forTransaction
                let question2answer1 = getInputValueById(
                    "id_private_question2_answer_1"
                );
                if (question2answer1.length > 0) {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question2answer: question2answer1,
                    };
                } else {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question2answer: "",
                    };
                }
            } else {
                // here, for modification
                let question2answer_old = getInputValueById(
                    "id_private_question2_answer_old"
                );
                let question2answer1 = getInputValueById(
                    "id_private_question2_answer_1"
                );
                let question2answer2 = getInputValueById(
                    "id_private_question2_answer_2"
                );

                if (question2answer_old.length > 0) {
                    oldPriInfoRef.current = {
                        ...oldPriInfoRef.current,
                        question2answer: question2answer_old,
                    };
                } else {
                    oldPriInfoRef.current = {
                        ...oldPriInfoRef.current,
                        question2answer: "",
                    };
                }
                if (
                    question2answer1.length > 0 &&
                    question2answer2.length > 0 &&
                    question2answer1 == question2answer2
                ) {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question2answer: question2answer1,
                    };
                } else {
                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        question2answer: "",
                    };
                }
            }
        }
        console.log("privateinfo,q2answer blur:", currentPriInfoRef.current);
        //
    };

    const [myFirstQuestionNo, setMyFirstQuestionNo] = useState(
        currentPriInfoRef.current.firstQuestionNo
    );
    const [mySecondQuestionNo, setMySecondQuestionNo] = useState(
        currentPriInfoRef.current.secondQuestionNo
    );

    const onSelectionChange1 = (key: string) => {
        currentPriInfoRef.current = {
            ...currentPriInfoRef.current,
            firstQuestionNo: key,
        };
        setMyFirstQuestionNo(key);
    };
    const onSelectionChange2 = (key: string) => {
        currentPriInfoRef.current = {
            ...currentPriInfoRef.current,
            secondQuestionNo: key,
        };
        setMySecondQuestionNo(key);
    };

    const [resetFlagForFirstConfirm, setResetFlagForFirstConfirm] = useState(1);

    const resetAfterFirstConfirmed = () => {
        console.log("resetAfterFirstConfirmed...");
        setResetFlagForFirstConfirm(0);
        setTimeout(() => {
            setResetFlagForFirstConfirm(1);
        }, 100);
    };

    return (
        <>
            <div style={{ display: "none" }}>
                <input id="id_private_new_first_time_sign"></input>
                <input id="id_private_new_second_time_sign"></input>
            </div>
            <WarnMsgForNewBigBrother
                bigBrotherCreated={bigBrotherAccountCreated()}
            />

            <WarnMsgForSender
                forTransaction={forTransaction}
                currentUserInfo={currentUserInfo}
                bigBrotherAccountCreated={bigBrotherAccountCreated()}
            />

            <Card
                className="max-w-[800px]"
                style={
                    privateinfoHidden == false
                        ? { marginTop: "0px" }
                        : { marginTop: "0px", height: "1px" }
                }
            >
                <CardHeader className="flex gap-3">
                    <p style={{ fontWeight: "bold", fontSize: "20px" }}>
                        {currentUserInfo.email}
                    </p>
                    's
                    <p>Private information</p>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div>
                        {forModification() ? (
                            <Passwd
                                id="id_private_pin_old"
                                label="old PIN code"
                                hint="input private old PIN code"
                                onMyBlur={handlePinBlur}
                            ></Passwd>
                        ) : null}
                        {resetFlagForFirstConfirm == 1 ? (
                            <div>
                                <div style={{ display: "flex" }}>
                                    <Card
                                        style={{
                                            width: "300px",
                                            marginTop: "5px",
                                            marginBottom: "5px",
                                            fontWeight: "bold",
                                            backgroundColor: "LightBlue",
                                        }}
                                    >
                                        <CardBody>
                                            <p>PIN Code:</p>
                                        </CardBody>
                                    </Card>
                                    <p
                                        style={{
                                            width: "340px",
                                            marginTop: "5px",
                                            marginBottom: "5px",
                                            marginLeft: "15px",
                                            color: "red",
                                            // backgroundColor: "#FAD7A0",
                                        }}
                                    >
                                        {pinErrorMsg}
                                    </p>
                                </div>

                                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                    <Passwd
                                        id="id_private_pin_1"
                                        label="pin code"
                                        hint="input private pin code"
                                        onMyBlur={handlePinBlur}
                                    ></Passwd>
                                    {!bigBrotherAccountCreated() ? (
                                        <Passwd
                                            id="id_private_pin_2"
                                            label="pin code"
                                            hint="input private pin code again"
                                            onMyBlur={handlePinBlur}
                                        ></Passwd>
                                    ) : null}
                                </div>
                                <Divider
                                    style={{
                                        marginTop: "10px",
                                        color: "black",
                                        height: "5px",
                                    }}
                                ></Divider>
                                <Card
                                    style={{
                                        width: "300px",
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                        backgroundColor: "LightBlue",
                                    }}
                                >
                                    <CardBody>
                                        <p>First Private Question:</p>
                                    </CardBody>
                                </Card>
                                {forModification() ? (
                                    <div style={{ marginBottom: "10px" }}>
                                        <Autocomplete
                                            label="old first question"
                                            className="max-w-2xl"
                                            selectedKey={myFirstQuestionNo}
                                            defaultSelectedKey={
                                                myFirstQuestionNo
                                            }
                                        >
                                            {questions.map((item) => (
                                                <AutocompleteItem
                                                    key={item.idx}
                                                    value={item.question}
                                                >
                                                    {item.question}
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>

                                        <Passwd
                                            id="id_private_question1_answer_old"
                                            label="old first question's answer"
                                            hint="input old first question's answer"
                                            onMyBlur={handleQuestion1AnswerBlur}
                                        ></Passwd>
                                    </div>
                                ) : null}
                                <Autocomplete
                                    label="Choose the first question"
                                    className="max-w-2xl"
                                    onSelectionChange={onSelectionChange1}
                                    selectedKey={myFirstQuestionNo}
                                    defaultSelectedKey={myFirstQuestionNo}
                                >
                                    {questions.map((item) => (
                                        <AutocompleteItem
                                            key={item.idx}
                                            value={item.question}
                                        >
                                            {item.question}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>
                                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                    <Passwd
                                        id="id_private_question1_answer_1"
                                        label="first question's answer"
                                        hint="input first question's answer"
                                        onMyBlur={handleQuestion1AnswerBlur}
                                    ></Passwd>
                                    {!bigBrotherAccountCreated() ? (
                                        <Passwd
                                            id="id_private_question1_answer_2"
                                            label="first question's answer"
                                            hint="input first question's answer again"
                                            onMyBlur={handleQuestion1AnswerBlur}
                                        ></Passwd>
                                    ) : null}
                                </div>
                                <Divider
                                    style={{
                                        marginTop: "10px",
                                        color: "black",
                                        height: "5px",
                                    }}
                                ></Divider>
                                <Card
                                    style={{
                                        width: "300px",
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                        fontWeight: "bold",
                                        backgroundColor: "LightBlue",
                                    }}
                                >
                                    <CardBody>
                                        <p>Second Private Question:</p>
                                    </CardBody>
                                </Card>
                                {forModification() ? (
                                    <div style={{ marginBottom: "10px" }}>
                                        <Autocomplete
                                            label="old second question"
                                            className="max-w-2xl"
                                            selectedKey={mySecondQuestionNo}
                                            defaultSelectedKey={
                                                mySecondQuestionNo
                                            }
                                        >
                                            {questions.map((item) => (
                                                <AutocompleteItem
                                                    key={item.idx}
                                                    value={item.question}
                                                >
                                                    {item.question}
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                        <Passwd
                                            id="id_private_question2_answer_old"
                                            label="old second question's answer"
                                            hint="input old second question's answer"
                                            onMyBlur={handleQuestion2AnswerBlur}
                                        ></Passwd>
                                    </div>
                                ) : null}
                                <Autocomplete
                                    label="Choose the second question"
                                    className="max-w-2xl"
                                    onSelectionChange={onSelectionChange2}
                                    selectedKey={mySecondQuestionNo}
                                    defaultSelectedKey={mySecondQuestionNo}
                                >
                                    {questions.map((item) => (
                                        <AutocompleteItem
                                            key={item.idx}
                                            value={item.question}
                                        >
                                            {item.question}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>
                                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                                    <Passwd
                                        id="id_private_question2_answer_1"
                                        label="second question's answer"
                                        hint="input second question's answer"
                                        onMyBlur={handleQuestion2AnswerBlur}
                                    ></Passwd>
                                    {!bigBrotherAccountCreated() ? (
                                        <Passwd
                                            id="id_private_question2_answer_2"
                                            label="second question's answer"
                                            hint="input second question's answer again"
                                            onMyBlur={handleQuestion2AnswerBlur}
                                        ></Passwd>
                                    ) : null}
                                </div>
                                <>
                                    {/*todo need show multi chain when modifying....*/}
                                    <MultiChainForModify />
                                    <SubmitMessage
                                        email={currentUserInfo.email}
                                        verifyingContract={
                                            currentUserInfo.selectedAccountAddr
                                        }
                                        chainObj={chainObj}
                                        bigBrotherAccountCreated={bigBrotherAccountCreated()}
                                        resetAfterFirstConfirmed={
                                            resetAfterFirstConfirmed
                                        }
                                        currentPriInfoRef={currentPriInfoRef}
                                        updateFillInOk={updateFillInOk}
                                        forModification={forModification()}
                                        submitOpType={submitOpType}
                                        updateSubmitOpType={updateSubmitOpType}
                                    />
                                </>
                            </div>
                        ) : (
                            <div></div>
                        )}

                        <Divider
                            style={{
                                marginTop: "10px",
                                color: "black",
                                height: "10px",
                            }}
                        ></Divider>
                    </div>
                </CardBody>
            </Card>
        </>
    );
}

function WarnMsgForNewBigBrother() {
    return (
        <div className="max-w-[800px]" style={{ marginTop: "0px" }}>
            <Card>
                <CardBody>
                    <p>
                        Warning: The server does not store your personal
                        information.
                    </p>
                    <p>
                        1. Once the personal information is forgotten, you will
                        never be able to recover your accounts and assets
                    </p>
                    <p>
                        2. Once personal information is leaked, your account or
                        assets may be stolen
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}

function WarnMsgForSender({
    forTransaction,
    currentUserInfo,
    bigBrotherAccountCreated,
}: {
    forTransaction: boolean;
    currentUserInfo: UserInfo;
    bigBrotherAccountCreated: boolean;
}) {
    const myMsg = () => {
        if (forTransaction) {
            if (
                currentUserInfo.selectedOrderNo <
                currentUserInfo.accountAddrList.length - 1
            ) {
                // account has created.
                return {
                    msg: `Sender: ${currentUserInfo.selectedAccountAddr}.`,
                    color: "success",
                };
            } else {
                if (bigBrotherAccountCreated) {
                    return {
                        // No account has been created under your email [${currentUserInfo.email}]
                        msg: `Sender: ${currentUserInfo.selectedAccountAddr}.\nThe sender is a new account, system will create it when you make your first transaction.`,
                        color: "danger",
                    };
                } else {
                    return {
                        // No account has been created under your email [${currentUserInfo.email}]
                        msg: `Sender: ${currentUserInfo.selectedAccountAddr}.\nThe sender is a new account, and it is Your first account, you need to repeat some private information and system will create it when you make your first transaction.`,
                        color: "danger",
                    };
                }
            }
        } else {
            if (bigBrotherAccountCreated) {
                return {
                    msg: `You can modify your email's private information.`,
                    color: "success",
                };
            } else {
                return {
                    msg: `You can create your first account with your email's private information.`,
                    color: "danger",
                };
            }
        }
    };

    return (
        <div className="max-w-[800px]" style={{ display: "block" }}>
            <Textarea
                isReadOnly
                type="text"
                defaultValue={myMsg().msg}
                value={myMsg().msg}
                color={myMsg().color}
                style={{ fontSize: "16px", fontWeight: "bold" }}
            />
            <Divider
                style={{
                    marginTop: "10px",
                    color: "black",
                    height: "10px",
                }}
            ></Divider>
        </div>
    );
}

function checkInfo(
    diffCheck,
    pin1,
    pin2,
    question1_answer_1,
    question1_answer_2,
    question2_answer_1,
    question2_answer_2
) {
    if (diffCheck) {
        if (pin1 != pin2) {
            alert("two pin is not equal!");
            throw new Error("two pin is not equal!");

            return;
        }
        if (question1_answer_1 != question1_answer_2) {
            alert("The two answers of the first question are different!");
            throw new Error(
                "The two answers of the first question are different!"
            );
            return;
        }
        if (question2_answer_1 != question2_answer_2) {
            alert("The two answers of the second question are different!");
            throw new Error(
                "The two answers of the second question are different!"
            );
            return;
        }
    }

    if (pin1 == "" || pin1 == undefined || pin1.length == 0) {
        alert("pin code cann't be empty!");
        throw new Error("pin code cann't be empty!");
    }
    if (!pwdRegex.test(pin1)) {
        alert("pin error!");
        throw new Error("pin error!");
    }
    if (
        question1_answer_1 == "" ||
        question1_answer_1 == undefined ||
        question1_answer_1.length == 0
    ) {
        alert("first question's answer cann't be empty!");
        throw new Error("question1_answer_1 cann't be empty!");
    }
    if (
        question2_answer_1 == "" ||
        question2_answer_1 == undefined ||
        question2_answer_1.length == 0
    ) {
        alert("second question's answer cann't be empty!");
        throw new Error("question2_answer_1 cann't be empty!");
    }
}

function SubmitMessage({
    email,
    verifyingContract,
    chainObj,
    bigBrotherAccountCreated,
    resetAfterFirstConfirmed,
    currentPriInfoRef,
    updateFillInOk,
    forModification,
    submitOpType,
    updateSubmitOpType,
}: {
    email: string;
    verifyingContract: string;
    chainObj: any;
    bigBrotherAccountCreated: boolean;
    resetAfterFirstConfirmed: any;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    updateFillInOk: any;
    forModification: boolean;
    submitOpType: string;
    updateSubmitOpType: any;
}) {
    console.log(
        "SubmitMessage....in,,,,:",
        bigBrotherAccountCreated,
        submitOpType
    );

    const { pending } = useFormStatus();
    const router = useRouter();
    let buttonType = "button";
    let buttonShowMsg = "Confirm First";
    let marginLeft = "0px";

    console.log("private info, submitMessage, submitOpType:", submitOpType);
    console.log("private info, forModification 2:", forModification);

    if (submitOpType == OP_TYPE.OP_newInfoFirstTime) {
        buttonType = "button";
        buttonShowMsg = "First Confirm";
        marginLeft = "0px";
    } else if (submitOpType == OP_TYPE.OP_newInfoSecondTime) {
        buttonType = "button";
        buttonShowMsg = "fill input again and Second Confirm";
        marginLeft = "200px";
    } else {
        buttonType = "button";
        buttonShowMsg = "PrivateInfo OK.";
        marginLeft = "400px";
    }

    const handleClick = async (event: any) => {
        if (pending) {
            event.preventDefault();
        }

        let pin1 = getInputValueById("id_private_pin_1");
        let question1_answer_1 = getInputValueById(
            "id_private_question1_answer_1"
        );
        let question2_answer_1 = getInputValueById(
            "id_private_question2_answer_1"
        );

        let pin2 = getInputValueById("id_private_pin_2");

        let question1_answer_2 = getInputValueById(
            "id_private_question1_answer_2"
        );

        let question2_answer_2 = getInputValueById(
            "id_private_question2_answer_2"
        );

        if (
            currentPriInfoRef.current.firstQuestionNo == "" ||
            currentPriInfoRef.current.secondQuestionNo == ""
        ) {
            alert("please select question!");
            return;
        }

        checkInfo(
            forModification || !bigBrotherAccountCreated,
            pin1,
            pin2,
            question1_answer_1,
            question1_answer_2,
            question2_answer_1,
            question2_answer_2
        );

        let ownerId = getOwnerIdBigBrother(email);

        let passwdAccount = getPasswdAccount(currentPriInfoRef.current);

        // // //
        if (
            submitOpType == OP_TYPE.OP_newInfoFirstTime ||
            submitOpType == OP_TYPE.OP_newInfoSecondTime
        ) {
            // keccak256(abi.encode(...));
            // generate local temporary signature
            let argumentsHash = keccak256("0x1234567890abcdef");
            console.log(
                "local temporary signature, argumentsHash:",
                argumentsHash
            );

            let chainId = chainObj.id;
            let withZeroNonce = true;
            const sign = await signAuth(
                passwdAccount,
                chainId,
                verifyingContract,
                chainObj,
                argumentsHash, // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" // argumentsHash
                withZeroNonce
            );

            if (submitOpType == OP_TYPE.OP_newInfoFirstTime) {
                setInputValueById(
                    "id_private_new_first_time_sign",
                    sign.signature
                );
            } else if (submitOpType == OP_TYPE.OP_newInfoSecondTime) {
                setInputValueById(
                    "id_private_new_second_time_sign",
                    sign.signature
                );
            }

            if (submitOpType == OP_TYPE.OP_newInfoFirstTime) {
                // alert("the first input is complete. Enter it again now...");
                resetAfterFirstConfirmed();
                updateSubmitOpType(OP_TYPE.OP_newInfoSecondTime);
            } else if (submitOpType == OP_TYPE.OP_newInfoSecondTime) {
                if (
                    getInputValueById("id_private_new_first_time_sign") !=
                    getInputValueById("id_private_new_second_time_sign")
                ) {
                    alert("The first input does not match the second input!");
                    updateSubmitOpType(OP_TYPE.OP_newInfoFirstTime);
                    resetAfterFirstConfirmed();
                    return;
                } else {
                    // alert("well done! the second input is complete. ");

                    currentPriInfoRef.current = {
                        ...currentPriInfoRef.current,
                        pin: pin1,
                    };

                    currentPriInfoRef.current.confirmedSecondary = true;
                    updateFillInOk();
                    console.log(
                        "read after hidden:",
                        getInputValueById("id_private_pin_1")
                    );
                }
            } else {
            }
        } else {
            console.log("private ok clicked.");
            currentPriInfoRef.current.confirmedSecondary = true;
            updateFillInOk();
        }
    };

    console.log("button's submit type:", buttonType);

    return (
        <div>
            <Button
                disabled={pending}
                type={buttonType}
                onPress={handleClick}
                color="primary"
                style={{
                    marginTop: "20px",
                    width: "300px",
                    marginLeft: marginLeft,
                }}
            >
                {buttonShowMsg}
            </Button>
        </div>
    );
}

function MultiChainForModify() {
    return (
        <div style={{ display: "none" }}>
            <Tooltip content="The transaction of Private Info Modification will be sent to multiple selected chains">
                <Card style={{ marginTop: "20px" }}>
                    <CardBody>
                        <p style={{ color: "grey" }}>
                            The transaction of Private Info Modification will be
                            sent to multiple selected chains
                        </p>
                    </CardBody>
                    <CardBody>
                        <div className="flex gap-4">
                            <Checkbox defaultSelected size="md">
                                MorphL2 Testnet
                            </Checkbox>
                            <Checkbox
                                defaultSelected
                                size="md"
                                style={{ marginLeft: "20px" }}
                            >
                                Local Anvil
                            </Checkbox>
                            <Checkbox
                                defaultSelected
                                size="md"
                                style={{ marginLeft: "20px" }}
                            >
                                Sepolia
                            </Checkbox>
                        </div>
                    </CardBody>
                </Card>
            </Tooltip>
        </div>
    );
}
