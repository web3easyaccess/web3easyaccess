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
} from "@nextui-org/react";

// import { queryAccount } from "./server/callAdmin";
// import genPrivateInfo from "./client/genPrivateInfo";

import { useFormState } from "react-dom";

export default function Assets({ assets, chainObj }) {
  console.log("Assets..22..chainObj:", chainObj.chainCode);
  let kk = 0;
  //   token_address: "-",
  //   token_name: "ETH",
  //   token_symbol: "ETH",
  //   token_type: "-",
  //   balance: balance,

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Options">
        <Tab key="tokens" title="Tokens">
          <Table aria-label="Example static collection table">
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
                  <TableCell>{aa.token_address}</TableCell>
                  <TableCell>{aa.balance}</TableCell>
                  <TableCell>{1000}</TableCell>
                  <TableCell>{1000 * aa.balance}</TableCell>
                  <TableCell>{"2024-01-01 23:45:54"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Tab>
        <Tab key="nfts" title="NFTs">
          <Card>
            <CardBody>Not Yet!</CardBody>
          </Card>
        </Tab>
        <Tab key="bridge" title="Bridge" style={{ fontWeight: "bold" }}>
          <Card
            style={{
              maxWidth: "400px",
              height: "40px",
              paddingTop: "5px",
            }}
          >
            <Link href="/dashboard/bridge" showAnchorIcon>
              &nbsp;Bridge between Morph and Ethereum
            </Link>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
