"use client";

import * as userPropertyStore from "../storage/userPropertyStore";
import { UpdateUserProperty, UserProperty } from "../storage/userPropertyStore";

import Dashboard from "./dashboard";

import {
    getFactoryAddr,
    queryHosts,
} from "../serverside/blockchain/chainWriteClient";
import { getW3eapAddr } from "../serverside/blockchain/chainWrite";

import {
    queryAccount,
    queryAccountList,
    queryAccountNoCache,
} from "../lib/chainQuery";
import { MutableRefObject, useEffect, useRef, useState } from "react";

import {
    Menu,
    UserInfo,
    uiToString,
    ChainCode,
    chainCodeFromString,
} from "../lib/myTypes";

export default function PageClient({ email }: { email: string }) {
    const { userProp, updateUserProp, loadUserData } = useUserProperty({
        email,
    });

    return (
        <Dashboard
            userProp={userProp}
            updateUserProp={updateUserProp}
            loadUserData={loadUserData}
        ></Dashboard>
    );
}

export function useUserProperty({ email }: { email: string }) {
    const prop: UserProperty = userPropertyStore.getUserProperty("");

    // const [accountAddrList, setAccountAddrList] = useState([""]);
    // const updateAccountAddrList = (acctList: string[]) => {
    //     setAccountAddrList(acctList);
    // };

    // const userPropRef: MutableRefObject<UserProperty> = useRef(prop);

    const emailRef = useRef(email);
    const sameLoadCnt = useRef(0);

    const [userProp, setUserProp] = useState(prop);
    const updateUserProp: UpdateUserProperty = ({
        email,
        testMode,
        selectedChainCode,
        accountAddrList,
        selectedOrderNo,
        w3eapAddr,
        factoryAddr,
        bigBrotherPasswdAddr,
        myselfHost,
        walletconnectHost,
    }: {
        email: string;
        testMode: boolean | undefined;
        selectedChainCode: ChainCode | undefined;
        accountAddrList: string[] | undefined;
        selectedOrderNo: number | undefined;
        w3eapAddr: string | undefined;
        factoryAddr: string | undefined;
        bigBrotherPasswdAddr: string | undefined;
        myselfHost: string | undefined;
        walletconnectHost: string | undefined;
    }) => {
        if (email == null || email == undefined || email == "") {
            email = emailRef.current;
        }
        console.log(`updateUserProp, selectedOrderNo=${selectedOrderNo}`);
        const oldProp: UserProperty = userPropertyStore.getUserProperty(email);

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

        if (oldProp.selectedChainCode != newProp.selectedChainCode) {
        }

        if (
            accountAddrList == undefined ||
            accountAddrList == null ||
            accountAddrList.length == 0
        ) {
            loadUserData(newProp);
        } else {
            // if accountAddrList have data, must be called by loadUserData(), can't call repeat!
        }

        newProp.myselfHost = myselfHost;
        newProp.walletconnectHost = walletconnectHost;

        console.log("newProp in update:", newProp);

        setUserProp(newProp);
    };

    const loadUserData = async (myProp: UserProperty) => {
        console.log("effect,myProp:", myProp);
        if (myProp == undefined || myProp == null) {
            myProp = userPropertyStore.getUserProperty(emailRef.current);
        }
        const acctInfo = myProp.accountInfos[myProp.selectedChainCode] as {
            accountAddrList: string[];
            selectedOrderNo: number;
            w3eapAddr: string;
            factoryAddr: string;
            bigBrotherPasswdAddr: string;
        };
        // //
        // //
        if (acctInfo.factoryAddr == undefined || acctInfo.factoryAddr == "") {
            const factoryAddr = await getFactoryAddr(myProp.selectedChainCode);
            acctInfo.factoryAddr = factoryAddr;
        }

        if (acctInfo.w3eapAddr == undefined || acctInfo.w3eapAddr == "") {
            const w3eapAddr = await getW3eapAddr(myProp.selectedChainCode);
            acctInfo.w3eapAddr = w3eapAddr;
        }

        let bigBrotherPasswdAddr = acctInfo.bigBrotherPasswdAddr;
        if (
            1 == 1 ||
            bigBrotherPasswdAddr == undefined ||
            bigBrotherPasswdAddr.length < 10
        ) {
            const bigBrotherAcct = await queryAccountNoCache(
                myProp.selectedChainCode,
                acctInfo.factoryAddr,
                myProp.bigBrotherOwnerId
            );
            bigBrotherPasswdAddr = bigBrotherAcct.passwdAddr;
        }

        const acctList = await queryAccountList(
            myProp.selectedChainCode,
            acctInfo.factoryAddr,
            myProp.bigBrotherOwnerId
        );

        console.log(
            myProp.selectedChainCode,
            "client query, queryAccountList222:",
            acctList
        );

        const { myselfHost, walletconnectHost } = await queryHosts();

        updateUserProp({
            email: emailRef.current,
            testMode: myProp.testMode,
            selectedChainCode: myProp.selectedChainCode,
            accountAddrList: acctList.map((a) => a.addr),
            selectedOrderNo: undefined,
            w3eapAddr: acctInfo.w3eapAddr,
            factoryAddr: acctInfo.factoryAddr,
            bigBrotherPasswdAddr: bigBrotherPasswdAddr,
            myselfHost: myselfHost,
            walletconnectHost: walletconnectHost,
        });
        //setUserProp({ ...userProp, myselfHost: myselfHost, walletconnectHost });
        console.log("updateUserProp, init ....!");
    };

    useEffect(() => {
        const myProp: UserProperty = userPropertyStore.getUserProperty(
            emailRef.current
        );
        loadUserData(myProp);
    }, []);

    return {
        userProp: userProp,
        updateUserProp: updateUserProp,
        loadUserData: loadUserData,
    };
    // return (
    //     <Dashboard
    //         userProp={userProp}
    //         updateUserProp={updateUserProp}
    //     ></Dashboard>
    // );
}
