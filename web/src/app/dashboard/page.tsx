"use server";

import myCookies from "../serverside/myCookies";

import redirectTo from "../serverside/redirectTo";

import PageClient from "./pageClient";

export default async function Page() {
    redirectTo.urlLoggedInCheck();

    const email = myCookies.getEmail();

    console.log("dashboard server,email:", email);
    return <PageClient email={email}></PageClient>;
}
