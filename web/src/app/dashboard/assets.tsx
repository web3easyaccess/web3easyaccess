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
    <Table isStriped aria-label="Example static collection table">
      <TableHeader>
        <TableColumn>Token Symbol</TableColumn>
        <TableColumn>Token Address</TableColumn>
        <TableColumn>Token Type</TableColumn>
        <TableColumn>Balance</TableColumn>
      </TableHeader>
      <TableBody>
        {assets.map((aa) => (
          <TableRow key={(++kk).toString()}>
            <TableCell>{aa.token_symbol}</TableCell>
            <TableCell>{aa.token_address}</TableCell>
            <TableCell>{aa.token_type}</TableCell>
            <TableCell>{aa.balance}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
