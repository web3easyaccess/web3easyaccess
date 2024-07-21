import React from "react";
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

import { chains } from "./chains";

import { SelectedChainIcon, ChainIcons } from "./chainIcons";
import UserProfile from "./userProfile";

import { Menu, UserInfo, uiToString, ChainCode } from "../lib/myTypes";

export default function App({
    currentUserInfo,
    updateCurrentUserInfo,
}: {
    currentUserInfo: UserInfo;
    updateCurrentUserInfo: any;
}) {
    console.log("ui in navbar:", uiToString(currentUserInfo));

    const [selectedChainCode, setSelectedChainCode] = useState(
        currentUserInfo.chainCode
    );

    const handleNewChainCodeState = (newChainCode: ChainCode) => {
        const oldChainCode = selectedChainCode;
        console.log("chainCode now set to be0,old:" + oldChainCode);
        if (oldChainCode != newChainCode) {
            console.log("chainCode now set to be1:" + newChainCode);
            setSelectedChainCode(newChainCode);
            const iii = setTimeout(() => {
                console.log(
                    "page reload...00..",
                    selectedChainCode,
                    newChainCode
                );
                location.reload();
            }, 1000);
        }
    };
    // max-w-[30ch]
    return (
        <Navbar isBordered isBlurred={false} maxWidth="full">
            <NavbarBrand>
                <p
                    className="text-md"
                    style={{ color: "black" }}
                    title={currentUserInfo.email}
                >
                    {currentUserInfo.emailDisplay}
                </p>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "20px" }}
                />
                <NavbarItem>
                    <SelectedChainIcon
                        chainCodeState={currentUserInfo.chainCode}
                    ></SelectedChainIcon>
                </NavbarItem>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "10px" }}
                />
                <NavbarItem>
                    <UserProfile
                        currentChainCode={selectedChainCode}
                        currentUserInfo={currentUserInfo}
                        updateCurrentUserInfo={updateCurrentUserInfo}
                    />
                </NavbarItem>
                {/* <NavbarItem className="hidden lg:flex">
  <Link href="/login">Swithch User</Link>
</NavbarItem> */}
                <Divider orientation="vertical" />
                <NavbarItem></NavbarItem>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                <NavbarItem isActive></NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="#"></Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <ChainIcons
                    chainCodeState={currentUserInfo.chainCode}
                    handleNewChainCodeState={handleNewChainCodeState}
                />
                <NavbarItem className="hidden lg:flex">
                    <Logout></Logout>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}

export function Navbar4Login({ chainCode }: { chainCode: string }) {
    const [chainCodeState, setCurrentChainCode] = useState(chainCode);
    const handleNewChainCodeState = (newChainCode: string) => {
        // console.log("chainCode now set to be1:" + newChainCode);
        // setCurrentChainCode(newChainCode);

        const oldChainCode = chainCodeState;
        console.log("chainCode now set to be0,old login:" + oldChainCode);
        if (oldChainCode != newChainCode) {
            console.log("chainCode now set to be1 login:" + newChainCode);
            setCurrentChainCode(newChainCode);
            const iii = setTimeout(() => {
                console.log(
                    "page reload...00.111.",
                    chainCodeState,
                    newChainCode
                );
                location.reload();
            }, 1000);
        }
    };
    // max-w-[30ch]
    return (
        <Navbar isBordered isBlurred={false} maxWidth="full">
            <NavbarBrand>
                <Divider
                    orientation="vertical"
                    style={{ marginLeft: "20px" }}
                />
                <NavbarItem>
                    <SelectedChainIcon
                        chainCodeState={chainCodeState}
                    ></SelectedChainIcon>
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
                    chainCodeState={chainCodeState}
                    handleNewChainCodeState={handleNewChainCodeState}
                />
                <NavbarItem className="hidden lg:flex"></NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
