"use server";

import myCookies from "../lib/myCookies";

import Private from "./private";

import { currentNet } from "../blockchain/server/myChain";
import redirectTo from "../lib/redirectTo";

export default async function Page() {
  const myData = myCookies.loadData();
  const email = myCookies.getEmail(); // || "abc@def.com";
  if (email == undefined || email == null || email == "") {
    redirectTo.urlLogin();
  }
  const current_net = currentNet();
  return (
    <Private
      chainId={current_net.id}
      verifyingContract={myData.accountId}
      email={email}
      currentNet={current_net}
    ></Private>
  );
}
