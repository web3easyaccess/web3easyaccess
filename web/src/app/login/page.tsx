"use server";

import Login from "./login";

import { getChainObj } from "../serverside/blockchain/myChain";

export default async function Page() {
  return (
    <div>
      <Login chainCode={getChainObj().chainCode}></Login>
    </div>
  );
}
