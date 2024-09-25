"use client";

import LocalStore from "../storage/LocalStore";
import { UserProperty } from "../storage/LocalStore";

import Dashboard from "./dashboard";

import { getFactoryAddr } from "../serverside/blockchain/chainWriteClient";
import { getW3eapAddr } from "../serverside/blockchain/chainWrite";

import { queryAccount } from "../lib/chainQuery";
import { MutableRefObject, useEffect, useRef, useState } from "react";

import {
    Menu,
    UserInfo,
    uiToString,
    ChainCode,
    chainCodeFromString,
} from "../lib/myTypes";

export default function Page({ email }: { email: string }) {
    const prop: UserProperty = {
        bigBrotherOwnerId: "",
        email: "",
        emailDisplay: "",
        selectedOrderNo: -1,
        selectedAccountAddr: "",
        selectedChainCode: ChainCode.UNKNOW,
        testMode: false,
    }; // LocalStore.getLoginPageProperty();

    const [accountAddrList, setAccountAddrList] = useState([""]);
    const updateAccountAddrList = (acctList: string[]) => {
        setAccountAddrList(acctList);
    };

    const userPropRef: MutableRefObject<UserProperty> = useRef(prop);

    const [userPropState, setUserPropState] = useState(prop);
    const [serverSidePropState, setServerSidePropState] = useState({
        w3eapAddr: "",
        factoryAddr: "",
        bigBrotherPasswdAddr: "",
    });

    const userProp: {
        ref: MutableRefObject<UserProperty>;
        state: UserProperty;
        serverSidePropState: {
            w3eapAddr: string;
            factoryAddr: string;
            bigBrotherPasswdAddr: string;
        };
    } = {
        ref: userPropRef,
        state: userPropState,
        serverSidePropState: serverSidePropState,
    };

    useEffect(() => {
        const ppp = LocalStore.getUserProperty(email);
        console.log("dashboard page,ppp, prop:", ppp);
        userPropRef.current = ppp;
        setUserPropState(ppp);
    }, []);

    const updateUserProp = ({
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
    }) => {
        if (email == null || email == undefined || email == "") {
            alert("email can not be null!");
            // return;
        }
        let upFlag = false;
        if (
            selectedOrderNo != null &&
            selectedOrderNo != undefined &&
            selectedOrderNo >= 0 &&
            selectedAccountAddr != null &&
            selectedAccountAddr != undefined &&
            selectedAccountAddr != "" &&
            selectedAccountAddr != userPropRef.current.selectedAccountAddr
        ) {
            LocalStore.setPropSelectedOrderNo(
                email,
                selectedOrderNo,
                selectedAccountAddr
            );
            upFlag = true;
        }
        if (
            selectedChainCode != null &&
            selectedChainCode != undefined &&
            selectedChainCode != userPropRef.current.selectedChainCode
        ) {
            LocalStore.setPropChainCode(email, selectedChainCode);
            upFlag = true;
        }
        if (
            testMode != null &&
            testMode != undefined &&
            testMode != userPropRef.current.testMode
        ) {
            LocalStore.setPropTestMode(email, testMode);
            upFlag = true;
        }

        if (upFlag) {
            const ppp = LocalStore.getUserProperty(email);
            userPropRef.current = ppp;
            setUserPropState(ppp);
        }
    };

    useEffect(() => {
        const fun = async () => {
            console.log("pageClient,effect:", userPropRef.current);

            const w3eapAddr = await getW3eapAddr(
                userPropRef.current.selectedChainCode
            );
            const factoryAddr = await getFactoryAddr(
                userPropRef.current.selectedChainCode
            );
            console.log(
                "queryAccount...5,factoryAddr:",
                factoryAddr,
                ",",
                userPropRef.current.bigBrotherOwnerId
            );
            const acctData = await queryAccount(
                userPropRef.current.selectedChainCode,
                factoryAddr,
                userPropRef.current.bigBrotherOwnerId
            );

            console.log("pageClient,effect:1:acctData:", acctData);

            setServerSidePropState({
                w3eapAddr: w3eapAddr,
                factoryAddr: factoryAddr,
                bigBrotherPasswdAddr: acctData.passwdAddr,
            });
            console.log("pageClient,effect:2:", serverSidePropState);
        };
        fun();
    }, [userPropState, setUserPropState]);

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
