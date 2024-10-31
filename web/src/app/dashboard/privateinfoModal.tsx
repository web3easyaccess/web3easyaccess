"use client";

import { Button, Input } from "@nextui-org/button";
import {
    Autocomplete,
    AutocompleteItem,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Switch,
    Textarea,
} from "@nextui-org/react";
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Checkbox,
    Tooltip,
} from "@nextui-org/react";

import { getInputValueById, setInputValueById } from "../lib/elementById";
import { aesEncrypt, aesDecrypt } from "../lib/crypto.mjs";
import {
    generateRandomDigitInteger,
    generateRandomString,
} from "../lib/myRandom";

import {
    keccak256,
    encodePacked,
    encodeAbiParameters,
    parseAbiParameters,
    parseEther,
} from "viem";
import { useRouter } from "next/navigation";
import { queryPasswdAddr, queryQuestionIdsEnc } from "../lib/chainQuery";

import pq from "./privateinfo/passwdQuestion.json";

import Passwd from "./privateinfo/passwd2";
import { getPasswdAccount, PrivateInfoType } from "../lib/client/keyTools";
import { signAuth } from "../lib/client/signAuthTypedData";

import popularAddr from "../lib/client/popularAddr";
import { useRef, useState, useEffect, MutableRefObject } from "react";

import { Menu, UserInfo, uiToString, Transaction } from "../lib/myTypes";
import { getChainObj } from "../lib/myChain";
import {
    bigBrotherAccountCreated,
    UserProperty,
} from "@/app/storage/userPropertyStore";
import {
    accountAddrCreated,
    readAccountAddr,
    readBigBrotherAcctAddr,
    readFactoryAddr,
} from "@/app/storage/userPropertyStore";
import { useFormStatus } from "react-dom";

const OP_TYPE = {
    // "Enter the email's new information for the first time",
    OP_newInfoFirstTime: "OP_newInfoFirstTime",

    // "Enter the email's new information for the second time",
    OP_newInfoSecondTime: "OP_newInfoSecondTime",

    // "Enter the information for authentication(permit)",
    OP_infoForPermit: "OP_infoForPermit",
};

const pwdRegex = new RegExp(
    "(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{11,30}"
);

let closeModal = (passwdState: "Yes" | "No" | "New" = "New") => {};

let fetchPasswdAddr: () => Promise<string>;

