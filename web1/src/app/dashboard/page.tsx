"use server";

import myCookies from "../serverside/myCookies";
import {
  queryAssets,
  queryQuestionIds,
} from "../serverside/blockchain/queryAccountInfo";
import Dashboard from "./dashboard";
import { getChainObj } from "../serverside/blockchain/myChain";

import { getEthBalance } from "../serverside/serverActions";

import { queryTransactions } from "../serverside/blockchain/queryAccountInfo";
import redirectTo from "../serverside/redirectTo";

import { Menu } from "../lib/menu";

export default async function Page({ selectedMenu }: { selectedMenu: Menu }) {
  redirectTo.urlLoggedInCheck();
  console.log("selectedMenu in dashbord:", selectedMenu);
  selectedMenu = selectedMenu ? selectedMenu : Menu.Asset;
  console.log("selectedMenu in dashbord2:", selectedMenu);
  const myData = myCookies.loadData();
  const email = myData.email;
  const balance = await getEthBalance(myData.accountId);
  const current_obj = getChainObj();

  return (
    <Dashboard
      acctAddr={myData.accountId}
      ownerId={myData.ownerId}
      balance={balance}
      selectedMenu={selectedMenu}
      txList={
        selectedMenu == Menu.Transactions
          ? await queryTransactions(myData.accountId)
          : null
      }
      assets={
        selectedMenu == Menu.Asset ? await queryAssets(myData.accountId) : null
      }
      chainId={current_obj.id}
      verifyingContract={myData.accountId}
      email={email}
      chainObj={current_obj}
      selectedQuestionIds={
        selectedMenu == Menu.PrivateSetting
          ? await queryQuestionIds(myData.accountId)
          : null
      }
    ></Dashboard>
  );
}
