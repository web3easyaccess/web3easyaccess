import { cookies } from "next/headers";
import { keccak256, toHex } from "viem";
import popularAddr from "../blockchain/client/popularAddr";

export type CookieData = {
  emailKey: string;
  emailDisplay: string;
  accountId: string;
};

const COOKIE_KEY = "w3ea_data";
const MAX_AGE = 30 * 60;

// email in cookie must be dead in short time.
const COOKIE_EMAIL_KEY = "email_in_minute";
const MAX_AGE_EMAIL = 180;

function cookieIsValid() {
  let md = _parseData(cookies().get(COOKIE_KEY));
  if (
    md != null &&
    md != undefined &&
    md.emailKey != null &&
    md.emailKey != undefined
  ) {
    return true;
  } else {
    return false;
  }
}

function getEmail() {
  let email = _parseEmail(cookies().get(COOKIE_EMAIL_KEY));
  return email;
}

function setEmail(email: string) {
  cookies().set(COOKIE_EMAIL_KEY, email, { maxAge: MAX_AGE_EMAIL });
}

function loadData() {
  let md = _parseData(cookies().get(COOKIE_KEY));
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
  let emailKey = keccak256(toHex(email)).toString();
  emailKey = keccak256(toHex(email + emailKey)).toString();

  let md = _parseData(cookies().get(COOKIE_KEY));

  if (md.emailKey != emailKey) {
    md.emailKey = emailKey;
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
    return {};
  }
}

function _parseEmail(c) {
  if (
    c != undefined &&
    c?.value != undefined &&
    c?.value != null &&
    c?.value!.trim() != ""
  ) {
    return c.value;
  } else {
    return null;
  }
}

export default {
  cookieIsValid,
  flushData,
  loadData,
  setAccountId,
  getEmail,
  setEmail,
};