export function PrivateInfoModal({
    onModalClose,
    userProp,
    forTransaction,
    currentPriInfoRef,
    oldPriInfoRef,
    updateFillInOk,
    privateinfoHidden,
    updatePrivateinfoHidden,
}: {
    onModalClose: (passwdState?: "Yes" | "No" | "New") => void;
    userProp: UserProperty;
    forTransaction: boolean;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    oldPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    updateFillInOk: any;
    privateinfoHidden: boolean;
    updatePrivateinfoHidden: (hidden: boolean) => void;
}) {
    closeModal = onModalClose;

    const questions = pq.questions[1];
    console.log("PrivateInfo Modal, userProp :", userProp);
    let opTypeInit = OP_TYPE.OP_infoForPermit;

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
        currentPriInfoRef.current.email = userProp.email;
        currentPriInfoRef.current.pin = "";
        currentPriInfoRef.current.question1answer = "";
        currentPriInfoRef.current.question2answer = "";
        currentPriInfoRef.current.firstQuestionNo = "";
        currentPriInfoRef.current.secondQuestionNo = "";

        currentPriInfoRef.current.confirmedSecondary = true;
    }

    oldPriInfoRef.current.email = userProp.email;
    oldPriInfoRef.current.pin = "";
    oldPriInfoRef.current.question1answer = "";
    oldPriInfoRef.current.question2answer = "";
    oldPriInfoRef.current.firstQuestionNo = "";
    oldPriInfoRef.current.secondQuestionNo = "";

    console.log("factoryAddr in privateinfo:", readFactoryAddr(userProp));

    const selectedQuestionIdsEncRef = useRef("");

    console.log(`privateinfo..123,forTransaction=${forTransaction},`);

    const chainObj = getChainObj(userProp.selectedChainCode);

    const fetchBigBrothersQuestionNos = async (myPin: string) => {
        if (!bigBrotherAccountCreated(userProp)) {
            return;
        }
        if (myPin != "") {
            console.log(
                "fetchBigBrothersQuestionNos:",
                userProp.bigBrotherOwnerId,
                readBigBrotherAcctAddr(userProp)
            );
            const encQuestionNos = await queryQuestionIdsEnc(
                userProp.selectedChainCode,
                readFactoryAddr(userProp),
                readBigBrotherAcctAddr(userProp)
            );
            console.log("fetchBigBrothersQuestionNos, encNos:", encQuestionNos);
            const nos = aesDecrypt(encQuestionNos, myPin);
            const no1 = nos.substring(0, 2);
            const no2 = nos.substring(2, 4);

            currentPriInfoRef.current.firstQuestionNo = no1;
            currentPriInfoRef.current.secondQuestionNo = no2;
            setMyFirstQuestionNo(no1);
            setMySecondQuestionNo(no2);
        }
    };

    fetchPasswdAddr = async () => {
        if (!bigBrotherAccountCreated(userProp)) {
            return "";
        }

        const passwdAddr = await queryPasswdAddr(
            userProp.selectedChainCode,
            readFactoryAddr(userProp),
            readBigBrotherAcctAddr(userProp)
        );
        return "" + passwdAddr;
    };

    const [pinErrorMsg, setPinErrorMsg] = useState("");

    const handlePinBlur = () => {
        console.log("handlePinBlur,ac:", forTransaction);
        let pinX = getInputValueById("id_private_pin_1") as string;
        if (pinX.length == 0 || !pwdRegex.test(pinX)) {
            setPinErrorMsg(
                "PIN required: The length is greater than 10, contains special characters for upper and lower case letters"
            );
            return;
        }
        setPinErrorMsg("");

        // here, has created bigBrother.
        let myPin = "";

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

        fetchBigBrothersQuestionNos(myPin);

        // console.log("privateinfo,pinBlur:", currentPriInfoRef.current);
        //
    };

    const handleQuestion1AnswerBlur = () => {
        // here, has created bigBrother.

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

        // console.log("privateinfo,q1answer blur:", currentPriInfoRef.current);
        //
    };

    const handleQuestion2AnswerBlur = () => {
        // here, has created bigBrother.

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

        // console.log("privateinfo,q2answer blur:", currentPriInfoRef.current);
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

    const [isShowWarning, setIsShowWarning] = useState(false);
    useEffect(() => {
        setIsShowWarning(true);

        //
        setInputValueById("id_private_pin_1", currentPriInfoRef.current.pin);
        setInputValueById(
            "id_private_question1_answer_1",
            currentPriInfoRef.current.question1answer
        );
        setInputValueById(
            "id_private_question2_answer_1",
            currentPriInfoRef.current.question2answer
        );
    }, []);

    return (
        <>
            <div style={{ display: "flex" }}>
                <p
                    style={{
                        fontWeight: "bold",
                        fontSize: "20px",
                    }}
                >
                    {userProp.email}
                </p>
                <p
                    style={{
                        fontSize: "20px",
                    }}
                >
                    &nbsp; 's Private information
                </p>
                <Popover
                    isOpen={isShowWarning}
                    onOpenChange={(open) => setIsShowWarning(open)}
                    showArrow
                >
                    <PopoverTrigger>
                        <Button
                            style={{ marginLeft: "20px", marginBottom: "8px" }}
                            size="sm"
                            color="warning"
                        >
                            Warning
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="px-1 py-2">
                            <WarnMessage />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Card
                className="max-w-[800px]"
                style={
                    privateinfoHidden == false
                        ? { marginTop: "0px" }
                        : { marginTop: "0px", height: "54px" }
                }
            >
                <CardBody>
                    <div>
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
                            </div>
                            <>
                                {/*todo need show multi chain when modifying....*/}
                                <MultiChainForModify />
                                <SubmitMessage
                                    email={userProp.email}
                                    verifyingContract={readAccountAddr(
                                        userProp
                                    )}
                                    chainObj={chainObj}
                                    currentPriInfoRef={currentPriInfoRef}
                                    updateFillInOk={updateFillInOk}
                                    submitOpType={submitOpType}
                                    updateSubmitOpType={updateSubmitOpType}
                                />
                            </>
                        </div>

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

function WarnMessage() {
    return (
        <div className="max-w-[800px]" style={{ marginTop: "0px" }}>
            <p>Warning: The server does not store your personal information.</p>
            <p>
                1. Once the personal information is forgotten, you will never be
                able to recover your accounts and assets
            </p>
            <p>
                2. Once personal information is leaked, your account or assets
                may be stolen
            </p>
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
    currentPriInfoRef,
    updateFillInOk,
    submitOpType,
    updateSubmitOpType,
}: {
    email: string;
    verifyingContract: string;
    chainObj: any;
    currentPriInfoRef: React.MutableRefObject<PrivateInfoType>;
    updateFillInOk: any;
    submitOpType: string;
    updateSubmitOpType: any;
}) {
    console.log("SubmitMessage....in,,,,:", submitOpType);

    const { pending } = useFormStatus();
    const router = useRouter();
    let buttonType = "button";
    let buttonShowMsg = "Confirm First";
    let marginLeft = "0px";

    console.log("private info, submitMessage, submitOpType:", submitOpType);

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
            false,
            pin1,
            pin2,
            question1_answer_1,
            question1_answer_2,
            question2_answer_1,
            question2_answer_2
        );

        let passwdAccount = getPasswdAccount(
            currentPriInfoRef.current,
            chainObj.chainCode
        );

        let passwdState: "Yes" | "No" | "New" = "New";
        let chainPasswdAddr = await fetchPasswdAddr();
        if (chainPasswdAddr == "" || chainPasswdAddr == undefined) {
            passwdState = "New";
        } else if (chainPasswdAddr == passwdAccount.address) {
            passwdState = "Yes";
        } else {
            passwdState = "No";
        }

        // // //
        if (
            submitOpType == OP_TYPE.OP_newInfoFirstTime ||
            submitOpType == OP_TYPE.OP_newInfoSecondTime
        ) {
            // // keccak256(abi.encode(...));
            // // generate local temporary signature
            // let argumentsHash = keccak256("0x1234567890abcdef");
            // console.log(
            //     "local temporary signature, argumentsHash:",
            //     argumentsHash
            // );
            // let chainId = chainObj.id;
            // let withZeroNonce = true;
            // const sign = await signAuth(
            //     passwdAccount,
            //     chainId,
            //     verifyingContract,
            //     chainObj,
            //     argumentsHash, // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" // argumentsHash
            //     withZeroNonce
            // );
            // if (submitOpType == OP_TYPE.OP_newInfoFirstTime) {
            //     setInputValueById(
            //         "id_private_new_first_time_sign",
            //         sign.signature
            //     );
            // } else if (submitOpType == OP_TYPE.OP_newInfoSecondTime) {
            //     setInputValueById(
            //         "id_private_new_second_time_sign",
            //         sign.signature
            //     );
            // }
        } else {
            console.log("private ok clicked.");
            currentPriInfoRef.current.confirmedSecondary = true;
            updateFillInOk();
        }

        closeModal(passwdState);
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
                            <Checkbox
                                defaultSelected
                                size="md"
                                style={{ marginLeft: "20px" }}
                            >
                                Solana testnet
                            </Checkbox>
                        </div>
                    </CardBody>
                </Card>
            </Tooltip>
        </div>
    );
}
