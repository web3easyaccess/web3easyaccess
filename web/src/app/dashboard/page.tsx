"use server";

import myCookies from "../serverside/myCookies";
import { queryAssets } from "../serverside/blockchain/queryAccountInfo";
import Dashboard from "./dashboard";
import { getChainObj } from "../serverside/blockchain/myChain";

import { getEthBalance } from "../serverside/serverActions";

export default async function Page({ selectedMenu, txList }) {
  const myData = myCookies.loadData();
  const email = myData.email;
  const balance = getEthBalance(myData.accountId);

  const assets = await queryAssets(myData.accountId);
  const current_obj = getChainObj();
  console.log("dashboard:..net.:", current_obj);
  return (
    <Dashboard
      acctAddr={myData.accountId}
      ownerAddr={myData.ownerAddr}
      balance={balance}
      selectedMenu={selectedMenu || "assets"}
      txList={txList}
      assets={assets}
      chainId={getChainObj().id}
      verifyingContract={myData.accountId}
      email={email}
      chainObj={current_obj}
    ></Dashboard>
  );
}
