"use server";

import Login from "./login";

import myCookies from "../serverside/myCookies";

export default async function Page() {
  return (
    <div>
      <Login chainCode={myCookies.getChainCode()}></Login>
    </div>
  );
}
