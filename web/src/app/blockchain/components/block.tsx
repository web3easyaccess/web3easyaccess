"use server";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { useState } from "react";
import { publicClient } from "../server/chainClientOnServer";

export async function getBlockNumber() {
  const blockNumber = await publicClient.getBlockNumber();
  return blockNumber;

  //   return (
  //     <Input
  //       isReadOnly
  //       defaultValue={blockNumber.toString()}
  //       className="max-w-xs"
  //     />
  //   );
}
