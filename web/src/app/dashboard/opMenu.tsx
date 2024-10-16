"use client";
import React, { MutableRefObject } from "react";

import { Key } from "react";

import {
    Accordion,
    AccordionItem,
    Avatar,
    Link,
    CardHeader,
    Card,
    CardBody,
    CardFooter,
    Image,
    Divider,
} from "@nextui-org/react";

import Assets from "./assets";
import Transactions from "./transactions";
import SendTransaction from "./newtransaction/sendtransaction";
import SendChgPrivateInfo from "./newtransaction/sendchgprivateinfo";
import ExploreDapps from "./exploredapps";
import UpgradeImpl from "./upgradeimpl";

import { useRouter } from "next/navigation";

import { ChainCode, Menu, UserInfo, uiToString } from "../lib/myTypes";
import { UserProperty } from "../storage/LocalStore";
import PageClient from "./pageClient";

// const SendChgPrivateInfo = () => {
//     return <div></div>;
// };

export default function OpMenu({
    email,
    selectedMenu,
    updateSelectedMenu,
}: {
    email: string;
    selectedMenu: Menu;
    updateSelectedMenu: (menu: Menu) => void;
}) {
    console.log("selectedMenu ::::", selectedMenu);
    const route = useRouter();
    const defaultContent = "";

    const handlePress = (e: any) => {
        const clickedElement = e.target; // Access the clicked element
        const elementId = clickedElement.id; // Get the element's ID
        const elementClass = clickedElement.className; // Get the element's class
        const elementTextContent = clickedElement.textContent; // Get the element's text content
        // console.log(`Clicked element ID: ${elementId}`);
        // console.log(`Clicked element class: ${elementClass}`);
        console.log(`Clicked element text content: ${elementTextContent}`);
        if (elementTextContent.indexOf("Assets") >= 0) {
            console.log("assets...");
            updateSelectedMenu(Menu.Asset);
            // // route.push("/dashboard/assets");
            // return (
            //     <PageClient
            //         email={email}
            //         selectedMenu={selectedMenu}
            //     ></PageClient>
            // );
        } else if (elementTextContent.indexOf("Transactions") >= 0) {
            updateSelectedMenu(Menu.Transactions);
            // route.push("/dashboard/transactions");
        } else if (elementTextContent.indexOf("Send Transaction") >= 0) {
            updateSelectedMenu(Menu.SendTransaction);
            // route.push("/dashboard/newtransaction");
        } else if (elementTextContent.indexOf("PrivateInfo") >= 0) {
            updateSelectedMenu(Menu.PrivateSetting);
            // route.push("/dashboard/privateinfo");
        } else if (elementTextContent.indexOf("Dapps") >= 0) {
            updateSelectedMenu(Menu.ExploreDapps);
            // route.push("/dashboard/exploredapps");
        } else if (elementTextContent.indexOf("Upgrade") >= 0) {
            updateSelectedMenu(Menu.UpgradeImpl);
            // route.push("/dashboard/privateinfo");
        }
    };

    const myColor = (menu: Menu) => {
        if (selectedMenu == menu) {
            return "warning"; // '"default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined'
        } else {
            return undefined;
        }
    };
    const myMenuText = (menu: Menu) => {
        let menuText = "QQQ";
        if (menu == Menu.Asset) {
            menuText = "Assets";
        } else if (menu == Menu.Transactions) {
            menuText = "Transactions";
        } else if (menu == Menu.SendTransaction) {
            menuText = "Send Transaction";
        } else if (menu == Menu.PrivateSetting) {
            menuText = "Change PrivateInfo";
        } else if (menu == Menu.Guardian) {
            menuText = "Guardian(Not Yet)";
        } else if (menu == Menu.ExploreDapps) {
            menuText = "Explore Dapps";
        } else if (menu == Menu.UpgradeImpl) {
            menuText = "Upgrade Impl";
        }
        return menuText;
    };

    const MenuItem = ({ menu }: { menu: Menu }) => {
        return (
            <div className="flex ">
                <Avatar
                    radius="sm"
                    name={myMenuText(menu).substring(0, 1)}
                    style={{ fontSize: "22px" }}
                    size="sm"
                    color={myColor(menu)}
                />
                <p
                    style={{
                        marginLeft: "10px",
                        fontSize: "16px",
                        cursor: "pointer",
                    }}
                    onClick={(event) => handlePress(event)}
                >
                    {myMenuText(menu)}
                </p>
            </div>
        );
    };

    return (
        <div style={{ width: "240px" }}>
            <Card>
                <CardBody>
                    <MenuItem menu={Menu.Asset}></MenuItem>
                </CardBody>
                <Divider />
                <CardBody>
                    <MenuItem menu={Menu.Transactions}></MenuItem>
                </CardBody>
                <Divider />
                <CardBody>
                    <MenuItem menu={Menu.SendTransaction}></MenuItem>
                </CardBody>
                <Divider />
                <CardBody>
                    <MenuItem menu={Menu.ExploreDapps}></MenuItem>
                </CardBody>
                <Divider />
                <CardBody>
                    <MenuItem menu={Menu.PrivateSetting}></MenuItem>
                </CardBody>
                <CardBody style={{ display: "none" }}>
                    <MenuItem menu={Menu.Guardian}></MenuItem>
                </CardBody>
                <Divider />
                <CardBody>
                    <MenuItem menu={Menu.UpgradeImpl}></MenuItem>
                </CardBody>
            </Card>
        </div>
    );
}

export function ShowMain({
    selectedMenu,
    userProp,
    updateUserProp,
    accountAddrList,
}: {
    selectedMenu: Menu;
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
}) {
    // const chainObj = getChainObj(currentUserInfo.chainCode);

    if (selectedMenu == Menu.Asset) {
        console.log("selectedMenu11111111111:", selectedMenu);
        return <Assets userProp={userProp} />;
    } else if (selectedMenu == Menu.Transactions) {
        console.log("selectedMenu11111111122:", selectedMenu);
        return <Transactions userProp={userProp} />;
    } else if (selectedMenu == Menu.SendTransaction) {
        console.log("selectedMenu11111111133:", selectedMenu);
        return (
            <SendTransaction
                userProp={userProp}
                accountAddrList={accountAddrList}
            />
        );
        // } else if (selectedMenu == Menu.ExploreDapps) {
        //     return <ExploreDapps userProp={userProp} />;
    } else if (selectedMenu == Menu.PrivateSetting) {
        console.log("selectedMenu11111111144:", selectedMenu);
        // alert("coming soon!");
        // return (
        //     <div>
        //         <h3 style={{ fontSize: "40px" }}>coming soon ... </h3>
        //     </div>
        // );
        return (
            <SendChgPrivateInfo
                userProp={userProp}
                accountAddrList={accountAddrList}
                forTransaction={false}
            />
        );
    } else if (selectedMenu == Menu.ExploreDapps) {
        console.log("selectedMenu1111111xxxx:", selectedMenu);
        return <ExploreDapps userProp={userProp} />;
    } else if (selectedMenu == Menu.UpgradeImpl) {
        console.log("selectedMenu11111111166:", selectedMenu);
        return (
            <UpgradeImpl
                userProp={userProp}
                accountAddrList={accountAddrList}
                forTransaction={false}
            />
        );
    } else {
        return (
            <div>
                <p>Coming soon!!!</p>
            </div>
        );
    }
    console.log("selectedMenu11111111133000:", selectedMenu);
}
