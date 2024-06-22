"use server";
import Main from "../page";

import myCookies from "../../serverside/myCookies";

export default async function Page() {
  const selectedMenu = "privateinfo";

  return <Main selectedMenu={selectedMenu} txList={undefined}></Main>;
}
