"use server";

import myCookies from "../lib/myCookies";

import Private from "./private";

import { currentNet } from "../blockchain/server/myChain";

export default async function Page() {
  const acctAddr = myCookies.getAccountId().toString();
  const ownerId = myCookies.getOwnerId();
  const email = myCookies.getEmail(); // || "abc@def.com";
  const current_net = currentNet();
  return (
    <Private
      ownerId={ownerId}
      chainId={current_net.id}
      verifyingContract={acctAddr}
      email={email}
      currentNet={current_net}
    ></Private>
  );
}
