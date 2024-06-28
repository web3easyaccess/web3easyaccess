"use client";
import React from "react";
import { useRef, useState } from "react";

import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { Input } from "@nextui-org/input";
import { User } from "@nextui-org/user";

import myCookies from "../serverside/myCookies";
import { Tooltip } from "@nextui-org/tooltip";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";
import popularAddr from "./privateinfo/lib/popularAddr";

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";

export default function UserProfile({ acctAddr, ownerId, balance }) {
  if (acctAddr == undefined) {
    acctAddr = popularAddr.ZERO_ADDR;
  }
  //   acctAddr = "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6";
  if (balance == "0") {
    balance = "0.0";
  }

  const [copiedTipShow, setCopiedTipShow] = useState(false);

  const acctAddrDisplay =
    acctAddr.substring(0, 6) + "...." + acctAddr.substring(acctAddr.length - 4);
  console.log("UserProfile,acctAddr:", acctAddr);
  console.log("UserProfile,ownerId:", ownerId);

  const copyFullAddr = () => {
    // const address = document.getElementById("id_account_full_addr").value;
    var copyText = document.getElementById("id_account_full_addr");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);

    // Alert the copied text
    // alert("Copied the text: " + copyText.value);
    setCopiedTipShow(true);
    console.log("copiedTipShow-1:", copiedTipShow);
    setTimeout(() => {
      setCopiedTipShow(false);
      console.log("copiedTipShow-0:", copiedTipShow);
    }, 1000);
  };
  console.log("copiedTipShow-2:", copiedTipShow);

  const AcctIcon = ({ addr }) => {
    let color:
      | "success"
      | "primary"
      | "secondary"
      | "danger"
      | "default"
      | "warning"
      | undefined = "success";
    let bd = true;
    switch (addr.substring(addr.length - 1)) {
      case "0":
        bd = false;
      case "1":
        color = "success";
        break;
      case "2":
        bd = false;
      case "3":
        color = "primary";
        break;
      case "4":
        bd = false;
      case "5":
        color = "secondary";
        break;
      case "6":
        bd = false;
      case "7":
        color = "danger";
        break;
      case "8":
        bd = false;
      case "9":
        color = "success";
        break;
      case "a":
      case "A":
        bd = false;
      case "b":
      case "B":
        color = "primary";
        break;
      case "c":
      case "C":
        bd = false;
      case "d":
      case "D":
        color = "secondary";
        break;
      case "e":
      case "E":
        bd = false;
      case "f":
      case "F":
        color = "danger";
        break;
    }
    // "success" | "default" | "primary" | "secondary" | "warning" | "danger" | undefined
    return (
      <Avatar
        isBordered={bd}
        name={addr.substring(2)}
        color={color}
        style={{ fontSize: "18px" }}
      />
    );
  };

  return (
    <Card className="max-w-[200px]">
      <CardHeader className="flex gap-3">
        <AcctIcon addr={acctAddrDisplay}></AcctIcon>
        <div
          className="flex flex-col"
          onClick={copyFullAddr}
          style={{
            cursor: "pointer",
          }}
        >
          <p
            className="text-md"
            style={copiedTipShow ? { color: "red" } : { color: "black" }}
          >
            {acctAddrDisplay}
          </p>
          <input
            id="id_account_full_addr"
            style={{ display: "none" }}
            defaultValue={acctAddr}
          />
          <p
            className="text-md"
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              color: "green",
            }}
          >
            {balance}
          </p>
        </div>
      </CardHeader>
      {/* <Divider />
      <CardBody>
        <p>Make beautiful websites regardless of your design experience.</p>
      </CardBody>
      <Divider /> */}
      {/* <CardFooter>
        <p className="text-md">{balance}</p>
      </CardFooter> */}
    </Card>
  );
}
