import { redirect } from "next/navigation";

import myCookies from "./myCookies";
import { CookieData } from "./myCookies";

function urlDashboard() {
    let redirectPath = "/";
    try {
        if (myCookies.cookieIsValid()) {
            console.log("redirect to dashboard");
            redirectPath = "/dashboard";
        } else {
            console.log("redirect to login");
            redirectPath = "/login";
        }
    } catch (error) {
        redirectPath = "/";
    } finally {
        redirect(redirectPath);
    }
}

function urlPrivateinfo() {
    redirect("/dashboard/privateinfo");
}

function urlLogin() {
    redirect("/login");
}

function urlError() {
    redirect("/error");
}

function urlLoggedInCheck() {
    const email = myCookies.getEmail(); // || "abc@def.com";

    if (email == "" || email == undefined || email == null) {
        console.log("urlLoggedInCheck2, redirect to login");
        redirect("/login");
    }
}

function urlLoggedInCheckChain() {
    const cc = myCookies.getChainCode();
    if (!cc || cc === undefined || cc == "") {
        console.log("urlLoggedInCheckChain, no chainCode, redirect to login");
        redirect("/login");
    }
}

export default {
    urlDashboard,
    urlPrivateinfo,
    urlLogin,
    urlLoggedInCheck,
    urlError,
    urlLoggedInCheckChain,
};
