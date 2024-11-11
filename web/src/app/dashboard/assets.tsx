"use client";

import React, { MutableRefObject } from "react";
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
import {
    readAccountAddr,
    readFactoryAddr,
    UpdateUserProperty,
    UserProperty,
} from "../storage/userPropertyStore";
import { getAssetsScanUrl } from "../chainsconf/chains";

export default function Assets({ userProp }: { userProp: UserProperty }) {
    const [assets, setAssets] = useState([]);
    console.log("assets:");

    useEffect(() => {
        const acctAddr = readAccountAddr(userProp);
        const factoryAddr = readFactoryAddr(userProp);
        const fetchAssets = async () => {
            if (
                acctAddr == "" ||
                acctAddr == undefined ||
                userProp.selectedChainCode == ChainCode.UNKNOW ||
                factoryAddr == "" ||
                factoryAddr == undefined
            ) {
                return;
            }
            // suffix with 0000
            console.log(
                "fetchAssets, account:",
                userProp.selectedChainCode,
                factoryAddr,
                acctAddr
            );
            const a = await queryAssets(
                userProp.selectedChainCode,
                factoryAddr,
                acctAddr
            );
            setAssets(a as any);
        };

        fetchAssets();
    }, [userProp]);

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

    const scanUrl = getAssetsScanUrl(
        userProp.selectedChainCode,
        readAccountAddr(userProp)
    );

    return (
        <div className="flex w-full flex-col">
            {scanUrl == "" ? null : (
                <Link style={{ marginLeft: "10px" }} isExternal href={scanUrl}>
                    Query all Assets in Etherscan
                </Link>
            )}
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
