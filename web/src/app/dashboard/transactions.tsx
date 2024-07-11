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
} from "@nextui-org/react";

import { queryTransactions } from "../lib/chainQuery";

import { Menu, UserInfo, uiToString, Transaction } from "../lib/myTypes";

export default function App({
    currentUserInfo,
}: {
    currentUserInfo: UserInfo;
}) {
    const rr: Transaction[] = [];
    const [txList, setTxList] = useState(rr);

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
            setTxList(aList);
        };
        if (currentUserInfo.selectedAccountAddr != "") {
            fetchTxList();
        }
    }, [currentUserInfo]);

    let kk = 0;

    const shortAddr = (aa: string) => {
        return aa.substring(0, 6) + " ... " + aa.substring(aa.length - 4);
    };

    const shortTrans = (aa: string) => {
        return aa.substring(0, 6) + " ... " + aa.substring(66 - 4);
    };

    const adjustTimestamp = (tt: string) => {
        return tt.substring(0, 19);
    };

    return (
        <Tabs aria-label="Options">
            <Tab key="assetTransactions" title="Asset Transactions">
                <Table
                    removeWrapper
                    aria-label="Example static collection table"
                >
                    <TableHeader>
                        <TableColumn>From</TableColumn>
                        <TableColumn>To</TableColumn>
                        <TableColumn>Amount</TableColumn>
                        <TableColumn>Timestamp</TableColumn>
                        <TableColumn>Transaction Hash</TableColumn>
                        <TableColumn>Transaction Order</TableColumn>
                        <TableColumn>Gas Fee</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {txList.map((tx) => (
                            <TableRow key={(++kk).toString()}>
                                <TableCell>
                                    <div
                                        style={{
                                            color:
                                                tx.from ==
                                                currentUserInfo.selectedAccountAddr
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
                                            color:
                                                tx.to ==
                                                currentUserInfo.selectedAccountAddr
                                                    ? "red"
                                                    : "black",
                                        }}
                                    >
                                        {shortAddr(tx.to)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {tx.to ==
                                    currentUserInfo.selectedAccountAddr
                                        ? tx.value
                                        : -1 * Number(tx.value)}
                                </TableCell>
                                <TableCell>
                                    {adjustTimestamp(tx.timestamp)}
                                </TableCell>
                                <TableCell>{shortTrans(tx.hash)}</TableCell>
                                <TableCell>{0}</TableCell>
                                <TableCell>
                                    {tx.l1_fee +
                                        Number(tx.gas_price) * tx.gas_used}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Tab>
            <Tab key="allTransactions" title="All Transactions">
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
                                            color:
                                                tx.from ==
                                                currentUserInfo.selectedAccountAddr
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
                                            color:
                                                tx.to ==
                                                currentUserInfo.selectedAccountAddr
                                                    ? "red"
                                                    : "black",
                                        }}
                                    >
                                        {shortAddr(tx.to)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {tx.to ==
                                    currentUserInfo.selectedAccountAddr
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
