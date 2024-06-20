"use client";

import { createAccount } from "../lib/serverActions";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import Passwd from "./passwd2";
import {
  getOwnerAccount,
  PrivateInfoType,
} from "../blockchain/client/keyTools";
import { signAuth } from "../blockchain/client/signAuthTypedData";
import Navbar from "../navbar/navbar";

/*
contract permit for exists user;
*/

export default function Page({
  chainId,
  verifyingContract,
  email,
  currentNet,
}) {
  const [resultMsg, dispatch] = useFormState(createAccount, undefined);

  const myDispatch = (payload) => {
    setTimeout(() => {
      dispatch(payload);
    }, 2500); // wait 2 seconds. avoid signAuth hasn't finished.
  };

  return (
    <>
      <Navbar acctAddr="-"></Navbar>

      <div
        style={{
          width: "300px",
          height: "300px",
          margin: "0 auto",
          marginTop: "100px",
        }}
      >
        <Input
          isRequired
          type="email"
          label="Email"
          defaultValue={email}
          isReadOnly={true}
          className="max-w-xs"
        />
        <Passwd
          id="id_permit_pre_pin_1"
          label="private pin code"
          hint="input private pin code"
        ></Passwd>
        <Passwd
          id="id_permit_pre_pin_2"
          label="private pin code"
          hint="input private pin code again"
        ></Passwd>

        <form action={myDispatch}>
          <input
            id="id_permit_ownerAddr"
            style={{ display: "none" }}
            name="ownerAddr"
          />

          <input
            id="id_permit_signature"
            style={{ display: "none" }}
            name="signature"
          />

          <input
            id="id_permit_nonce"
            style={{ display: "none" }}
            name="nonce"
          />

          <div>{resultMsg && <p>{resultMsg}</p>}</div>
          <PermitMessage
            email={email}
            chainId={chainId}
            verifyingContract={verifyingContract}
            currentNet={currentNet}
          />
        </form>
      </div>
    </>
  );
}

function PermitMessage({ email, chainId, verifyingContract, currentNet }) {
  const { pending } = useFormStatus();

  const handleClick = async (event) => {
    if (pending) {
      event.preventDefault();
    }

    let pin1 = document.getElementById("id_permit_pre_pin_1").value;
    let pin2 = document.getElementById("id_permit_pre_pin_2").value;
    if (pin1 != pin2) {
      alert("two pin is not equal!");
      return;
    }

    let ownerAccount = getOwnerAccount({ email: email, pin: pin1 });
    const sign = await signAuth(
      ownerAccount,
      chainId,
      verifyingContract,
      currentNet
    );
    // signature: signature, eoa: eoa, nonce: nonce.toString()
    document.getElementById("id_permit_signature").value = sign.signature;
    document.getElementById("id_permit_ownerAddr").value = sign.eoa;
    document.getElementById("id_permit_nonce").value = sign.nonce;
  };

  return (
    <Button
      disabled={pending}
      type="submit"
      onPress={handleClick}
      color="primary"
    >
      Permit Private Info
    </Button>
  );
}
