"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Link,
    Snippet,
} from "@nextui-org/react";

// import { queryAccount } from "./server/callAdmin";
// import genPrivateInfo from "./client/genPrivateInfo";

import { useFormState } from "react-dom";
import { queryAssets } from "../lib/chainQuery";

import { ChainCode, Menu, UserInfo, uiToString } from "../lib/myTypes";

export default function App({
    userPropState,
    serverSidePropState,
}: {
    userPropState: {
        bigBrotherOwnerId: string;
        email: string;
        emailDisplay: string;
        selectedOrderNo: number;
        selectedAccountAddr: string;
        selectedChainCode: ChainCode;
        testMode: boolean;
    };
    serverSidePropState: {
        w3eapAddr: string;
        factoryAddr: string;
        bigBrotherPasswdAddr: string;
    };
}) {
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        const fetchAssets = async () => {
            // suffix with 0000
            console.log(
                "fetchAssets, account:",
                userPropState.selectedAccountAddr,
                userPropState.selectedOrderNo
            );
            const a = await queryAssets(
                userPropState.selectedChainCode,
                serverSidePropState.factoryAddr,
                `0x${userPropState.selectedAccountAddr.substring(2)}`
            );
            setAssets(a as any);
        };
        if (userPropState.selectedAccountAddr != "") {
            fetchAssets();
        }
    }, [serverSidePropState]);

    let kk = 0;
    //   token_address: "-",
    //   token_name: "ETH",
    //   token_symbol: "ETH",
    //   token_type: "-",
    //   balance: balance,

    const addrDisplay = (fullAddr: string) => {
        if (fullAddr == undefined || fullAddr.length < 40) {
            return fullAddr;
        }
        return fullAddr.substring(0, 6) + "..." + fullAddr.substring(38);
    };

    const TokenAddr = ({ address }: { address: string }) => {
        if (address == "") {
            return <div></div>;
        }
        return (
            <Snippet
                hideSymbol={true}
                codeString={address}
                variant="bordered"
                style={{
                    fontSize: "16px",
                    height: "40px",
                    padding: "0px",
                }}
            >
                {addrDisplay(address)}
            </Snippet>
        );
    };

    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="Options">
                <Tab key="tokens" title="Tokens">
                    <Table
                        isStriped
                        aria-label="Example static collection table"
                    >
                        <TableHeader>
                            <TableColumn>Token Symbol</TableColumn>
                            <TableColumn>Token Address</TableColumn>
                            <TableColumn>Balance</TableColumn>
                            <TableColumn>Price</TableColumn>
                            <TableColumn>USD Value</TableColumn>
                            <TableColumn>Price Time</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {assets.map((aa) => (
                                <TableRow key={(++kk).toString()}>
                                    <TableCell>{aa.token_symbol}</TableCell>
                                    <TableCell>
                                        <TokenAddr
                                            address={aa.token_address}
                                        ></TokenAddr>
                                    </TableCell>
                                    <TableCell>{aa.balance}</TableCell>
                                    <TableCell>{"-"}</TableCell>
                                    <TableCell>{"-"}</TableCell>
                                    <TableCell>{"-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Tab>
                <Tab key="nfts" title="NFTs">
                    <Card>
                        <CardBody>Coming soon!</CardBody>
                    </Card>
                </Tab>
                <Tab
                    key="bridge"
                    title="Bridge"
                    style={{ fontWeight: "bold", display: "none" }}
                >
                    <Card
                        style={{
                            maxWidth: "400px",
                            height: "40px",
                            paddingTop: "5px",
                        }}
                    >
                        <CardBody>Not Yet!</CardBody>
                        {/* <Link href="/dashboard/bridge" showAnchorIcon>
              &nbsp;Bridge between Morph and Ethereum
            </Link> */}
                    </Card>
                </Tab>
            </Tabs>
        </div>
    );
}
