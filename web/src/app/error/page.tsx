"use server";

import React from "react";
import { getChainObj } from "../serverside/blockchain/myChain";
import Error from "./error";

export default async function Home({}) {
  const current_obj = getChainObj();
  return (
    <>
      <Error chainCode={current_obj.chainCode}></Error>
    </>
  );
}
