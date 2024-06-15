import { cookies } from "next/headers";

// set it after login success
function setEmail(email: string) {
  let idx = email.indexOf("@");
  let sss = email;
  //   let sss = "";
  //   for (let k = 0; k < email.length; k++) {
  //     if (k == 0 || k == idx - 1 || k == idx || k == idx + 1) {
  //       sss += email.substring(k, k + 1);
  //     } else {
  //       sss += "*";
  //     }
  //   }
  cookies().set("email", sss);
}

// set it after login success
function setOwnerId(ownerId: string) {
  cookies().set("ownerId", ownerId, { maxAge: 30 * 60 });
}

// set it after login success
function setAccountId(accountId) {
  cookies().set("accountId", accountId.toString());
}

// CurrentTmp: user who is logging...
// set when it is logging...
function setCurrentTmpOwnerId(ownerId: string) {
  cookies().set("CurrentTmpOwnerId", ownerId);
}

// set when it is logging...
function setCurrentTmpAccountId(accountId) {
  cookies().set("CurrentTmpAccountId", accountId.toString());
}

function getEmail() {
  return _getCookiesVal(cookies().get("email"));
}

function getOwnerId() {
  return _getCookiesVal(cookies().get("ownerId"));
}

function getAccountId() {
  return _getCookiesVal(cookies().get("accountId"));
}

function getCurrentTmpOwnerId() {
  return _getCookiesVal(cookies().get("CurrentTmpOwnerId"));
}

function getCurrentTmpAccountId() {
  return _getCookiesVal(cookies().get("CurrentTmpAccountId"));
}

function _getCookiesVal(c) {
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

function checkLoggedIn() {
  return getOwnerId() != "";
}

export default {
  setCurrentTmpOwnerId,
  setCurrentTmpAccountId,
  setOwnerId,
  setAccountId,
  getOwnerId,
  getAccountId,
  getCurrentTmpOwnerId,
  getCurrentTmpAccountId,
  checkLoggedIn,
  setEmail,
  getEmail,
};
