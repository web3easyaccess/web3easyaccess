import React, { MutableRefObject } from "react";
import {
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Tooltip,
} from "@nextui-org/react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Button,
    Input,
    CardHeader,
    Card,
    CardBody,
    Divider,
} from "@nextui-org/react";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

import { ChainLogo } from "./myLogo";

import { Logout } from "./logout";

import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { SelectedChainIcon, ChainIcons } from "./chainIcons";
import UserProfile from "./userProfile";

import { Menu, UserInfo, uiToString, ChainCode } from "../lib/myTypes";
import { UserProperty } from "../storage/LocalStore";

export default function App({
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
    console.log("ui in navbar,ref:", userProp.ref.current);
    console.log("ui in navbar,state:", userProp.state);

    // max-w-[30ch]
    return (
        <Navbar isBordered isBlurred={false} maxWidth="full">
            <NavbarBrand>
                <p
                    className="text-md"
                    style={{ color: "black" }}
                    title={userProp.state.emailDisplay}
                >
                    {userProp.state.emailDisplay}
                </p>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "20px" }}
                />
                <NavbarItem>
                    <SelectedChainIcon userProp={userProp}></SelectedChainIcon>
                </NavbarItem>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "10px" }}
                />
                <NavbarItem>
                    <UserProfile
                        userProp={userProp}
                        updateUserProp={updateUserProp}
                        accountAddrList={accountAddrList}
                        updateAccountAddrList={updateAccountAddrList}
                    />
                </NavbarItem>
                {/* <NavbarItem className="hidden lg:flex">
  <Link href="/login">Swithch User</Link>
</NavbarItem> */}
                <Divider orientation="vertical" />
                <NavbarItem></NavbarItem>
            </NavbarBrand>

            <NavbarContent justify="end">
                <ChainIcons
                    userProp={userProp}
                    updateUserProp={updateUserProp}
                />
                <NavbarItem className="hidden lg:flex">
                    <Logout></Logout>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}

export function Navbar4Login({
    userProp,
    updateChainCode,
}: {
    userProp: {
        ref: MutableRefObject<UserProperty>;
        state: UserProperty;
        serverSidePropRef: MutableRefObject<{
            w3eapAddr: string;
            factoryAddr: string;
            bigBrotherPasswdAddr: string;
        }>;
    };
    updateChainCode: ({
        email,
        selectedChainCode,
    }: {
        email: string;
        selectedChainCode: ChainCode;
    }) => void;
}) {
    console.log("navbar 4 login, userPropref:", userProp.ref.current);
    console.log("navbar 4 login, userPropstate:", userProp.state);
    // max-w-[30ch]
    return (
        <Navbar isBordered isBlurred={false} maxWidth="full">
            <NavbarBrand>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "20px" }}
                />
                <NavbarItem>
                    <SelectedChainIcon userProp={userProp}></SelectedChainIcon>
                </NavbarItem>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "10px" }}
                />
                <NavbarItem></NavbarItem>
                {/* <NavbarItem className="hidden lg:flex">
    <Link href="/login">Swithch User</Link>
  </NavbarItem> */}
                <Divider orientation="vertical" />
            </NavbarBrand>

            <NavbarContent justify="end">
                <ChainIcons
                    userProp={userProp}
                    updateUserProp={updateChainCode}
                />
                <NavbarItem className="hidden lg:flex"></NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
