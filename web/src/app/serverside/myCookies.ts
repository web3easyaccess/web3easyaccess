import { cookies } from "next/headers";
import { keccak256, toHex } from "viem";
import popularAddr from "../dashboard/privateinfo/lib/popularAddr";
import redirectTo from "./redirectTo";
import { getOwnerIdBigBrother } from "../dashboard/privateinfo/lib/keyTools";

import { ChainCode } from "../lib/myTypes";

export type CookieData = {
    ownerId: string;
    email: string;
    emailDisplay: string;
    selectedOrderNo: number;
};

const DEFAULT_DATA: CookieData = {
    ownerId: "",
    email: "",
    emailDisplay: "",
    selectedOrderNo: 0,
};

const COOKIE_KEY = "w3ea_data";
const MAX_AGE = 3600 * 12;

const COOKIE_KEY_CHAIN = "w3ea_data_chain";

function getChainCode() {
    let cname = _parseString(cookies().get(COOKIE_KEY_CHAIN));

    return cname;
}

function setChainCode(chainName: string) {
    cookies().set(COOKIE_KEY_CHAIN, chainName, { maxAge: MAX_AGE });
}

function cookieIsValid() {
    let md = _parseData(cookies().get(COOKIE_KEY));
    if (
        md != null &&
        md != undefined &&
        md.ownerId != null &&
        md.ownerId != undefined
    ) {
        return true;
    } else {
        return false;
    }
}

function loadData() {
    let md: CookieData = _parseData(cookies().get(COOKIE_KEY));
    return md;
}

function clearData() {
    cookies().delete(COOKIE_KEY);
    // cookies().delete(COOKIE_KEY_CHAIN);
}

function flushSelectedOrderNo(sNo: number) {
    let md = loadData();
    md.selectedOrderNo = sNo;
    cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
}
//
function flushData(email: string) {
    let idx = email.indexOf("@");
    let emailDisplay = "";
    for (let k = 0; k < email.length; k++) {
        if (k == 0 || k == idx - 1 || k == idx || k == idx + 1) {
            emailDisplay += email.substring(k, k + 1);
        } else {
            emailDisplay += "*";
        }
        emailDisplay = emailDisplay.replace("***", "**");
    }

    let ownerId = getOwnerIdBigBrother(email);

    let md = _parseData(cookies().get(COOKIE_KEY));

    if (md.ownerId != ownerId) {
        md.ownerId = ownerId;
        md.email = email;
        md.emailDisplay = emailDisplay;
    }

    cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
    return md;
}

function _parseData(c) {
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

function _parseString(c) {
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
    flushData,
    flushSelectedOrderNo,
    clearData,
    loadData,
    getChainCode,
    setChainCode,
};
