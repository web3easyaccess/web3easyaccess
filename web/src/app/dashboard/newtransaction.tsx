"use client";

import {
  getPrivateKey,
  PrivateInfoType,
  getOwnerId,
} from "../blockchain/client/keyTools";
import { signAuth } from "../blockchain/client/signAuthTypedData";

import React from "react";
import { Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";

import Passwd from "../privateinfo/passwd2";

import { useFormState, useFormStatus } from "react-dom";

import { useRouter } from "next/navigation";

import { newTransaction } from "../lib/serverActions";

export default function Page({
  acctAddr,
  chainId,
  verifyingContract,
  email,
  currentNet,
}) {
  const [resultMsg, dispatch] = useFormState(newTransaction, undefined);

  return (
    <div style={{ marginLeft: "100px" }}>
      <div className="w-full flex flex-col gap-4">
        <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
          <Input
            id="id_newtrans_receiver_addr_ui"
            type="text"
            variant={"bordered"}
            label="Receiver Address"
            placeholder="Enter your Receiver Address"
          />
        </div>
        <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
          <Input
            id="id_newtrans_amount_ui"
            type="text"
            variant={"bordered"}
            label="Amount"
            placeholder="Enter your Amount"
          />
        </div>
        <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
          <Passwd
            id="id_newtrans_pin_ui"
            label="pin code"
            hint="input your pin code"
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
          id="id_newtrans_ownerId"
          style={{ display: "none" }}
          name="ownerId"
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
          id="id_newtrans_passwdAddr"
          style={{ display: "none" }}
          name="passwdAddr"
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

        <div id="id_rtn_message" style={{ display: "block" }}>
          {resultMsg && <p>{resultMsg}</p>}
        </div>

        <SendTransaction
          chainId={chainId}
          verifyingContract={verifyingContract}
          email={email}
          currentNet={currentNet}
        />
      </form>
    </div>
  );
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function SendTransaction({ chainId, verifyingContract, email, currentNet }) {
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

    let ownerId = getOwnerId(email);

    document.getElementById("id_newtrans_ownerId").value = ownerId;

    let amount = document.getElementById("id_newtrans_amount_ui").value;
    document.getElementById("id_newtrans_amount").value = amount;

    let pin1 = document.getElementById("id_newtrans_pin_ui").value;

    let privateKey = getPrivateKey({ email: email, pin: pin1 });

    const sign = await signAuth(
      ownerId,
      privateKey,
      chainId,
      verifyingContract,
      currentNet
    );
    // signature: signature, eoa: eoa, nonce: nonce.toString()
    document.getElementById("id_newtrans_signature").value = sign.signature;
    document.getElementById("id_newtrans_passwdAddr").value = sign.eoa;
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
      >
        Send Transaction
      </Button>
    </>
  );
}
