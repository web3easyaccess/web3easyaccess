import Main from "../page";

import myCookies from "../../serverside/myCookies";

import { queryAssets } from "../../serverside/blockchain/queryAccountInfo";

export default async function Page() {
  const selectedMenu = "assets";
  const acctId = myCookies.loadData().accountId;
  const assets = await queryAssets(acctId);

  return <Main selectedMenu={selectedMenu} assets={assets}></Main>;
}
