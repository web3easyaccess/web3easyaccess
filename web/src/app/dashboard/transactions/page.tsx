"use server";
import Main from "../page";

import myCookies from "../../lib/myCookies";
import { queryTransactions } from "@/app/blockchain/server/queryAccountInfo";

export default async function Page() {
  const selectedMenu = "transactions";
  const acctId = myCookies.getAccountId();
  const txList = await queryTransactions(acctId);
  console.log("========================in transactions, txList:", txList);
  return <Main selectedMenu={selectedMenu} txList={txList}></Main>;
}
