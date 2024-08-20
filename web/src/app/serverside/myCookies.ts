import { cookies } from "next/headers";
import { keccak256, toHex } from "viem";
import popularAddr from "../dashboard/privateinfo/lib/popularAddr";
import redirectTo from "./redirectTo";
import { getOwnerIdBigBrother } from "../dashboard/privateinfo/lib/keyTools";
import { v4 as uuidv4 } from "uuid";
import { ChainCode } from "../lib/myTypes";
import { getChainObj } from "../lib/myChain";

export type CookieData = {
    ownerId: string;
    email: string;
    emailDisplay: string;
    selectedOrderNo: number;
    selectedAccountAddr: string;
    passId: string;
};

const DEFAULT_DATA: CookieData = {
    ownerId: "",
    email: "",
    emailDisplay: "",
    selectedOrderNo: 0,
    selectedAccountAddr: "",
    passId: "",
};

const COOKIE_KEY = "w3ea_data";
const MAX_AGE = 3600 * 12;

const COOKIE_KEY_CHAIN = "w3ea_data_chain";
const COOKIE_KEY_CHAIN_ID = "w3ea_data_chain_id";

function getChainCode() {
    const cname = _parseString(cookies().get(COOKIE_KEY_CHAIN));
    return cname;
}

function getChainId() {
    const chainId = _parseString(cookies().get(COOKIE_KEY_CHAIN_ID));
    return parseInt(chainId);
}

function setChainCode(chainName: string) {
    const chainId = "" + getChainObj(chainName).id;
    cookies().set(COOKIE_KEY_CHAIN, chainName, { maxAge: MAX_AGE });
    cookies().set(COOKIE_KEY_CHAIN_ID, chainId, { maxAge: MAX_AGE });
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
    // Cookies set directly on the browser are invalid
    // passIdMap 有问题，不会保存先前设置的值，这里不能用，先直接返回
    console.log("passId get:", md.email, md.passId, passIdMap.size);
    if (md.passId == passIdMap.get(md.ownerId)) {
        return md;
    } else {
        if (md.email != "") {
            console.warn("passId invalid:", md.email, md.passId);
        }
        return DEFAULT_DATA;
    }
}

function clearData() {
    cookies().delete(COOKIE_KEY);
    // cookies().delete(COOKIE_KEY_CHAIN);
}

function flushSelectedOrderNo(sNo: number, selectedAccountAddr: string) {
    let md = loadData();
    md.selectedOrderNo = sNo;
    md.selectedAccountAddr = selectedAccountAddr;
    cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
}
//
const passIdMap = new Map();
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
    md.passId = uuidv4();
    passIdMap.set(md.ownerId, md.passId);
    console.log("passId set:", md.email, md.passId);

    cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
    return md;
}

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
    flushData,
    flushSelectedOrderNo,
    clearData,
    loadData,
    getChainCode,
    setChainCode,
};
