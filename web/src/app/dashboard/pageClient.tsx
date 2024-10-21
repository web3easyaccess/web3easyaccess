"use client";

import * as userPropertyStore from "../storage/UserPropertyStore";
import { UserProperty } from "../storage/UserPropertyStore";

import Dashboard from "./dashboard";

import { getFactoryAddr } from "../serverside/blockchain/chainWriteClient";
import { getW3eapAddr } from "../serverside/blockchain/chainWrite";

import { queryAccount, queryAccountList } from "../lib/chainQuery";
import { MutableRefObject, useEffect, useRef, useState } from "react";

import {
    Menu,
    UserInfo,
    uiToString,
    ChainCode,
    chainCodeFromString,
} from "../lib/myTypes";

export default function PageClient({ email }: { email: string }) {
    const prop: UserProperty = userPropertyStore.getUserProperty(email);

    // const [accountAddrList, setAccountAddrList] = useState([""]);
    // const updateAccountAddrList = (acctList: string[]) => {
    //     setAccountAddrList(acctList);
    // };

    // const userPropRef: MutableRefObject<UserProperty> = useRef(prop);

    const emailRef = useRef(email);

    const [userProp, setUserProp] = useState(prop);
    const updateUserProp = ({
        email,
        testMode,
        selectedChainCode,
        accountAddrList,
        selectedOrderNo,
        w3eapAddr,
        factoryAddr,
        bigBrotherPasswdAddr,
    }: {
        email: string;
        testMode: boolean | undefined;
        selectedChainCode: ChainCode | undefined;
        accountAddrList: string[] | undefined;
        selectedOrderNo: number | undefined;
        w3eapAddr: string | undefined;
        factoryAddr: string | undefined;
        bigBrotherPasswdAddr: string | undefined;
    }) => {
        if (email == null || email == undefined || email == "") {
            email = emailRef.current;
        }
        userPropertyStore.saveUserProperty(
            email,
            testMode,
            selectedChainCode,
            accountAddrList,
            selectedOrderNo,
            w3eapAddr,
            factoryAddr,
            bigBrotherPasswdAddr
        );

        const newProp: UserProperty = userPropertyStore.getUserProperty(email);
        setUserProp(newProp);
    };

    useEffect(() => {
        const fun = async () => {
            const acctInfo = userProp.accountInfos.get(
                userProp.selectedChainCode
            ) as {
                accountAddrList: string[];
                selectedOrderNo: number;
                w3eapAddr: string;
                factoryAddr: string;
                bigBrotherPasswdAddr: string;
            };
            // //
            // //
            if (
                acctInfo.factoryAddr == undefined ||
                acctInfo.factoryAddr == ""
            ) {
                const factoryAddr = await getFactoryAddr(
                    userProp.selectedChainCode
                );
                acctInfo.factoryAddr = factoryAddr;
            }

            if (acctInfo.w3eapAddr == undefined || acctInfo.w3eapAddr == "") {
                const w3eapAddr = await getW3eapAddr(
                    userProp.selectedChainCode
                );
                acctInfo.w3eapAddr = w3eapAddr;
            }

            let bigBrotherPasswdAddr = acctInfo.bigBrotherPasswdAddr;
            if (
                bigBrotherPasswdAddr == undefined ||
                bigBrotherPasswdAddr == ""
            ) {
                const bigBrotherAcct = await queryAccount(
                    userProp.selectedChainCode,
                    acctInfo.factoryAddr,
                    userProp.bigBrotherOwnerId
                );
                bigBrotherPasswdAddr = bigBrotherAcct.passwdAddr;
            }

            const acctList = await queryAccountList(
                userProp.selectedChainCode,
                acctInfo.factoryAddr,
                userProp.bigBrotherOwnerId
            );

            console.log(
                userProp.selectedChainCode,
                "client query, queryAccountList222:",
                acctList
            );

            updateUserProp({
                email: emailRef.current,
                testMode: undefined,
                selectedChainCode: undefined,
                accountAddrList: acctList.map((a) => a.addr),
                selectedOrderNo: undefined,
                w3eapAddr: acctInfo.w3eapAddr,
                factoryAddr: acctInfo.factoryAddr,
                bigBrotherPasswdAddr: bigBrotherPasswdAddr,
            });

            console.log("updateUserProp, init ....!");
        };
        fun();
    }, []);

    // const userInfo: UserInfo = {
    //     selectedMenu: selectedMenu,
    //     chainCode: chainCodeFromString(prop.selectedChainCode),

    //     email: prop.email,
    //     emailDisplay: prop.emailDisplay,
    //     bigBrotherOwnerId: prop.bigBrotherOwnerId,
    //     bigBrotherPasswdAddr: serverSidePropState..bigBrotherPasswdAddr,
    //     selectedOwnerId: "",
    //     selectedOrderNo: prop.selectedOrderNo,
    //     selectedAccountAddr: prop.selectedAccountAddr,
    //     accountAddrList: [], // last one has not created, others has created.
    //     accountToOwnerIdMap: new Map(), // key is accountAddr, val is ownerId
    //     accountToOrderNoMap: new Map(), // key is accountAddr, val is orderNo
    // };

    // console.log("dashboard server:", uiToString(userInfo));
    return (
        <Dashboard
            userProp={userProp}
            updateUserProp={updateUserProp}
            accountAddrList={accountAddrList}
            updateAccountAddrList={updateAccountAddrList}
        ></Dashboard>
    );
}
