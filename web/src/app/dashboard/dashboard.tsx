"use client";

import React from "react";
import { useState, useEffect } from "react";

import Navbar from "../navbar/navbar";

import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";

import UserProfile from "./userProfile";
import OpMenu from "./opMenu";
import { ShowMain } from "./opMenu";

function decrypt(data: any) {
  return data;
}

// export function getSessionData(req) {
//   const encryptedSessionData = cookies().get("session")?.value;
//   return encryptedSessionData
//     ? JSON.parse(decrypt(encryptedSessionData))
//     : null;
// }

export default function Home({
  acctAddr,
  ownerAddr,
  balance,
  selectedMenu,
  txList,
  assets,
  chainId,
  verifyingContract,
  email,
  chainObj,
}) {
  // Logic to determine if a redirect is needed
  //   if (getSessionData(null)) {
  //     redirect("/login");
  //   }

  // const [selectedMenu, setSelectedMenu] = useState("assets");
  // const selectedMenuState = useState("transactions"); // transactions
  console.log("dashborad,acctAddr:", acctAddr);
  console.log("dashborad xxxx333,chainObj:", chainObj.chainCode);

  return (
    <>
      <Navbar chainCode={chainObj.chainCode}></Navbar>
      <div style={{ display: "flex" }}>
        <div style={{ width: "200px" }}>
          <UserProfile
            acctAddr={acctAddr}
            ownerAddr={ownerAddr}
            balance={balance}
          />
          <OpMenu selectedMenu={selectedMenu} />
        </div>
        <div style={{ width: "900px", marginLeft: "10px" }}>
          <ShowMain
            selectedMenu={selectedMenu}
            txList={txList}
            assets={assets}
            acctAddr={acctAddr}
            chainId={chainId}
            verifyingContract={verifyingContract}
            email={email}
            chainObj={chainObj}
          />
        </div>
      </div>
    </>
  );
}
