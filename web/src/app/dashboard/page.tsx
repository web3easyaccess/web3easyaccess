"use server";

import myCookies from "../lib/myCookies";
import { queryAssets } from "@/app/blockchain/server/queryAccountInfo";
import Dashboard from "./dashboard";
import { currentNet } from "../blockchain/server/myChain";

import { getEthBalance } from "../lib/serverActions";

export default async function Page({ selectedMenu, txList }) {
  const myData = myCookies.loadData();
  const email = myCookies.getEmail();
  const balance = getEthBalance(myData.accountId);

  const assets = await queryAssets(myData.accountId);
  const current_net = currentNet();
  return (
    <Dashboard
      acctAddr={myData.accountId}
      ownerAddr={myData.ownerAddr}
      balance={balance}
      selectedMenu={selectedMenu || "assets"}
      txList={txList}
      assets={assets}
      chainId={currentNet().id}
      verifyingContract={myData.accountId}
      email={email}
      currentNet={current_net}
    ></Dashboard>
  );
}
