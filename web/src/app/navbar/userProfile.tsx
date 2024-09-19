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
import { getChainObj } from "../lib/myChain";

import {
    web3wallet,
    createWeb3Wallet,
    updateSignClientChainId,
} from "../walletconnect/utils/WalletConnectUtil";
import { UserProperty } from "../storage/LocalStore";

export default function App({
    userProp,
    updateUserProp,
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
}) {
    console.log("userProfile, entry:", userProp.ref, "++++", userProp.state);

    const [resultMsg, dispatch] = useFormState(saveSelectedOrderNo, undefined);

    const [ethBalance, setEthBalance] = useState("-");
    const [w3eapBalance, setW3eapBalance] = useState("-");
    const [freeGasFeeAmount, setFreeGasFeeAmount] = useState("-");

    const accountToOrderNoMap = useRef(new Map<string, number>());
    const [accountAddrList, setAccountAddrList] = useState([""]);

    const build4WalletConnect = () => {
        localStorage.setItem(
            "W3EA_CURRENT_ADDRESS",
            userProp.ref.current.selectedAccountAddr
        );
    };

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
            console.log("fffxxx:currentUserInfo:", userProp.ref.current);
            console.log(
                "fffxxx:currentUserInfo22:",
                userProp.serverSidePropState
            );
            if (
                userProp.ref.current.email == "" ||
                userProp.ref.current.email == undefined ||
                userProp.serverSidePropState.factoryAddr == "" ||
                userProp.serverSidePropState.factoryAddr == undefined
            ) {
                return;
            }
            console.log(
                "fffxxx:currentUserInfo33:",
                userProp.serverSidePropState
            );
            const acctList = await queryAccountList(
                userProp.ref.current.selectedChainCode,
                userProp.serverSidePropState.factoryAddr,
                userProp.ref.current.bigBrotherOwnerId
            );
            console.log(
                userProp.ref.current.selectedChainCode,
                "client query, queryAccountList:",
                acctList
            );

            const myAcctList: string[] = []; // setAccountAddrList
            acctList.forEach((a) => {
                myAcctList.push(a.addr);
                accountToOrderNoMap.current.set(a.addr, a.orderNo);
            });

            let mySelectedNo = userProp.ref.current.selectedOrderNo;
            if (mySelectedNo >= myAcctList.length) {
                mySelectedNo = 0;
            }

            updateUserProp({
                email: userProp.ref.current.email,
                selectedOrderNo: mySelectedNo,
                selectedAccountAddr: myAcctList[mySelectedNo],
                selectedChainCode: userProp.ref.current.selectedChainCode,
                testMode: false,
            });
            setAccountAddrList(myAcctList);

            // const cUserInfo = {
            //     ...currentUserInfo,
            //     selectedOwnerId: getOwnerIdSelfByBigBrother(
            //         currentUserInfo.bigBrotherOwnerId,
            //         mySelectedNo
            //     ),
            //     selectedOrderNo: mySelectedNo,
            //     selectedAccountAddr: accountAddrList[mySelectedNo],
            //     accountAddrList: accountAddrList,
            // };
            // updateCurrentUserInfo(cUserInfo);
        };
        //
        fetchAcctList();
    }, [userProp.serverSidePropState]);

    useEffect(() => {
        // This represents the currently selected account in the global scope
        if (accountAddrList.length == 0) {
            return;
        }
        if (userProp.serverSidePropState.factoryAddr == "") {
            return;
        }
        console.log(
            "do something ,for currentUserInfo changed...",
            userProp.ref.current.selectedAccountAddr
        );

        const fetchBalance = async () => {
            let eb = await queryEthBalance(
                userProp.ref.current.selectedChainCode,
                userProp.serverSidePropState.factoryAddr,
                userProp.ref.current.selectedAccountAddr
            );
            console.log(
                userProp.ref.current.selectedChainCode,
                "client query, queryEthBalance:",
                userProp.ref.current.selectedAccountAddr + ":" + eb
            );
            setEthBalance(eb == "0" ? "0.0" : eb);
        };

        const fetchW3eapBalance = async () => {
            console.log(
                "fetchW3eapBalance:",
                userProp.ref.current.selectedChainCode,
                "+",
                userProp.serverSidePropState.factoryAddr,
                "+",
                userProp.ref.current.selectedAccountAddr
            );
            let wb = await queryW3eapBalance(
                userProp.ref.current.selectedChainCode,
                userProp.serverSidePropState.factoryAddr,
                userProp.ref.current.selectedAccountAddr
            );
            console.log(
                userProp.ref.current.selectedChainCode,
                "client query, queryW3eapBalance:",
                userProp.ref.current.selectedAccountAddr + ":" + wb
            );
            setW3eapBalance(wb == "0" ? "0.0" : wb);
        };

        const fetchfreeGasFeeAmount = async () => {
            let fa = await queryfreeGasFeeAmount(
                userProp.ref.current.selectedChainCode,
                userProp.serverSidePropState.factoryAddr,
                userProp.ref.current.selectedAccountAddr
            );
            console.log(
                userProp.ref.current.selectedChainCode,
                "client query, freeGasFeeAmount:",
                userProp.ref.current.selectedAccountAddr + ":" + fa
            );
            setFreeGasFeeAmount(fa == "0" ? "0.0" : fa);
        };

        //
        if (userProp.ref.current.selectedAccountAddr != "") {
            build4WalletConnect();
            fetchBalance();
            fetchW3eapBalance();
            if (
                userProp.ref.current.selectedOrderNo ==
                accountAddrList.length - 1
            ) {
                // the last one, has not created!
                setFreeGasFeeAmount("0.00");
            } else {
                fetchfreeGasFeeAmount();
            }
            document.getElementById("id_user_selectedOrderNo_btn")?.click();
        }
    }, [userProp.serverSidePropState, accountAddrList]);

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
                    defaultValue={userProp.state.selectedOrderNo}
                />
                <input
                    id="id_user_selectedAccountAddr"
                    style={{ display: "none" }}
                    name="selectedAccountAddr"
                    defaultValue={userProp.state.selectedAccountAddr}
                />

                <div>{resultMsg && <p>1:{resultMsg}</p>}</div>
                <BtnselectedOrderNo />
            </form> */}

            <Card className="max-w-[480px]">
                <CardHeader className="flex gap-3">
                    <AcctIcon
                        addr={acctAddrDisplay(
                            userProp.state.selectedAccountAddr
                        )}
                    ></AcctIcon>
                    <Snippet
                        hideSymbol={true}
                        codeString={
                            userProp.state.selectedChainCode +
                            ": " +
                            userProp.state.selectedAccountAddr
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
                            value={userProp.state.selectedAccountAddr}
                            defaultValue={"-"}
                            style={{ width: "170px", height: "32px" }}
                            onChange={(e) => {
                                updateUserProp({
                                    email: userProp.state.email,
                                    selectedOrderNo:
                                        accountToOrderNoMap.current.get(
                                            e.target.value
                                        ),
                                    selectedAccountAddr: e.target.value,
                                    selectedChainCode:
                                        userProp.state.selectedChainCode,
                                    testMode: false,
                                });
                            }}
                        >
                            {accountAddrList.map((acctAddr, index) => (
                                <option
                                    key={index}
                                    value={acctAddr}
                                    defaultValue={acctAddr}
                                    style={
                                        index == accountAddrList.length - 1
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
                            ))}
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
