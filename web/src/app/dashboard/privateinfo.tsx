"use client";

import { createAccount, chgPrivateInfo } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";

import { getInputValueById, setInputValueById } from "../lib/elementById";
import { aesEncrypt, aesDecrypt } from "../lib/crypto.mjs";
import { generateRandomDigitInteger } from "../lib/myRandom";

import {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  parseEther,
} from "viem";

import pq from "./privateinfo/passwdQuestion.json";

import Passwd from "./privateinfo/passwd2";
import {
  getOwnerId,
  getPasswdAccount,
  PrivateInfoType,
} from "./privateinfo/lib/keyTools";
import { signAuth } from "./privateinfo/lib/signAuthTypedData";

import popularAddr from "./privateinfo/lib/popularAddr";
import { useRef, useState } from "react";
/*
contract private for exists user;
*/
// let showFlag = false;

export default function Page({
  chainId,
  verifyingContract,
  email,
  chainObj,
  forSigning,
  acctAddr,
  selectedQuestionIds,
}) {
  function isNewUser() {
    if (
      acctAddr == popularAddr.ZERO_ADDR ||
      acctAddr == popularAddr.ZERO_ADDRError ||
      acctAddr == undefined ||
      acctAddr == "" ||
      acctAddr == null
    ) {
      return true;
    } else {
      return false;
    }
  }

  function warnMessage() {
    if (forSigning) {
      return { msg: "", color: "success" };
    }

    if (isNewUser()) {
      return {
        msg: "You Don't Have Any Account! Please fill in your personal information to create an account.",
        color: "danger",
      };
    } else {
      return {
        msg: "You can fill in the new personal information for modification!",
        color: "success",
      };
    }
  }

  const [resultMsg, dispatch] = useFormState(
    isNewUser() ? createAccount : chgPrivateInfo,
    undefined
  );

  const myDispatch = (payload) => {
    setTimeout(() => {
      dispatch(payload);
    }, 2000); // wait 2 seconds. avoid signAuth hasn't finished.
  };

  const [selectedKey1, setSelectedKey1] = useState("01");
  const [selectedKey2, setSelectedKey2] = useState("01");
  const [selectedKey3, setSelectedKey3] = useState("01");

  const selectedQuestion1Ref = useRef("01");
  const selectedQuestion2Ref = useRef("01");
  const selectedQuestion3Ref = useRef("01");

  const handlePinBlur = () => {
    if (isNewUser()) {
      let pin1 = getInputValueById("id_private_pin_1");
      let pin2 = getInputValueById("id_private_pin_2");
      console.log("Input lost focus,new user:", pin1, pin2);
    } else {
      let selectedQuestionIds_txt: string = "";
      if (forSigning) {
        // just see pin1 ,forSigning
        let pin1 = getInputValueById("id_private_pin_1");
        if (pin1?.length > 0) {
          selectedQuestionIds_txt = aesDecrypt(selectedQuestionIds, pin1);
        }
      } else {
        let pin_old = getInputValueById("id_private_pin_old");
        // here is modify....
        if (pin_old?.length > 0) {
          selectedQuestionIds_txt = aesDecrypt(selectedQuestionIds, pin_old);
        }
      }
      console.log("selectedQuestionIds_txt:", selectedQuestionIds_txt);
      if (selectedQuestionIds_txt != "") {
        selectedQuestion1Ref.current = selectedQuestionIds_txt.substring(0, 2);
        selectedQuestion2Ref.current = selectedQuestionIds_txt.substring(2, 4);
        selectedQuestion3Ref.current = selectedQuestionIds_txt.substring(4, 6);
        console.log("hit select...");
        setSelectedKey1(selectedQuestion1Ref.current);
        setSelectedKey2(selectedQuestion2Ref.current);
        setSelectedKey3(selectedQuestion3Ref.current);
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
  const onSelectionChange3 = (key) => {
    selectedQuestion3Ref.current = key;
    setSelectedKey3(key);
  };

  return (
    <>
      <div style={{ marginLeft: "100px" }}>
        <Input
          isReadOnly
          type="text"
          defaultValue={warnMessage().msg}
          className="max-w-2xl"
          color={warnMessage().color}
        />
        {!forSigning ? (
          <Card>
            <CardHeader className="flex gap-3">
              <p>Personal information</p>
            </CardHeader>
            <Divider />
            <CardBody>
              <p>
                Warning: The server does not store your personal information.
              </p>
              <p>
                1. Once the personal information is forgotten, you will never be
                able to recover your accounts and assets
              </p>
              <p>
                2. Once personal information is leaked, your account or assets
                may be stolen
              </p>
            </CardBody>
          </Card>
        ) : null}
        <Divider
          style={{
            marginTop: "10px",
            marginBottom: "10px",
          }}
        ></Divider>
        {!forSigning ? (
          <Input
            isRequired
            type="email"
            label="Email"
            defaultValue={email}
            isReadOnly={true}
            className="max-w-xs"
          />
        ) : null}
        <Divider
          style={{
            marginTop: "10px",
            marginBottom: "10px",
          }}
        ></Divider>
        {isNewUser() ? null : (
          <Passwd
            id="id_private_pin_old"
            label="old pin code"
            hint="input private old pin code"
            onMyBlur={handlePinBlur}
          ></Passwd>
        )}
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <Passwd
            id="id_private_pin_1"
            label="pin code"
            hint="input private pin code"
          ></Passwd>
          {!forSigning ? (
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
            marginBottom: "10px",
          }}
        ></Divider>
        {isNewUser() ? null : (
          <Passwd
            id="id_private_question1_answer_old"
            label="first question's old answer"
            hint="input first question's old answer"
          ></Passwd>
        )}
        <Autocomplete
          label="Choose the first question"
          className="max-w-2xl"
          onSelectionChange={onSelectionChange1}
          selectedKey={selectedKey1}
        >
          {pq.questions[1].map((item) => (
            <AutocompleteItem key={item.idx} value={item.question}>
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
          {!forSigning ? (
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
            marginBottom: "10px",
          }}
        ></Divider>
        {isNewUser() ? null : (
          <Passwd
            id="id_private_question2_answer_old"
            label="second question's old answer"
            hint="input second question's old answer"
          ></Passwd>
        )}
        <Autocomplete
          label="Choose the second question"
          className="max-w-2xl"
          onSelectionChange={onSelectionChange2}
          selectedKey={selectedKey2}
        >
          {pq.questions[2].map((item) => (
            <AutocompleteItem key={item.idx} value={item.question}>
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
          {!forSigning ? (
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
            marginBottom: "10px",
          }}
        ></Divider>
        {isNewUser() ? null : (
          <Passwd
            id="id_private_question3_answer_old"
            label="third question's old answer"
            hint="input third question's old answer"
          ></Passwd>
        )}
        <Autocomplete
          label="Choose the third question"
          className="max-w-2xl"
          onSelectionChange={onSelectionChange3}
          selectedKey={selectedKey3}
        >
          {pq.questions[3].map((item) => (
            <AutocompleteItem key={item.idx} value={item.question}>
              {item.question}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <Passwd
            id="id_private_question3_answer_1"
            label="third question's answer"
            hint="input third question's answer"
          ></Passwd>
          {!forSigning ? (
            <Passwd
              id="id_private_question3_answer_2"
              label="third question's answer"
              hint="input third question's answer again"
            ></Passwd>
          ) : null}
        </div>

        <Divider
          style={{
            marginTop: "10px",
            marginBottom: "10px",
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
            id="id_private_question_nos"
            style={{ display: "none" }}
            name="question_nos"
          />

          <div>{resultMsg && <p>{resultMsg}</p>}</div>
          {!forSigning ? (
            <SubmitMessage
              email={email}
              chainId={chainId}
              verifyingContract={verifyingContract}
              chainObj={chainObj}
              isNew={isNewUser()}
              selectedQuestion1Ref={selectedQuestion1Ref}
              selectedQuestion2Ref={selectedQuestion2Ref}
              selectedQuestion3Ref={selectedQuestion3Ref}
            />
          ) : null}
        </form>
      </div>
    </>
  );
}

function checkInfo(
  ignore_2,
  pin1,
  pin2,
  question1_answer_1,
  question1_answer_2,
  question2_answer_1,
  question2_answer_2,
  question3_answer_1,
  question3_answer_2
) {
  if (!ignore_2) {
    if (pin1 != pin2) {
      throw new Error("two pin is not equal!");
      return;
    }
    if (question1_answer_1 != question1_answer_2) {
      throw new Error("The two answers of the first question are different!");
      return;
    }
    if (question2_answer_1 != question2_answer_2) {
      throw new Error("The two answers of the second question are different!");
      return;
    }
    if (question3_answer_1 != question3_answer_2) {
      throw new Error("The two answers of the second question are different!");
      return;
    }
  }
  if (pin1 == "" || pin1 == undefined || pin1.length == 0) {
    throw new Error("pin code cann't be empty!");
  }
}

function SubmitMessage({
  email,
  chainId,
  verifyingContract,
  chainObj,
  isNew,
  selectedQuestion1Ref,
  selectedQuestion2Ref,
  selectedQuestion3Ref,
}) {
  const { pending } = useFormStatus();

  const handleClick = async (event) => {
    if (pending) {
      event.preventDefault();
    }

    let pin1 = getInputValueById("id_private_pin_1");
    let question1_answer_1 = getInputValueById("id_private_question1_answer_1");
    let question2_answer_1 = getInputValueById("id_private_question2_answer_1");
    let question3_answer_1 = getInputValueById("id_private_question3_answer_1");

    let pin2 = getInputValueById("id_private_pin_2");

    let question1_answer_2 = getInputValueById("id_private_question1_answer_2");

    let question2_answer_2 = getInputValueById("id_private_question2_answer_2");

    let question3_answer_2 = getInputValueById("id_private_question3_answer_2");

    checkInfo(
      false,
      pin1,
      pin2,
      question1_answer_1,
      question1_answer_2,
      question2_answer_1,
      question2_answer_2,
      question3_answer_1,
      question3_answer_2
    );

    let ownerId = getOwnerId(email);

    let passwdAccount = getPasswdAccount({
      email: email,
      pin: pin1,
      question1answer: question1_answer_1,
      question2answer: question2_answer_1,
      question3answer: question3_answer_1,
    });

    setInputValueById("id_private_ownerId", ownerId);
    setInputValueById("id_private_passwdAddr", passwdAccount.address);

    const selectedQuestionIds =
      selectedQuestion1Ref.current +
      selectedQuestion2Ref.current +
      selectedQuestion3Ref.current +
      generateRandomDigitInteger();
    console.log("selectedQuestionIds:", selectedQuestionIds);
    setInputValueById(
      "id_private_question_nos",
      aesEncrypt(selectedQuestionIds, pin1)
    );
    // // //
    if (!isNew) {
      // here for modifying .
      let pin_old = getInputValueById("id_private_pin_old");
      let question1_answer_old = getInputValueById(
        "id_private_question1_answer_old"
      );
      let question2_answer_old = getInputValueById(
        "id_private_question2_answer_old"
      );
      let question3_answer_old = getInputValueById(
        "id_private_question3_answer_old"
      );

      checkInfo(
        true,
        pin_old,
        null,
        question1_answer_old,
        null,
        question2_answer_old,
        null,
        question3_answer_old,
        null
      );

      let oldPasswdAccount = getPasswdAccount({
        email: email,
        pin: pin_old,
        question1answer: question1_answer_old,
        question2answer: question2_answer_old,
        question3answer: question3_answer_old,
      });

      oldPasswdAccount.address = getInputValueById("id_private_oldPasswdAddr");

      // keccak256(bytes(_newQuestionNos))
      const textEncoder = new TextEncoder();
      let argumentsHash = encodeAbiParameters(
        [
          { name: "newPasswdAddr", type: "address" },
          { name: "newQuestionNos", type: "bytes32" },
        ],
        [
          passwdAccount.address,
          keccak256(
            Uint8Array.from(
              textEncoder.encode(getInputValueById("id_private_question_nos"))
            )
          ),
        ]
      );
      argumentsHash = keccak256(argumentsHash);
      console.log("xxxx,argumentsHash:", argumentsHash);
      const sign = await signAuth(
        oldPasswdAccount,
        chainId,
        verifyingContract,
        chainObj,
        argumentsHash
      );

      setInputValueById("id_private_nonce", sign.nonce);
      setInputValueById("id_private_signature", sign.signature);
      setInputValueById("id_private_owner_id", getOwnerId(email));
    }
  };

  return (
    <Button
      disabled={pending}
      type="submit"
      onPress={handleClick}
      color="primary"
    >
      OK
    </Button>
  );
}
