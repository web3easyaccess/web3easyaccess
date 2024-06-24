"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Transaction } from "../acctdetail/types";

export default function Transactions({ txList, acctAddr, chainObj }) {
  console.log("Transactions....::::chainObj:", chainObj);
  const myTrans: Transaction[] = txList;
  //   acctAddr = "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6";
  let kk = 0;

  const shortAddr = (aa) => {
    return aa.substring(0, 6) + " ... " + aa.substring(aa.length - 4);
  };

  const shortTrans = (aa) => {
    return aa.substring(0, 6) + " ... " + aa.substring(66 - 4);
  };

  const adjustTimestamp = (tt) => {
    return tt.substring(0, 19);
  };

  return (
    <Table removeWrapper aria-label="Example static collection table">
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
        {myTrans.map((tx) => (
          <TableRow key={(++kk).toString()}>
            <TableCell>
              <div style={{ color: tx.from == acctAddr ? "red" : "black" }}>
                {shortAddr(tx.from)}
              </div>
            </TableCell>
            <TableCell>
              <div style={{ color: tx.to == acctAddr ? "red" : "black" }}>
                {shortAddr(tx.to)}
              </div>
            </TableCell>
            <TableCell>
              {tx.to == acctAddr ? tx.value : -1 * tx.value}
            </TableCell>
            <TableCell>{adjustTimestamp(tx.timestamp)}</TableCell>
            <TableCell>{shortTrans(tx.hash)}</TableCell>
            <TableCell>{tx.block_number}</TableCell>
            <TableCell>{tx.l1_fee + tx.gas_price * tx.gas_used}</TableCell>
            <TableCell>{tx.l1_fee}</TableCell>
            <TableCell>{tx.gas_price * tx.gas_used}</TableCell>
            <TableCell>{tx.gas_price}</TableCell>
            <TableCell>{tx.gas_used}</TableCell>
            <TableCell>{tx.gas_limit}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
