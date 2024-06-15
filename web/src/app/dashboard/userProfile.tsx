"use client";
import React from "react";

import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { Input } from "@nextui-org/input";
import { User } from "@nextui-org/user";

import myCookies from "../lib/myCookies";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/router";

export default function UserProfile({ acctAddr, ownerId, balance }) {
  //   const { data: session } = useSession();
  //   const router = useRouter();

  //   const handleProfileClick = () => {
  //     router.push("/profile");
  //   };

  //   if (!session) {
  //     return null;
  //   }l

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
    copyText.style.display = "block";
    setTimeout(() => {
      copyText.style.display = "none";
    }, 2000);
  };

  return (
    <Card className="max-w-[200px]">
      <CardHeader className="flex gap-3">
        <Image
          alt="nextui logo"
          height={25}
          radius="sm"
          src="/headshot/1.png"
          width={25}
        />
        <Image
          alt="nextui logo"
          height={40}
          radius="sm"
          src="/headshot/2.png"
          width={40}
        />
        <div className="flex flex-col" onClick={copyFullAddr}>
          <a className="text-md" href="">
            {acctAddrDisplay}
          </a>
          <input
            id="id_account_full_addr"
            style={{ display: "none" }}
            defaultValue={acctAddr}
          />
        </div>
      </CardHeader>
      {/* <Divider />
      <CardBody>
        <p>Make beautiful websites regardless of your design experience.</p>
      </CardBody>
      <Divider /> */}
      <CardFooter>
        <p className="text-md">{balance}</p>
      </CardFooter>
    </Card>
  );
}
