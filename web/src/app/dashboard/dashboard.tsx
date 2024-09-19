"use client";

import React, { MutableRefObject, useRef } from "react";
import { useState, useEffect } from "react";

import Navbar from "../navbar/navbar";

import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Divider, Card, CardHeader, CardBody } from "@nextui-org/react";

import OpMenu from "./opMenu";
import { ShowMain } from "./opMenu";

import {
    Menu,
    UserInfo,
    uiToString,
    ChainCode,
    chainCodeFromString,
} from "../lib/myTypes";
import LocalStore, { UserProperty } from "../storage/LocalStore";

// export function getSessionData(req) {
//   const encryptedSessionData = cookies().get("session")?.value;
//   return encryptedSessionData
//     ? JSON.parse(decrypt(encryptedSessionData))
//     : null;
// }

export default function Home({
    userProp,
    updateUserProp,
    accountAddrList,
    updateAccountAddrList,
}: {
    userProp: {
        ref: MutableRefObject<UserProperty>;
        state: UserProperty;
        serverSidePropState: {
            w3eapAddr: string;
            factoryAddr: string;
            bigBrotherPasswdAddr: string;
        };
    };
    updateUserProp: ({
        email,
        selectedOrderNo,
        selectedAccountAddr,
        selectedChainCode,
        testMode,
    }: {
        email: string;
        selectedOrderNo: number;
        selectedAccountAddr: string;
        selectedChainCode: ChainCode;
        testMode: boolean;
    }) => void;
    accountAddrList: string[];
    updateAccountAddrList: (acctList: string[]) => void;
}) {
    console.log("dashborad,ui:", userProp.ref.current);

    const [selectedMenu, setSelectedMenu] = useState(Menu.OOOO);
    const updateSelectedMenu = (menu: Menu) => {
        setSelectedMenu(menu);
        LocalStore.setMenu(menu);
    };

    useEffect(() => {
        const oldMenu: Menu = LocalStore.getMenu();
        setSelectedMenu(oldMenu);
    }, []);

    return (
        <>
            <Navbar
                userProp={userProp}
                updateUserProp={updateUserProp}
                accountAddrList={accountAddrList}
                updateAccountAddrList={updateAccountAddrList}
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
                    <OpMenu
                        email={userProp.ref.current.email}
                        selectedMenu={selectedMenu}
                        updateSelectedMenu={updateSelectedMenu}
                    />
                </Card>

                <Card
                    className="max-w-full w-full"
                    style={{ marginLeft: "5px" }}
                >
                    <CardBody>
                        <ShowMain
                            selectedMenu={selectedMenu}
                            userProp={userProp}
                            updateUserProp={updateUserProp}
                            accountAddrList={accountAddrList}
                        />
                    </CardBody>
                </Card>
            </div>
        </>
    );
}
