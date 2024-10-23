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

import { SelectedChainIcon, ChainIcons } from "./chainIcons";
import UserProfile from "./userProfile";

import { Menu, UserInfo, uiToString, ChainCode } from "../lib/myTypes";
import { UpdateUserProperty, UserProperty } from "../storage/userPropertyStore";

export default function NavBar({
    userProp,
    updateUserProp,
    loadUserData,
}: {
    userProp: UserProperty;
    updateUserProp: UpdateUserProperty;
    loadUserData: (myProp: UserProperty) => Promise<void>;
}) {
    console.log("ui in navbar,:", userProp);

    // max-w-[30ch]
    return (
        <Navbar isBordered isBlurred={false} maxWidth="full">
            <NavbarBrand>
                <p
                    className="text-md"
                    style={{ color: "black" }}
                    title={userProp.emailDisplay}
                >
                    {userProp.emailDisplay}
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
                        loadUserData={loadUserData}
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
    updateUserProp,
}: {
    userProp: UserProperty;
    updateUserProp: UpdateUserProperty;
}) {
    console.log("navbar 4 login, userPropstate:", userProp);
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
                    updateUserProp={updateUserProp}
                />
                <NavbarItem className="hidden lg:flex"></NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
