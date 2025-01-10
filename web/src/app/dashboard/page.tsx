"use server";

import myCookies from "../serverside/myCookies";

import redirectTo from "../serverside/redirectTo";

import PageClient from "./pageClient";

import {bootCron} from "@/app/cron/cronTask"

// import  "@/app/lib/client/generatePrivate.ignore";

export default async function Page() {
    // redirectTo.urlLoggedInCheck();
    bootCron();

    const email = myCookies.getEmail();

    console.log("dashboard server,email:", email);
    return <PageClient email={email}></PageClient>;
}
