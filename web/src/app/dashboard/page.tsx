"use server";

import myCookies from "../serverside/myCookies";
import { queryAssets } from "../serverside/blockchain/queryAccountInfo";
import Dashboard from "./dashboard";
import { currentNet } from "../serverside/blockchain/myChain";

import { getEthBalance } from "../serverside/serverActions";

export default async function Page({ selectedMenu, txList }) {
  const myData = myCookies.loadData();
  const email = myData.email;
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
