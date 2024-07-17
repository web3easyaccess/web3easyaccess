"use server";

import myCookies from "../serverside/myCookies";
import {
    queryAssets,
    queryQuestionIds,
} from "../serverside/blockchain/queryAccountInfo";
import Dashboard from "./dashboard";

import { getFactoryAddr } from "../serverside/blockchain/chainWriteClient";
import { getW3eapAddr } from "../serverside/blockchain/chainWrite";
import { queryTransactions } from "../serverside/blockchain/queryAccountInfo";
import redirectTo from "../serverside/redirectTo";

import { useState } from "react";

import { getOwnerIdBigBrother } from "./privateinfo/lib/keyTools";

import { Menu, UserInfo, uiToString } from "../lib/myTypes";

export default async function Page({ selectedMenu }: { selectedMenu: Menu }) {
    redirectTo.urlLoggedInCheck();

    selectedMenu = selectedMenu ? selectedMenu : Menu.Asset;

    const myData = myCookies.loadData();
    const emailDisplay = myData.emailDisplay;
    const email = myData.email;
    const selectedOrderNo = myData.selectedOrderNo;

    const w3eapAddr = await getW3eapAddr();

    const userInfo: UserInfo = {
        selectedMenu: selectedMenu,
        chainCode: myCookies.getChainCode(),
        factoryAddr: getFactoryAddr(myCookies.getChainCode()) as string,
        w3eapAddr: w3eapAddr as string,
        email: email,
        emailDisplay: emailDisplay,
        bigBrotherOwnerId: getOwnerIdBigBrother(email),
        selectedOwnerId: "",
        selectedOrderNo: selectedOrderNo,
        selectedAccountAddr: "",
        accountAddrList: [], // last one has not created, others has created.
        accountToOwnerIdMap: new Map(), // key is accountAddr, val is ownerId
        accountToOrderNoMap: new Map(), // key is accountAddr, val is orderNo
    };

    console.log("dashboard server:", uiToString(userInfo));
    return <Dashboard userInfo={userInfo}></Dashboard>;
}
