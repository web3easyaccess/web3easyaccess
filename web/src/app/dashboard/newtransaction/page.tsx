"use server";
import Main from "../page";

import myCookies from "../../serverside/myCookies";
import redirectTo from "@/app/serverside/redirectTo";

export default async function Page() {
  const selectedMenu = "newtransactions";
  redirectTo.urlLoggedInCheck();

  return <Main selectedMenu={selectedMenu} txList={undefined}></Main>;
}
