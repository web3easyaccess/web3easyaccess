import Main from "../page";

import myCookies from "../../serverside/myCookies";

import { queryAssets } from "../../serverside/blockchain/queryAccountInfo";
import { Menu } from "../../lib/myTypes";

export default async function Page() {
  const selectedMenu = Menu.Asset;

  return <Main selectedMenu={selectedMenu}></Main>;
}
