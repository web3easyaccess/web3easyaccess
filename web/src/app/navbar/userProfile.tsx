"use client";
import React, { MutableRefObject, useEffect } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { Input } from "@nextui-org/input";
import { User } from "@nextui-org/user";

import { Tooltip } from "@nextui-org/tooltip";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Link,
    Image,
    ListboxItem,
    Listbox,
    Snippet,
    Button,
    Spinner,
} from "@nextui-org/react";

import { saveSelectedOrderNo } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";

import {
    queryAccountList,
    queryEthBalance,
    queryW3eapBalance,
    queryfreeGasFeeAmount,
} from "../lib/chainQuery";

import {
    Menu,
    UserInfo,
    uiToString,
    ChainCode,
    formatNumber,
} from "../lib/myTypes";
import { getChainObj } from "../lib/myChain";

import {
    accountAddrCreated,
    readAccountAddr,
    readAccountList,
    readFactoryAddr,
    UpdateUserProperty,
    UserProperty,
} from "../storage/userPropertyStore";

let nativeCoinSymbol = "ETH";

export default function UserProfile({
    userProp,
    updateUserProp,
    loadUserData,
}: {
    userProp: UserProperty;
    updateUserProp: UpdateUserProperty;
    loadUserData: (myProp: UserProperty) => Promise<void>;
}) {
    console.log("userProfile, entry:", userProp);

    const [resultMsg, dispatch] = useFormState(saveSelectedOrderNo, undefined);

    const chainObj = getChainObj(userProp.selectedChainCode);
    try {
        nativeCoinSymbol = chainObj.nativeCurrency.symbol;
    } catch (e) {
        console.log("warn,nativeCoinSymbol,:", e);
        nativeCoinSymbol = "ETH";
    }

    const [ethBalance, setEthBalance] = useState("-");
    const [w3eapBalance, setW3eapBalance] = useState("-");
    const [freeGasFeeAmount, setFreeGasFeeAmount] = useState("-");

    const [ethBalanceOk, setEthBalanceOk] = useState(true);
    const [w3eapBalanceOk, setW3eapBalanceOk] = useState(true);
    const [freeGasFeeAmountOk, setFreeGasFeeAmountOk] = useState(true);

    const asyncSleep = (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const accountToOrderNoMap = useRef(new Map<string, number>());

    const lastAcctList = useRef("");

    useEffect(() => {
        const fetchAcctList = async () => {
            //   const acctData = await fetch("/api/queryAccountList", {
            //     method: "POST",
            //     body: JSON.stringify({ ownerId: ownerId }),
            //   });
            //   const acctList = await acctData.json();
            //   console.log("server api:", acctList);
            //   setAccountAddrList(acctList);

            //   console.log(
            //     "client query, queryAccountList before:",
            //     chainCode,
            //     factoryAddr,
            //     ownerId
            //   );
            console.log("fffxxx:currentUserInfo:", userProp);

            if (
                userProp.email == "" ||
                userProp.email == undefined ||
                readFactoryAddr(userProp) == "" ||
                readFactoryAddr(userProp) == undefined
            ) {
                return;
            }

            const acctList = await queryAccountList(
                userProp.selectedChainCode,
                readFactoryAddr(userProp),
                userProp.bigBrotherOwnerId
            );
            console.log(
                userProp.selectedChainCode,
                "client query, queryAccountList:",
                acctList
            );

            const myAcctList: string[] = []; // setAccountAddrList
            acctList.forEach((a) => {
                myAcctList.push(a.addr);
                accountToOrderNoMap.current.set(a.addr, a.orderNo);
            });

            let acctListJson = JSON.stringify(myAcctList);
            if (acctListJson != lastAcctList.current) {
                lastAcctList.current = acctListJson;
                updateUserProp({
                    email: userProp.email,
                    testMode: undefined,
                    selectedChainCode: undefined,
                    accountAddrList: myAcctList,
                    selectedOrderNo: undefined,
                    w3eapAddr: undefined,
                    factoryAddr: undefined,
                    bigBrotherPasswdAddr: undefined,
                });
            }
        };
        //

        // fetchAcctList();
        const acctList = readAccountList(userProp);
        console.log("navbar,acctList,by userProp.list:", acctList);
        let order = 0;
        acctList.forEach((a) => {
            accountToOrderNoMap.current.set(a, order++);
        });
    }, [userProp]);

    const refreshUserBalance = () => {
        const acctAddr = readAccountAddr(userProp);
        if (acctAddr == "") {
            return;
        }
        if (readFactoryAddr(userProp) == "") {
            return;
        }

        console.log("do something ,for currentUserInfo changed...", acctAddr);

        const fetchBalance = async () => {
            if (!ethBalanceOk) {
                return;
            }
            setEthBalanceOk(false);
            let eb = await queryEthBalance(
                userProp.selectedChainCode,
                readFactoryAddr(userProp),
                acctAddr
            );
            console.log(
                userProp.selectedChainCode,
                "client query, queryEthBalance:",
                acctAddr + ":" + eb
            );
            setEthBalance(eb == "0" ? "0.0" : eb);
            await asyncSleep(1000);
            setEthBalanceOk(true);
        };

        const fetchW3eapBalance = async () => {
            if (!w3eapBalanceOk) {
                return;
            }
            setW3eapBalanceOk(false);
            console.log(
                "fetchW3eapBalance:",
                userProp.selectedChainCode,
                "+",
                readFactoryAddr(userProp),
                "+",
                acctAddr
            );
            let wb = await queryW3eapBalance(
                userProp.selectedChainCode,
                readFactoryAddr(userProp),
                acctAddr
            );
            console.log(
                userProp.selectedChainCode,
                "client query, queryW3eapBalance:",
                acctAddr + ":" + wb
            );
            setW3eapBalance(wb == "0" ? "0.0" : wb);
            await asyncSleep(1000);
            setW3eapBalanceOk(true);
        };

        const fetchfreeGasFeeAmount = async () => {
            if (!freeGasFeeAmountOk) {
                return;
            }
            setFreeGasFeeAmountOk(false);
            let fa = await queryfreeGasFeeAmount(
                userProp.selectedChainCode,
                readFactoryAddr(userProp),
                acctAddr
            );
            console.log(
                userProp.selectedChainCode,
                "client query, freeGasFeeAmount:",
                acctAddr + ":" + fa
            );
            setFreeGasFeeAmount(fa == "0" ? "0.0" : fa);
            await asyncSleep(1000);
            setFreeGasFeeAmountOk(true);
        };

        //
        if (acctAddr != "") {
            fetchBalance();
            fetchW3eapBalance();
            if (accountAddrCreated(userProp)) {
                fetchfreeGasFeeAmount();
            } else {
                setFreeGasFeeAmountOk(false);
                // the last one, has not created!
                setFreeGasFeeAmount("0.00");

                setFreeGasFeeAmountOk(true);
            }
            document.getElementById("id_user_selectedOrderNo_btn")?.click();
        }
    };

    const [refreshFlag, setRefreshFlag] = useState(1);

    useEffect(() => {
        loadUserData(undefined); // trigger to userProp.
    }, [refreshFlag]);

    useEffect(() => {
        refreshUserBalance();
    }, [userProp]);

    const acctAddrDisplay = (fullAddr: string) => {
        if (fullAddr == undefined || fullAddr == "" || fullAddr == null) {
            console.log("fullAddr is undefined in acctAddrDisplay");
            return "";
        }
        console.log("xxxxxx123:fullAddr:", fullAddr);
        return fullAddr.substring(0, 8) + "..." + fullAddr.substring(38);
    };

    const AcctIcon = ({ addr }: { addr: string }) => {
        let color:
            | "success"
            | "primary"
            | "secondary"
            | "danger"
            | "default"
            | "warning"
            | undefined = "success";
        let bd = true;
        switch (addr.substring(addr.length - 1)) {
            case "0":
                bd = false;
            case "1":
                color = "success";
                break;
            case "2":
                bd = false;
            case "3":
                color = "primary";
                break;
            case "4":
                bd = false;
            case "5":
                color = "secondary";
                break;
            case "6":
                bd = false;
            case "7":
                color = "danger";
                break;
            case "8":
                bd = false;
            case "9":
                color = "success";
                break;
            case "a":
            case "A":
                bd = false;
            case "b":
            case "B":
                color = "primary";
                break;
            case "c":
            case "C":
                bd = false;
            case "d":
            case "D":
                color = "secondary";
                break;
            case "e":
            case "E":
                bd = false;
            case "f":
            case "F":
                color = "danger";
                break;
        }
        // "success" | "default" | "primary" | "secondary" | "warning" | "danger" | undefined
        let nameTitle = addr.substring(2, 5);
        if (userProp.selectedChainCode == ChainCode.SOLANA_TEST_CHAIN) {
            nameTitle = addr.substring(0, 3);
        }
        return (
            <Avatar
                isBordered={bd}
                name={nameTitle}
                color={color}
                style={{ fontSize: "18px" }}
            />
        );
    };

    /////////////////////////
    /////////////////////////

    function BtnselectedOrderNo() {
        // const { pending } = useFormStatus();
        // const handleClick = (event) => {
        //     if (pending) {
        //         event.preventDefault();
        //     }
        //     console.log("save selected Order....");
        // };
        // return (
        //     // <button aria-disabled={pending} type="submit" onClick={handleClick}>
        //     //   Login
        //     // </button>
        //     <Button
        //         disabled={pending}
        //         id="id_user_selectedOrderNo_btn"
        //         type="submit"
        //         onPress={handleClick}
        //         color="primary"
        //     >
        //         save OrderNo
        //     </Button>
        // );
    }
    return (
        <div style={{ display: "flex" }}>
            {/* <form action={dispatch} style={{ display: "none" }}>
                <input
                    id="id_user_selectedOrderNo"
                    style={{ display: "none" }}
                    name="selectedOrderNo"
                    defaultValue={userProp.selectedOrderNo}
                />
                <input
                    id="id_user_selectedAccountAddr"
                    style={{ display: "none" }}
                    name="selectedAccountAddr"
                    defaultValue={readAccountAddr(userProp)}
                />

                <div>{resultMsg && <p>1:{resultMsg}</p>}</div>
                <BtnselectedOrderNo />
            </form> */}

            <Card style={{ width: "450px" }}>
                <CardHeader className="flex gap-3">
                    <AcctIcon
                        addr={acctAddrDisplay(readAccountAddr(userProp))}
                    ></AcctIcon>
                    <Snippet
                        hideSymbol={true}
                        codeString={
                            userProp.selectedChainCode +
                            ": " +
                            readAccountAddr(userProp)
                        }
                        variant="bordered"
                        style={{
                            fontSize: "16px",
                            height: "40px",
                            padding: "0px",
                        }}
                    >
                        <select
                            name="accountList"
                            id="id_select_accountList"
                            value={readAccountAddr(userProp)}
                            defaultValue={"-"}
                            style={{
                                width: "185px",
                                height: "32px",
                                backgroundColor: "white",
                            }}
                            onChange={(e) => {
                                console.log(
                                    "navbar acct selected:",
                                    e.target.value,
                                    accountToOrderNoMap
                                );
                                updateUserProp({
                                    email: userProp.email,
                                    testMode: undefined,
                                    selectedChainCode: undefined,
                                    accountAddrList: undefined,
                                    selectedOrderNo:
                                        accountToOrderNoMap.current.get(
                                            e.target.value
                                        ),
                                    w3eapAddr: undefined,
                                    factoryAddr: undefined,
                                    bigBrotherPasswdAddr: undefined,
                                });
                            }}
                        >
                            {readAccountList(userProp).map(
                                (acctAddr, index) => (
                                    <option
                                        key={index}
                                        value={acctAddr}
                                        defaultValue={acctAddr}
                                        style={
                                            index ==
                                            readAccountList(userProp).length - 1
                                                ? {
                                                      color: "grey",
                                                      fontStyle: "italic",
                                                  }
                                                : {
                                                      fontWeight: "bold",
                                                      //   color: "Highlight",
                                                  }
                                        }
                                    >
                                        {acctAddrDisplay(acctAddr)}
                                    </option>
                                )
                            )}
                        </select>
                    </Snippet>

                    <div
                        className="text-md"
                        style={{
                            fontWeight: "bold",
                            fontSize: "18px",
                            color: "green",
                        }}
                    >
                        {ethBalanceOk ? (
                            <label title={ethBalance}>
                                {formatNumber(ethBalance)}
                            </label>
                        ) : (
                            <Spinner size="sm" />
                        )}{" "}
                        {nativeCoinSymbol}
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardBody>
                    <h4 className="text-middle font-semibold leading-none text-default-600">
                        {w3eapBalanceOk ? (
                            <label title={w3eapBalance}>
                                {formatNumber(w3eapBalance)}
                            </label>
                        ) : (
                            <Spinner size="sm" />
                        )}
                    </h4>
                    <Tooltip content="Balance of W3EAP which is a token about Web3EasyAccess's rewards">
                        <h5
                            className="text-small tracking-tight text-default-400"
                            style={{ marginTop: "5px" }}
                        >
                            W3EAP
                        </h5>
                    </Tooltip>
                </CardBody>
            </Card>
            <Card>
                <CardBody>
                    <h4 className="text-middle font-semibold leading-none text-default-600">
                        {freeGasFeeAmountOk ? (
                            <label title={freeGasFeeAmount}>
                                {formatNumber(freeGasFeeAmount)}
                            </label>
                        ) : (
                            <Spinner size="sm" />
                        )}
                        &nbsp;{nativeCoinSymbol}
                    </h4>
                    <Tooltip content="Free Amount of Gas Fee">
                        <h5
                            className="text-small tracking-tight text-default-400"
                            style={{ marginTop: "5px" }}
                        >
                            Free Gas Fee
                        </h5>
                    </Tooltip>
                </CardBody>
            </Card>
            <Image
                style={{
                    width: "30px",
                    height: "30px",
                    marginTop: "16px",
                    cursor: "pointer",
                }}
                onClick={() => {
                    setRefreshFlag(refreshFlag + 1);
                }}
                src="/refreshUser.png"
            />
        </div>
    );
}
