"use client";

import { createAccount, chgPrivateInfo } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";

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
    }, 2500); // wait 2 seconds. avoid signAuth hasn't finished.
  };

  const handlePinBlur = () => {
    if (isNewUser()) {
      // do for "pin 2"
      let pin1 = document.getElementById("id_private_pin_1").value;
      let pin2 = document.getElementById("id_private_pin_2").value;
      console.log("Input lost focus,new user:", pin1, pin2);
    } else {
      let pin_old = document.getElementById("id_private_pin_old").value;
      console.log("Input lost focus,old user:", pin_old);
      // do for "old pin"
    }
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
        <Autocomplete label="Choose the first question" className="max-w-2xl">
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
        <Autocomplete label="Choose the second question" className="max-w-2xl">
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
        <Autocomplete label="Choose the third question" className="max-w-2xl">
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
            name="ownerId"
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

          <div>{resultMsg && <p>{resultMsg}</p>}</div>
          {!forSigning ? (
            <SubmitMessage
              email={email}
              chainId={chainId}
              verifyingContract={verifyingContract}
              chainObj={chainObj}
              isNew={isNewUser()}
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

function SubmitMessage({ email, chainId, verifyingContract, chainObj, isNew }) {
  const { pending } = useFormStatus();

  const handleClick = async (event) => {
    if (pending) {
      event.preventDefault();
    }

    let pin1 = document.getElementById("id_private_pin_1").value;
    let question1_answer_1 = document.getElementById(
      "id_private_question1_answer_1"
    ).value;
    let question2_answer_1 = document.getElementById(
      "id_private_question2_answer_1"
    ).value;
    let question3_answer_1 = document.getElementById(
      "id_private_question3_answer_1"
    ).value;

    let pin2 = document.getElementById("id_private_pin_2").value;

    let question1_answer_2 = document.getElementById(
      "id_private_question1_answer_2"
    ).value;

    let question2_answer_2 = document.getElementById(
      "id_private_question2_answer_2"
    ).value;

    let question3_answer_2 = document.getElementById(
      "id_private_question3_answer_2"
    ).value;

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

    document.getElementById("id_private_ownerId").value = ownerId;
    document.getElementById("id_private_passwdAddr").value =
      passwdAccount.address;

    // // //
    if (!isNew) {
      // here for modifying .
      let pin_old = document.getElementById("id_private_pin_old").value;
      let question1_answer_old = document.getElementById(
        "id_private_question1_answer_old"
      ).value;
      let question2_answer_old = document.getElementById(
        "id_private_question2_answer_old"
      ).value;
      let question3_answer_old = document.getElementById(
        "id_private_question3_answer_old"
      ).value;

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

      document.getElementById("id_private_oldPasswdAddr").value =
        oldPasswdAccount.address;

      // chgPasswdAddr(address _newPasswdAddr,address _passwdAddr,uint256 _nonce,bytes memory _signature)
      let argumentsHash = encodeAbiParameters(
        [{ name: "newPasswdAddr", type: "address" }],
        [passwdAccount.address]
      );
      argumentsHash = keccak256(argumentsHash);

      const sign = await signAuth(
        oldPasswdAccount,
        chainId,
        verifyingContract,
        chainObj,
        argumentsHash
      );
      document.getElementById("id_private_nonce").value = sign.nonce;
      document.getElementById("id_private_signature").value = sign.signature;
      document.getElementById("id_private_owner_id").value = getOwnerId(email);
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
