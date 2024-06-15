"use server";

import myCookies from "../lib/myCookies";
import { queryAssets } from "@/app/blockchain/server/queryAccountInfo";
import Dashboard from "./dashboard";
import { currentNet } from "../blockchain/server/myChain";

import { getEthBalance } from "../lib/serverActions";

export default async function Page({ selectedMenu, txList }) {
  const acctAddr = myCookies.getAccountId().toString();
  const ownerId = myCookies.getOwnerId();
  const balance = getEthBalance(acctAddr);
  const email = myCookies.getEmail();
  const assets = await queryAssets(acctAddr);
  const current_net = currentNet();
  return (
    <Dashboard
      acctAddr={acctAddr}
      ownerId={ownerId}
      balance={balance}
      selectedMenu={selectedMenu || "assets"}
      txList={txList}
      assets={assets}
      chainId={currentNet().id}
      verifyingContract={acctAddr}
      email={email}
      currentNet={current_net}
    ></Dashboard>
  );
}
