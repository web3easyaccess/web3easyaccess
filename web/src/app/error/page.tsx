"use server";

import React from "react";

import Error from "./error";
import myCookies from "../serverside/myCookies";

export default async function Home({}) {
  return (
    <>
      <Error chainCode={myCookies.getChainCode()}></Error>
    </>
  );
}
