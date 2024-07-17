import { cookies } from "next/headers";
import { keccak256, toHex } from "viem";
import popularAddr from "../dashboard/privateinfo/lib/popularAddr";
import redirectTo from "./redirectTo";
import { getOwnerId } from "../dashboard/privateinfo/lib/keyTools";
import { queryAccount } from "./blockchain/callAdmin";

export type CookieData = {
  ownerId: string;
  email: string;
  emailDisplay: string;
  accountId: string;
  visitedChainsCode: string;
};

const DEFAULT_DATA: CookieData = {
  ownerId: "",
  email: "",
  emailDisplay: "",
  accountId: popularAddr.ZERO_ADDR,
};

const COOKIE_KEY = "w3ea_data";
const MAX_AGE = 30 * 60;

const COOKIE_KEY_CHAIN = "w3ea_data_chain";

function getChainCode() {
  let cname = _parseString(cookies().get(COOKIE_KEY_CHAIN));
  return cname;
}

function setChainCode(chainName: string) {
  cookies().set(COOKIE_KEY_CHAIN, chainName);
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
  if (md.visitedChainsCode != getChainCode()) {
    // current AccountId is invalid
    // const ownerId = md.ownerId;
    // const accountId = await queryAccount(ownerId);
    // md.accountId = accountId;
  }
  return md;
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
  }
  let ownerId = getOwnerId(email);

  let md = _parseData(cookies().get(COOKIE_KEY));

  if (md.ownerId != ownerId) {
    md.ownerId = ownerId;
    md.email = email;
    md.emailDisplay = emailDisplay;
    md.accountId = popularAddr.ZERO_ADDR;
  }

  cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
  return md;
}

// set it after login success
function setAccountId(accountId: string) {
  let md = loadData();
  md.accountId = accountId;
  md.visitedChainsCode = getChainCode();
  cookies().set(COOKIE_KEY, JSON.stringify(md), { maxAge: MAX_AGE });
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
  loadData,
  setAccountId,
  getChainCode,
  setChainCode,
};
