"use client";

import { createAccount, chgPrivateInfo } from "../serverside/serverActions";
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

import { queryAccount, queryQuestionIdsEnc } from "../lib/chainQuery";

import pq from "./privateinfo/passwdQuestion.json";

import Passwd from "./privateinfo/passwd2";
import {
    getOwnerIdBigBrother,
    getPasswdAccount,
    PrivateInfoType,
} from "./privateinfo/lib/keyTools";
import { signAuth } from "./privateinfo/lib/signAuthTypedData";

import popularAddr from "./privateinfo/lib/popularAddr";
import { useRef, useState, useEffect } from "react";

import { Menu, UserInfo, uiToString, Transaction } from "../lib/myTypes";
import { getChainObj } from "../lib/myChain";

const OP_TYPE = {
    OP_newInfoFirstTime: "Enter the email's new information for the first time",
    OP_newInfoSecondTime:
        "Enter the email's new information for the second time",
    OP_infoForPermit: "Enter the information for authentication(permit)",
};

export default function App({
    currentUserInfo,
    selectedAccount,
    forTransaction,
}: {
    currentUserInfo: UserInfo;
    selectedAccount: { addr: string; orderNo: number };
    forTransaction: boolean;
}) {
    const [bigBrotherAccountCreated, setBigBrotherAccountCreated] =
        useState(false);
    console.log("factoryAddr in privateinfo:", currentUserInfo.factoryAddr);

    const selectedQuestionIdsEncRef = useRef("");

    const [submitOPType, setSubmitOPType] = useState(OP_TYPE.OP_infoForPermit);

    const chainObj = getChainObj(currentUserInfo.chainCode);

    useEffect(() => {
        const fetchBigBrotherAccount = async () => {
            // suffix with 0000
            const bigBrotherOwnerId = getOwnerIdBigBrother(
                currentUserInfo.email
            );
            const acct = await queryAccount(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                `0x${bigBrotherOwnerId.substring(2)}`
            );
            console.log("bigBrother Account in privateinfoxxx:", acct);
            if (acct?.created) {
                setBigBrotherAccountCreated(true);
                setSubmitOPType(OP_TYPE.OP_infoForPermit);

                selectedQuestionIdsEncRef.current = await queryQuestionIdsEnc(
                    currentUserInfo.chainCode,
                    currentUserInfo.factoryAddr,
                    acct.accountAddr
                );
            } else {
                setBigBrotherAccountCreated(false);
                setSubmitOPType(OP_TYPE.OP_newInfoFirstTime);
            }
        };
        fetchBigBrotherAccount();
    }, [selectedAccount]);

    function warnMessage() {
        if (forTransaction) {
            if (bigBrotherAccountCreated) {
                return {
                    msg: `The current address for sending transaction is [${selectedAccount}]`,
                    color: "success",
                };
            } else {
                return {
                    // No account has been created under your email [${currentUserInfo.email}]
                    msg: `[0x...${selectedAccount.substring(
                        38
                    )}] is Your first account, you need to repeat some private information when you make your first transaction.`,
                    color: "danger",
                };
            }
        } else {
            if (bigBrotherAccountCreated) {
                return {
                    msg: `You can fill in your personal information to create an account.`,
                    color: "success",
                };
            } else {
                return {
                    msg: `[0x...${selectedAccount.substring(
                        38
                    )}] is Your first account, you need to repeat some private information when creating it.`,
                    color: "danger",
                };
            }
        }
    }

    const [resultMsg, dispatch] = useFormState(
        bigBrotherAccountCreated ? chgPrivateInfo : createAccount,
        undefined
    );

    const myDispatch = (payload: any) => {
        setTimeout(() => {
            dispatch(payload);
        }, 2000); // wait 2 seconds. avoid signAuth hasn't finished.
    };

    const [selectedKey1, setSelectedKey1] = useState("01");
    const [selectedKey2, setSelectedKey2] = useState("01");

    const selectedQuestion1Ref = useRef("01");
    const selectedQuestion2Ref = useRef("01");

    const handlePinBlur = () => {
        if (!bigBrotherAccountCreated) {
            let pin1 = getInputValueById("id_private_pin_1");
            let pin2 = getInputValueById("id_private_pin_2");
            console.log("Input lost focus,new user:", pin1, pin2);
        } else {
            let selectedQuestionIds_txt: string = "";
            if (forTransaction) {
                // just see pin1 ,forTransaction
                let pin1 = getInputValueById("id_private_pin_1");
                if (pin1?.length > 0) {
                    selectedQuestionIds_txt = aesDecrypt(
                        selectedQuestionIdsEncRef.current,
                        pin1
                    );
                }
            } else {
                let pin_old = getInputValueById("id_private_pin_old");
                // here is modify....
                if (pin_old?.length > 0) {
                    selectedQuestionIds_txt = aesDecrypt(
                        selectedQuestionIdsEncRef.current,
                        pin_old
                    );
                }
            }
            console.log("selectedQuestionIds_txt:", selectedQuestionIds_txt);
            if (selectedQuestionIds_txt != "") {
                selectedQuestion1Ref.current =
                    selectedQuestionIds_txt.substring(0, 2);
                selectedQuestion2Ref.current =
                    selectedQuestionIds_txt.substring(2, 4);
                console.log("hit select...");
                setSelectedKey1(selectedQuestion1Ref.current);
                setSelectedKey2(selectedQuestion2Ref.current);
            }
        }
        //
    };

    const onSelectionChange1 = (key) => {
        selectedQuestion1Ref.current = key;
        setSelectedKey1(key);
    };
    const onSelectionChange2 = (key) => {
        selectedQuestion2Ref.current = key;
        setSelectedKey2(key);
    };

    return (
        <Card className="max-w-[800px]" style={{ marginTop: "0px" }}>
            <CardBody>
                <div>
                    <div style={{ display: "block" }}>
                        <Textarea
                            isReadOnly
                            type="text"
                            defaultValue={warnMessage().msg}
                            value={warnMessage().msg}
                            color={warnMessage().color}
                        />
                    </div>
                    {!bigBrotherAccountCreated ? (
                        <>
                            <Card>
                                <CardHeader className="flex gap-3">
                                    <p
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: "20px",
                                        }}
                                    >
                                        {currentUserInfo.email}
                                    </p>
                                    's
                                    <p>Private information</p>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    <p>
                                        Warning: The server does not store your
                                        personal information.
                                    </p>
                                    <p>
                                        1. Once the personal information is
                                        forgotten, you will never be able to
                                        recover your accounts and assets
                                    </p>
                                    <p>
                                        2. Once personal information is leaked,
                                        your account or assets may be stolen
                                    </p>
                                </CardBody>
                            </Card>
                        </>
                    ) : null}

                    <Divider
                        style={{
                            marginTop: "10px",
                            color: "black",
                            height: "10px",
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
                            <p>PIN Code:</p>
                        </CardBody>
                    </Card>

                    {!bigBrotherAccountCreated ? null : (
                        <Passwd
                            id="id_private_pin_old"
                            label="old PIN code"
                            hint="input private old PIN code"
                            onMyBlur={handlePinBlur}
                        ></Passwd>
                    )}
                    <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                        <Passwd
                            id="id_private_pin_1"
                            label="pin code"
                            hint="input private pin code"
                        ></Passwd>
                        {!bigBrotherAccountCreated ? (
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
                    {!bigBrotherAccountCreated ? null : (
                        <div style={{ marginBottom: "10px" }}>
                            <Autocomplete
                                label="old first question"
                                className="max-w-2xl"
                            >
                                {pq.questions[1].map((item) => (
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
                            ></Passwd>
                        </div>
                    )}
                    <Autocomplete
                        label="Choose the first question"
                        className="max-w-2xl"
                        onSelectionChange={onSelectionChange1}
                        selectedKey={selectedKey1}
                    >
                        {pq.questions[1].map((item) => (
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
                        ></Passwd>
                        {!bigBrotherAccountCreated ? (
                            <Passwd
                                id="id_private_question1_answer_2"
                                label="first question's answer"
                                hint="input first question's answer again"
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
                    {!bigBrotherAccountCreated ? null : (
                        <div style={{ marginBottom: "10px" }}>
                            <Autocomplete
                                label="old second question"
                                className="max-w-2xl"
                            >
                                {pq.questions[1].map((item) => (
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
                            ></Passwd>
                        </div>
                    )}
                    <Autocomplete
                        label="Choose the second question"
                        className="max-w-2xl"
                        onSelectionChange={onSelectionChange2}
                        selectedKey={selectedKey2}
                    >
                        {pq.questions[2].map((item) => (
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
                        ></Passwd>
                        {!bigBrotherAccountCreated ? (
                            <Passwd
                                id="id_private_question2_answer_2"
                                label="second question's answer"
                                hint="input second question's answer again"
                            ></Passwd>
                        ) : null}
                    </div>

                    <Divider
                        style={{
                            marginTop: "10px",
                            color: "black",
                            height: "10px",
                        }}
                    ></Divider>

                    <form action={myDispatch}>
                        <input
                            id="id_private_ownerId"
                            style={{ display: "none" }}
                            name="owner_id"
                        />
                        <input
                            id="id_private_passwdAddr"
                            style={{ display: "none" }}
                            name="passwd_addr"
                        />
                        <input
                            id="id_private_oldPasswdAddr"
                            style={{ display: "none" }}
                            name="old_passwd_addr"
                        />
                        <input
                            id="id_private_nonce"
                            style={{ display: "none" }}
                            name="nonce"
                        />
                        <input
                            id="id_private_signature"
                            style={{ display: "none" }}
                            name="signature"
                        />

                        <input
                            id="id_private_owner_id"
                            style={{ display: "none" }}
                            name="owner_id"
                        />

                        <input
                            id="id_private_question_nos_enc"
                            style={{ display: "none" }}
                            name="question_nos_enc"
                        />

                        <div>{resultMsg && <p>{resultMsg}</p>}</div>
                        {!bigBrotherAccountCreated ? (
                            <>
                                {/*
                todo need show multi chain when modifying....
              */}
                                <MultiChainForModify />
                                <SubmitMessage
                                    email={currentUserInfo.email}
                                    verifyingContract={selectedAccount}
                                    chainObj={chainObj}
                                    bigBrotherAccountCreated={
                                        bigBrotherAccountCreated
                                    }
                                    selectedQuestion1Ref={selectedQuestion1Ref}
                                    selectedQuestion2Ref={selectedQuestion2Ref}
                                    submitOpType={submitOPType}
                                    updateSubmitOpType={(newOpType) => {
                                        setSubmitOPType(newOpType);
                                    }}
                                />
                            </>
                        ) : null}
                    </form>
                </div>
            </CardBody>
        </Card>
    );
}

function checkInfo(
    ignore_2,
    pin1,
    pin2,
    question1_answer_1,
    question1_answer_2,
    question2_answer_1,
    question2_answer_2
) {
    if (!ignore_2) {
        if (pin1 != pin2) {
            throw new Error("two pin is not equal!");
            return;
        }
        if (question1_answer_1 != question1_answer_2) {
            throw new Error(
                "The two answers of the first question are different!"
            );
            return;
        }
        if (question2_answer_1 != question2_answer_2) {
            throw new Error(
                "The two answers of the second question are different!"
            );
            return;
        }
    }
    if (pin1 == "" || pin1 == undefined || pin1.length == 0) {
        throw new Error("pin code cann't be empty!");
    }
}

function SubmitMessage({
    email,
    verifyingContract,
    chainObj,
    bigBrotherAccountCreated,
    selectedQuestion1Ref,
    selectedQuestion2Ref,
    submitOpType,
    updateSubmitOpType,
}) {
    const { pending } = useFormStatus();

    const handleClick = async (event) => {
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

        checkInfo(
            false,
            pin1,
            pin2,
            question1_answer_1,
            question1_answer_2,
            question2_answer_1,
            question2_answer_2
        );

        let ownerId = getOwnerIdBigBrother(email);

        let passwdAccount = getPasswdAccount({
            email: email,
            pin: pin1,
            question1answer: question1_answer_1,
            question2answer: question2_answer_1,
        });

        setInputValueById("id_private_ownerId", ownerId);
        setInputValueById("id_private_passwdAddr", passwdAccount.address);

        const selectedQuestionIds =
            selectedQuestion1Ref.current +
            selectedQuestion2Ref.current +
            generateRandomString();
        console.log("selectedQuestionIds:", selectedQuestionIds);
        setInputValueById(
            "id_private_question_nos_enc",
            aesEncrypt(selectedQuestionIds, pin1)
        );
        // // //
        if (submitOpType == OP_TYPE.OP_newInfoFirstTime) {
        }

        if (bigBrotherAccountCreated) {
            //   // here for modifying .
            //   let pin_old = getInputValueById("id_private_pin_old");
            //   let question1_answer_old = getInputValueById(
            //     "id_private_question1_answer_old"
            //   );
            //   let question2_answer_old = getInputValueById(
            //     "id_private_question2_answer_old"
            //   );
            //   checkInfo(
            //     true,
            //     pin_old,
            //     null,
            //     question1_answer_old,
            //     null,
            //     question2_answer_old,
            //     null
            //   );
            //   let oldPasswdAccount = getPasswdAccount({
            //     email: email,
            //     pin: pin_old,
            //     question1answer: question1_answer_old,
            //     question2answer: question2_answer_old,
            //   });
            //   oldPasswdAccount.address = getInputValueById("id_private_oldPasswdAddr");
            //   // keccak256(bytes(_newQuestionNos))
            //   const textEncoder = new TextEncoder();
            //   let argumentsHash = encodeAbiParameters(
            //     [
            //       { name: "newPasswdAddr", type: "address" },
            //       { name: "newQuestionNos", type: "bytes32" },
            //     ],
            //     [
            //       passwdAccount.address,
            //       keccak256(
            //         Uint8Array.from(
            //           textEncoder.encode(
            //             getInputValueById("id_private_question_nos_enc")
            //           )
            //         )
            //       ),
            //     ]
            //   );
            //   argumentsHash = keccak256(argumentsHash);
            //   console.log("xxxx,argumentsHash:", argumentsHash);
            //   let chainId = chainObj.id;
            //   const sign = await signAuth(
            //     oldPasswdAccount,
            //     chainId,
            //     verifyingContract,
            //     chainObj,
            //     argumentsHash
            //   );
            //   setInputValueById("id_private_nonce", sign.nonce);
            //   setInputValueById("id_private_signature", sign.signature);
            //   setInputValueById("id_private_owner_id", getOwnerIdBigBrother(email));
        }
    };

    return (
        <>
            <Button
                disabled={pending}
                type="submit"
                onPress={handleClick}
                color="primary"
                style={{ marginTop: "20px", width: "300px" }}
            >
                Save To Chain
            </Button>
        </>
    );
}

const MultiChainForModify = () => {
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
};
