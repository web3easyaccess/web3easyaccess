"use client";

import React, { useRef } from "react";
import { useState, useEffect } from "react";

import Navbar from "../navbar/navbar";

import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Divider, Card, CardHeader, CardBody } from "@nextui-org/react";

import OpMenu from "./opMenu";
import { ShowMain } from "./opMenu";
import { Menu, UserInfo, uiToString } from "../lib/myTypes";

// export function getSessionData(req) {
//   const encryptedSessionData = cookies().get("session")?.value;
//   return encryptedSessionData
//     ? JSON.parse(decrypt(encryptedSessionData))
//     : null;
// }

export default function Home({ userInfo }: { userInfo: UserInfo }) {
    //   const [currentChainCode, setCurrentChainCode] = useState(chainObj.chainCode);
    //   const setMyCurrentChainCode = (cc: string) => {
    //     setCurrentChainCode(cc);
    //   };

    const [currentUserInfo, setCurrentUserInfo] = useState(userInfo);

    const updateCurrentUserInfo = (cu: UserInfo) => {
        setCurrentUserInfo(cu);
    };

    console.log("dashborad,ui:", uiToString(userInfo));

    return (
        <>
            <Navbar
                currentUserInfo={currentUserInfo}
                updateCurrentUserInfo={updateCurrentUserInfo}
            ></Navbar>
            <Divider
                orientation="horizontal"
                style={{ backgroundColor: "grey", height: "5px" }}
            ></Divider>
            <div
                style={{
                    display: "flex",
                    marginLeft: "10px",
                    marginRight: "10px",
                }}
            >
                <Card className="max-w-full">
                    <OpMenu selectedMenu={currentUserInfo.selectedMenu} />
                </Card>

                <Card
                    className="max-w-full w-full"
                    style={{ marginLeft: "5px" }}
                >
                    <CardBody>
                        <ShowMain currentUserInfo={currentUserInfo} />
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
