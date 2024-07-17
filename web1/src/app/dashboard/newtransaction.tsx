"use client";

import { getPasswdAccount, getOwnerId } from "./privateinfo/lib/keyTools";

import { signAuth } from "./privateinfo/lib/signAuthTypedData";

import {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  parseEther,
} from "viem";

import React, { useState } from "react";

import { Button } from "@nextui-org/button";
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
} from "@nextui-org/react";

import Passwd from "./privateinfo/passwd2";

import { useFormState, useFormStatus } from "react-dom";

import { useRouter } from "next/navigation";

import { newTransaction } from "../serverside/serverActions";

import PrivateInfo from "./privateinfo";

export default function Page({
  acctAddr,
  chainId,
  verifyingContract,
  email,
  chainObj,
}) {
  const [buttonText, setButtonText] = useState("Send ETH");
  const [resultMsg, dispatch] = useFormState(newTransaction, undefined);
  console.log("email in newtransaction:", email);

  const handleSelectionChage = (e) => {
    console.log("handleSelectionChage, xxx:", e);
    setButtonText(e.toString());
  };

  // className="max-w-[400px]"
  return (
    <>
      <Tabs aria-label="Options" onSelectionChange={handleSelectionChage}>
        <Tab key="sendETH" title="Send ETH">
          <div>
            <div className="w-x-full flex flex-col gap-4">
              <div
                className="flex w-x-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                style={{ width: "400px" }}
              >
                <Input
                  id="id_newtrans_receiver_addr_ui"
                  type="text"
                  variant={"bordered"}
                  label="Receiver Address"
                  placeholder="Enter your Receiver Address"
                />
              </div>
              <div
                className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4"
                style={{ width: "400px" }}
              >
                <Input
                  id="id_newtrans_amount_ui"
                  type="text"
                  variant={"bordered"}
                  label="Amount"
                  placeholder="Enter your Amount"
                />
              </div>
            </div>

            <form action={dispatch}>
              <input
                id="id_newtrans_receiver_addr"
                style={{ display: "none" }}
                name="receiver_addr"
                placeholder=""
                required
              />
              <input
                id="id_newtrans_amount"
                style={{ display: "none" }}
                name="amount"
                placeholder=""
                required
              />
              <input
                id="id_newtrans_owner_id"
                style={{ display: "none" }}
                name="owner_id"
                placeholder=""
                required
              />
              <input
                id="id_newtrans_passwd_addr"
                style={{ display: "none" }}
                name="passwd_addr"
                placeholder=""
                required
              />

              <input
                id="id_newtrans_signature"
                style={{ display: "none" }}
                name="signature"
                placeholder=""
                required
              />

              <input
                id="id_newtrans_nonce"
                style={{ display: "none" }}
                name="nonce"
                placeholder=""
                required
              />

              <div id="id_rtn_message" style={{ display: "none" }}>
                {resultMsg && <p>{resultMsg}</p>}
              </div>
            </form>
          </div>
        </Tab>
        <Tab key="sendToken" title="Send Token">
          <p>Not Yet</p>
        </Tab>
        <Tab key="sendNFT" title="Send NFT">
          <p>Not Yet</p>
        </Tab>
        <Tab key="swap" title="Swap Token">
          <p>Not Yet</p>
        </Tab>
        <Tab key="createTransaction" title="Create Transaction">
          <p>Not Yet</p>
        </Tab>
      </Tabs>

      <PrivateInfo forSigning={true}></PrivateInfo>

      <SendTransaction
        chainId={chainId}
        verifyingContract={verifyingContract}
        email={email}
        chainObj={chainObj}
        buttonText={buttonText}
      />
    </>
  );
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function SendTransaction({
  chainId,
  verifyingContract,
  email,
  chainObj,
  buttonText,
}) {
  const router = useRouter();
  const { pending } = useFormStatus();

  const handleClick = async (event) => {
    if (pending) {
      event.preventDefault();
      return;
    }

    let receiver_addr = document.getElementById(
      "id_newtrans_receiver_addr_ui"
    ).value;
    document.getElementById("id_newtrans_receiver_addr").value = receiver_addr;

    let amount = document.getElementById("id_newtrans_amount_ui").value;
    document.getElementById("id_newtrans_amount").value = amount;

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

    let passwdAccount = getPasswdAccount({
      email: email,
      pin: pin1,
      question1answer: question1_answer_1,
      question2answer: question2_answer_1,
      question3answer: question3_answer_1,
    });
    let ownerId = getOwnerId(email);

    // keccak256(abi.encode(...));
    console.log("encodeAbiParameters1111:", receiver_addr, amount);
    let argumentsHash = encodeAbiParameters(
      [
        { name: "to", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      [receiver_addr, parseEther(amount)]
    );
    console.log("encodeAbiParameters2222:", argumentsHash);
    argumentsHash = keccak256(argumentsHash);
    console.log("encodeAbiParameters3333:", argumentsHash);

    const sign = await signAuth(
      passwdAccount,
      chainId,
      verifyingContract,
      chainObj,
      argumentsHash // "0xE249dfD432B37872C40c0511cC5A3aE13906F77A0511cC5A3aE13906F77AAA11" // argumentsHash
    );
    // signature: signature, eoa: eoa, nonce: nonce.toString()
    document.getElementById("id_newtrans_owner_id").value = ownerId;
    document.getElementById("id_newtrans_signature").value = sign.signature;
    document.getElementById("id_newtrans_passwd_addr").value = sign.eoa;
    document.getElementById("id_newtrans_nonce").value = sign.nonce;
  };

  return (
    // <button aria-disabled={pending} type="submit" onClick={handleClick}>
    //   Login
    // </button>
    <>
      <Button
        disabled={pending}
        type="submit"
        onPress={handleClick}
        color="primary"
        style={{ marginTop: "20px", width: "300px" }}
      >
        {buttonText}
      </Button>
    </>
  );
}
