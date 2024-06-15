import Main from "../page";

import myCookies from "../../lib/myCookies";

import { queryAssets } from "@/app/blockchain/server/queryAccountInfo";

export default async function Page() {
  const selectedMenu = "assets";
  const acctId = myCookies.getAccountId();
  const assets = await queryAssets(acctId);
  return <Main selectedMenu={selectedMenu} assets={assets}></Main>;
}
