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

export default function Transactions({ txList, acctAddr }) {
  console.log("Transactions....");
  const myTrans: Transaction[] = txList;
  let kk = 0;
  return (
    <Table isStriped aria-label="Example static collection table">
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
                {tx.from}
              </div>
            </TableCell>
            <TableCell>
              <div style={{ color: tx.to == acctAddr ? "red" : "black" }}>
                {tx.to}
              </div>
            </TableCell>
            <TableCell>
              {tx.to == acctAddr ? tx.value : -1 * tx.value}
            </TableCell>
            <TableCell>{tx.timestamp}</TableCell>
            <TableCell>{tx.hash}</TableCell>
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
