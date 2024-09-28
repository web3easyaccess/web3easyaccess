import { cookies } from "next/headers";
import { keccak256, toHex } from "viem";
import popularAddr from "../dashboard/privateinfo/lib/popularAddr";

import { ChainCode } from "../lib/myTypes";
import { getChainObj } from "../lib/myChain";

export type CookieData = {
    email: string;
};

const DEFAULT_DATA: CookieData = {
    email: "",
};

const COOKIE_KEY = "w3ea_data";
const MAX_AGE = 3600 * 12;

const COOKIE_KEY_CHAIN = "w3ea_data_chain";
const COOKIE_KEY_CHAIN_ID = "w3ea_data_chain_id";

function cookieIsValid() {
    let md = _parseData(cookies().get(COOKIE_KEY));
    if (
        md != null &&
        md != undefined &&
        md.email != null &&
        md.email != undefined &&
        md.email != ""
    ) {
        return true;
    } else {
        return false;
    }
}

function getEmail() {
    let md: CookieData = _parseData(cookies().get(COOKIE_KEY));
    return md.email;
}

function setEmail(email: string) {
    let md: CookieData = _parseData(cookies().get(COOKIE_KEY));
    md.email = email;
    cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
}
//

function _parseData(c: any) {
    if (
        c != undefined &&
        c?.value != undefined &&
        c?.value != null &&
        c?.value!.trim() != ""
    ) {
        return JSON.parse(c.value);
    } else {
        return DEFAULT_DATA;
    }
}

function _parseString(c: any) {
    if (
        c != undefined &&
        c?.value != undefined &&
        c?.value != null &&
        c?.value!.trim() != ""
    ) {
        return c.value;
    } else {
        return "";
    }
}

export default {
    cookieIsValid,
    getEmail,
    setEmail,
};
