"use client";
import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { Input } from "@nextui-org/input";
import { User } from "@nextui-org/user";

import myCookies from "../serverside/myCookies";
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
} from "@nextui-org/react";
import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { saveSelectedOrderNo } from "../serverside/serverActions";
import { useFormState, useFormStatus } from "react-dom";

import { getOwnerIdSelfByBigBrother } from "../dashboard/privateinfo/lib/keyTools";

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

export default function App({
    currentChainCode,
    currentUserInfo,
    updateCurrentUserInfo,
}: {
    currentChainCode: ChainCode;
    currentUserInfo: UserInfo;
    updateCurrentUserInfo: any;
}) {
    const router = useRouter();

    const [resultMsg, dispatch] = useFormState(saveSelectedOrderNo, undefined);

    const [ethBalance, setEthBalance] = useState("-");
    const [w3eapBalance, setW3eapBalance] = useState("-");
    const [freeGasFeeAmount, setFreeGasFeeAmount] = useState("-");

    useEffect(() => {
        const fetchAcctList = async () => {
            //   const acctData = await fetch("/api/queryAccountList", {
            //     method: "POST",
            //     body: JSON.stringify({ ownerId: ownerId }),
            //   });
            //   const acctList = await acctData.json();
            //   console.log("server api:", acctList);
            //   setAccountList(acctList);

            //   console.log(
            //     "client query, queryAccountList before:",
            //     chainCode,
            //     factoryAddr,
            //     ownerId
            //   );
            // console.log("fffxxx:currentUserInfo:", currentUserInfo);
            const acctList = await queryAccountList(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                currentUserInfo.bigBrotherOwnerId
            );
            console.log(
                currentUserInfo.chainCode,
                "client query, queryAccountList:",
                acctList
            );

            const accountAddrList: string[] = [];
            const accountToOwnerIdMap = new Map<string, string>();
            const accountToOrderNoMap = new Map<string, number>();
            acctList.forEach((a) => {
                accountAddrList.push(a.addr);
                accountToOwnerIdMap.set(
                    a.addr,
                    getOwnerIdSelfByBigBrother(
                        currentUserInfo.bigBrotherOwnerId,
                        a.orderNo
                    )
                );
                accountToOrderNoMap.set(a.addr, a.orderNo);
            });

            let mySelectedNo = currentUserInfo.selectedOrderNo;
            if (mySelectedNo >= accountAddrList.length) {
                mySelectedNo = 0;
            }

            const cUserInfo = {
                ...currentUserInfo,
                selectedOwnerId: getOwnerIdSelfByBigBrother(
                    currentUserInfo.bigBrotherOwnerId,
                    mySelectedNo
                ),
                selectedOrderNo: mySelectedNo,
                selectedAccountAddr: accountAddrList[mySelectedNo],
                accountAddrList: accountAddrList,
                accountToOwnerIdMap: accountToOwnerIdMap,
                accountToOrderNoMap: accountToOrderNoMap,
            };
            updateCurrentUserInfo(cUserInfo);
        };
        //
        fetchAcctList();
    }, [currentChainCode]);

    useEffect(() => {
        // This represents the currently selected account in the global scope
        console.log(
            "do something ,for currentUserInfo changed...",
            currentUserInfo.selectedAccountAddr
        );
        const fetchBalance = async () => {
            let eb = await queryEthBalance(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                currentUserInfo.selectedAccountAddr
            );
            console.log(
                currentUserInfo.chainCode,
                "client query, queryEthBalance:",
                currentUserInfo.selectedAccountAddr + ":" + eb
            );
            setEthBalance(eb == "0" ? "0.0" : eb);
        };

        const fetchW3eapBalance = async () => {
            let wb = await queryW3eapBalance(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                currentUserInfo.selectedAccountAddr
            );
            console.log(
                currentUserInfo.chainCode,
                "client query, queryW3eapBalance:",
                currentUserInfo.selectedAccountAddr + ":" + wb
            );
            setW3eapBalance(wb == "0" ? "0.0" : wb);
        };

        const fetchfreeGasFeeAmount = async () => {
            let fa = await queryfreeGasFeeAmount(
                currentUserInfo.chainCode,
                currentUserInfo.factoryAddr,
                currentUserInfo.selectedAccountAddr
            );
            console.log(
                currentUserInfo.chainCode,
                "client query, freeGasFeeAmount:",
                currentUserInfo.selectedAccountAddr + ":" + fa
            );
            setFreeGasFeeAmount(fa == "0" ? "0.0" : fa);
        };

        //
        if (currentUserInfo.selectedAccountAddr != "") {
            fetchBalance();
            fetchW3eapBalance();
            if (
                currentUserInfo.selectedOrderNo ==
                currentUserInfo.accountAddrList.length - 1
            ) {
                // the last one, has not created!
                setFreeGasFeeAmount("0.00");
            } else {
                fetchfreeGasFeeAmount();
            }
            document.getElementById("id_user_selectedOrderNo_btn")?.click();
        }
    }, [currentUserInfo]);

    const acctAddrDisplay = (fullAddr: string) => {
        if (fullAddr == undefined) {
            console.log("fullAddr is undefined in acctAddrDisplay");
            return "";
        }
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
        return (
            <Avatar
                isBordered={bd}
                name={addr.substring(2, 5)}
                color={color}
                style={{ fontSize: "18px" }}
            />
        );
    };

    /////////////////////////
    /////////////////////////

    function BtnselectedOrderNo() {
        const { pending } = useFormStatus();
        const handleClick = (event) => {
            if (pending) {
                event.preventDefault();
            }
            console.log("save selected Order....");
        };
        return (
            // <button aria-disabled={pending} type="submit" onClick={handleClick}>
            //   Login
            // </button>

            <Button
                disabled={pending}
                id="id_user_selectedOrderNo_btn"
                type="submit"
                onPress={handleClick}
                color="primary"
            >
                save OrderNo
            </Button>
        );
    }
    return (
        <div style={{ display: "flex" }}>
            <form action={dispatch} style={{ display: "none" }}>
                <input
                    id="id_user_selectedOrderNo"
                    style={{ display: "none" }}
                    name="selectedOrderNo"
                    value={currentUserInfo.selectedOrderNo}
                />
                <input
                    id="id_user_selectedAccountAddr"
                    style={{ display: "none" }}
                    name="selectedAccountAddr"
                    value={currentUserInfo.selectedAccountAddr}
                />

                <div>{resultMsg && <p>1:{resultMsg}</p>}</div>
                <BtnselectedOrderNo />
            </form>

            <Card className="max-w-[480px]">
                <CardHeader className="flex gap-3">
                    <AcctIcon
                        addr={acctAddrDisplay(
                            currentUserInfo.selectedAccountAddr
                        )}
                    ></AcctIcon>
                    <Snippet
                        hideSymbol={true}
                        codeString={
                            currentUserInfo.chainCode +
                            ": " +
                            currentUserInfo.selectedAccountAddr
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
                            value={currentUserInfo.selectedAccountAddr}
                            defaultValue={"-"}
                            style={{ width: "170px", height: "32px" }}
                            onChange={(e) => {
                                const cUserInfo = {
                                    ...currentUserInfo,
                                    selectedAccountAddr: e.target.value,

                                    selectedOwnerId:
                                        currentUserInfo.accountToOwnerIdMap.get(
                                            e.target.value
                                        ),
                                    selectedOrderNo:
                                        currentUserInfo.accountToOrderNoMap.get(
                                            e.target.value
                                        ),
                                };
                                updateCurrentUserInfo(cUserInfo);
                            }}
                        >
                            {currentUserInfo.accountAddrList.map(
                                (acctAddr, index) => (
                                    <option
                                        key={index}
                                        value={acctAddr}
                                        style={
                                            index ==
                                            currentUserInfo.accountAddrList
                                                .length -
                                                1
                                                ? {
                                                      color: "grey",
                                                      fontStyle: "italic",
                                                  }
                                                : {
                                                      fontWeight: "bold",
                                                      color: "Highlight",
                                                  }
                                        }
                                    >
                                        {acctAddrDisplay(acctAddr)}
                                    </option>
                                )
                            )}
                        </select>
                    </Snippet>

                    <div>
                        <p
                            className="text-md"
                            style={{
                                fontWeight: "bold",
                                fontSize: "18px",
                                color: "green",
                            }}
                        >
                            <label title={ethBalance}>
                                {formatNumber(ethBalance)}
                            </label>
                            &nbsp; ETH
                        </p>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardBody>
                    <h4 className="text-middle font-semibold leading-none text-default-600">
                        <label title={w3eapBalance}>
                            {formatNumber(w3eapBalance)}
                        </label>
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
                        <label title={freeGasFeeAmount}>
                            {formatNumber(freeGasFeeAmount)}
                        </label>
                        &nbsp;ETH
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
        </div>
    );
}
