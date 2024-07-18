"use client";

import React from "react";
import { useEffect, useState } from "react";

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tabs,
    Tab,
    CardBody,
    Card,
    Link,
} from "@nextui-org/react";

import { queryTransactions } from "../lib/chainQuery";

import { Menu, UserInfo, uiToString, Transaction } from "../lib/myTypes";
import { getChainObj } from "../lib/myChain";

import { thegraphQueryOpLog } from "../serverside/serverActions";

export default function App({
    currentUserInfo,
}: {
    currentUserInfo: UserInfo;
}) {
    const rr: Transaction[] = [];
    const [txList, setTxList] = useState(rr);

    const chainObj = getChainObj(currentUserInfo.chainCode);
    const explorerUrl = chainObj.blockExplorers.default.url;

    const [opLogs, setOpLogs] = React.useState([]);

    useEffect(() => {
        // execute(ExampleQueryDocument, {}).then((result) => {
        //     setData(result?.data);
        //     console.log("ExampleQueryDocument result:", result);
        // });
        const fetchThegraph = async () => {
            console.log("currentUserInfoxxxxxx:", currentUserInfo);
            if (
                currentUserInfo.selectedAccountAddr != undefined &&
                currentUserInfo.selectedAccountAddr != ""
            ) {
                const jsonData = await thegraphQueryOpLog(
                    currentUserInfo.selectedAccountAddr.toLowerCase()
                );
                console.log("fetch thegraphQueryOpLog:", jsonData);
                setOpLogs(jsonData);
            }
        };
        fetchThegraph();
    }, [currentUserInfo]);

    useEffect(() => {
        const fetchTxList = async () => {
            // suffix with 0000
            console.log(
                "fetchTxList, account:",
                currentUserInfo.selectedAccountAddr
            );
            const aList = await queryTransactions(
                currentUserInfo.chainCode,
                currentUserInfo.selectedAccountAddr
            );
            aList.sort((a, b) => {
                if (a.timestamp < b.timestamp) {
                    return 1;
                } else {
                    return -1;
                }
            });
            setTxList(aList);
        };
        if (currentUserInfo.selectedAccountAddr != "") {
            fetchTxList();
        }
    }, [currentUserInfo]);

    let kk = 0;

    const explorerAddrUrl = (aa: string) => {
        if (aa == undefined || aa == null) {
            return "";
        }
        return `${explorerUrl}/address/${aa}`;
    };

    const explorerTxUrl = (hash: string) => {
        if (hash == undefined || hash == null) {
            return "";
        }
        let idx = hash.indexOf("::");
        let xx = hash;
        if (idx > 0) {
            xx = hash.substring(0, idx);
            return `${explorerUrl}/tx/${xx}?tab=internal`;
        } else {
            return `${explorerUrl}/tx/${xx}`;
        }
    };

    const txOrder = (hash: string) => {
        if (hash == undefined || hash == null) {
            return "";
        }
        let idx = hash.indexOf("::");
        if (idx < 0) {
            return "-";
        } else {
            let ss = hash.substring(idx + 2);
            let idx2 = ss.indexOf("::");
            if (idx2 > 0) {
                return ss.substring(0, idx2);
            } else {
                return ss;
            }
        }
    };

    const addressEq = (addr1: string, addr2: string) => {
        if (
            addr1 != undefined &&
            addr2 != undefined &&
            addr1.trim().toLocaleLowerCase() == addr2.trim().toLocaleLowerCase()
        ) {
            return true;
        }
        return false;
    };
    const shortAddr = (aa: string) => {
        if (aa == undefined || aa == null) {
            return "";
        }
        return aa.substring(0, 6) + " ... " + aa.substring(aa.length - 4);
    };

    const shortTrans = (hash: string) => {
        if (hash == undefined || hash == null || hash.length == 0) {
            return "";
        }
        let idx = hash.indexOf("::");
        let xx = hash;
        if (idx > 0) {
            xx = hash.substring(0, idx);
        } else {
        }

        return xx.substring(0, 6) + " ... " + xx.substring(xx.length - 4);
    };

    const adjustTimestamp = (tt: string) => {
        if (tt == undefined || tt == null) {
            return "";
        }
        return tt.substring(0, 19);
    };

    const calGasFee = (tx: any) => {
        const res = tx.l1_fee + Number(tx.gas_price) * tx.gas_used;
        if (res.toString() == "NaN") {
            return "-";
        } else {
            return res;
        }
    };

    return (
        <Tabs aria-label="Options">
            <Tab key="assetTransactions" title="Asset Transactions">
                <div
                    style={{
                        width: "1005px",
                        height: "410px",
                        overflowX: "auto",
                        overflowY: "auto",
                    }}
                >
                    <Table
                        removeWrapper
                        aria-label="Example static collection table"
                        style={{ width: "1600px" }}
                    >
                        <TableHeader>
                            <TableColumn style={{ width: "100px" }}>
                                From
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                To
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Amount
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Timestamp
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Transaction Hash
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Transaction Order
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Gas Fee(ETH)
                            </TableColumn>
                        </TableHeader>
                        <TableBody>
                            {txList
                                .filter(
                                    (tx) =>
                                        Number(tx.value) != 0 ||
                                        tx.hash.indexOf("::") < 0
                                )
                                .map((tx) => (
                                    <TableRow key={(++kk).toString()}>
                                        <TableCell>
                                            <Link
                                                isExternal
                                                href={explorerAddrUrl(tx.from)}
                                                color={
                                                    addressEq(
                                                        tx.from,
                                                        currentUserInfo.selectedAccountAddr
                                                    )
                                                        ? "danger"
                                                        : "primary"
                                                }
                                            >
                                                {shortAddr(tx.from)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                isExternal
                                                href={explorerAddrUrl(tx.to)}
                                                color={
                                                    addressEq(
                                                        tx.to,
                                                        currentUserInfo.selectedAccountAddr
                                                    )
                                                        ? "danger"
                                                        : "primary"
                                                }
                                            >
                                                {shortAddr(tx.to)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {addressEq(
                                                tx.to,
                                                currentUserInfo.selectedAccountAddr
                                            )
                                                ? tx.value
                                                : -1 * Number(tx.value)}
                                        </TableCell>
                                        <TableCell>
                                            {adjustTimestamp(tx.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                isExternal
                                                href={explorerTxUrl(tx.hash)}
                                            >
                                                {shortTrans(tx.hash)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {txOrder(tx.hash)}
                                        </TableCell>
                                        <TableCell>{calGasFee(tx)}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </Tab>
            <Tab key="myOperationLogs" title="My Operation Logs">
                <div
                    style={{
                        width: "1005px",
                        height: "410px",
                        overflowX: "auto",
                        overflowY: "auto",
                    }}
                >
                    <Table
                        removeWrapper
                        aria-label="Example static collection table"
                        style={{ width: "1000px" }}
                    >
                        <TableHeader>
                            <TableColumn style={{ width: "100px" }}>
                                Operation Type
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Description
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Timestamp
                            </TableColumn>
                            <TableColumn style={{ width: "100px" }}>
                                Transaction Hash
                            </TableColumn>
                        </TableHeader>
                        <TableBody>
                            {opLogs.map((op) => (
                                <TableRow key={(++kk).toString()}>
                                    <TableCell>{op.operationType}</TableCell>
                                    <TableCell>
                                        <label title={op.description}>
                                            {shortTrans(op.description)}
                                        </label>
                                    </TableCell>
                                    <TableCell>
                                        {adjustTimestamp(op.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            isExternal
                                            href={explorerTxUrl(op.hash)}
                                        >
                                            {shortTrans(op.hash)}
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Tab>
            <Tab
                key="allTransactions"
                title="All Transactions"
                style={{ display: "none" }}
            >
                <Table
                    removeWrapper
                    aria-label="Example static collection table"
                >
                    <TableHeader>
                        <TableColumn>from</TableColumn>
                        <TableColumn>to</TableColumn>
                        <TableColumn>value</TableColumn>
                        <TableColumn>timestamp</TableColumn>
                        <TableColumn>transactoin hash</TableColumn>
                        <TableColumn>block number</TableColumn>
                        <TableColumn>total fee</TableColumn>
                        <TableColumn>L1 fee</TableColumn>
                        <TableColumn>gas fee(price X used)</TableColumn>
                        <TableColumn>gas price</TableColumn>
                        <TableColumn>gas used</TableColumn>
                        <TableColumn>gas limit</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {txList.map((tx) => (
                            <TableRow key={(++kk).toString()}>
                                <TableCell>
                                    <div
                                        style={{
                                            color: addressEq(
                                                tx.from,
                                                currentUserInfo.selectedAccountAddr
                                            )
                                                ? "red"
                                                : "black",
                                        }}
                                    >
                                        {shortAddr(tx.from)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        style={{
                                            color: addressEq(
                                                tx.to,
                                                currentUserInfo.selectedAccountAddr
                                            )
                                                ? "red"
                                                : "black",
                                        }}
                                    >
                                        {shortAddr(tx.to)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {addressEq(
                                        tx.to,
                                        currentUserInfo.selectedAccountAddr
                                    )
                                        ? tx.value
                                        : -1 * Number(tx.value)}
                                </TableCell>
                                <TableCell>
                                    {adjustTimestamp(tx.timestamp)}
                                </TableCell>
                                <TableCell>{shortTrans(tx.hash)}</TableCell>
                                <TableCell>{tx.block_number}</TableCell>
                                <TableCell>
                                    {tx.l1_fee +
                                        Number(tx.gas_price) * tx.gas_used}
                                </TableCell>
                                <TableCell>{tx.l1_fee}</TableCell>
                                <TableCell>
                                    {Number(tx.gas_price) * tx.gas_used}
                                </TableCell>
                                <TableCell>{tx.gas_price}</TableCell>
                                <TableCell>{tx.gas_used}</TableCell>
                                <TableCell>{tx.gas_limit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Tab>
        </Tabs>
    );
}
