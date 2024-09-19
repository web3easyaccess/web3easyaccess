"use server";

import myCookies from "../serverside/myCookies";

import Dashboard from "./dashboard";

import redirectTo from "../serverside/redirectTo";
import { queryAccount } from "../lib/chainQuery";
import { useState } from "react";

import { Menu, UserInfo, uiToString } from "../lib/myTypes";

import PageClient from "./pageClient";

export default async function Page() {
    redirectTo.urlLoggedInCheck();

    const email = myCookies.getEmail();

    console.log("dashboard server,email:", email);
    return <PageClient email={email}></PageClient>;
}
