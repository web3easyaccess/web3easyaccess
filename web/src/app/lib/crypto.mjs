// AES-256

// var CryptoJS = require("crypto-js");
import CryptoJS from "crypto-js";

export function aesEncrypt(msg, passwd) {
  return CryptoJS.AES.encrypt(msg, passwd).toString();
}

export function aesDecrypt(ciphertext, passwd) {
  var bytes = CryptoJS.AES.decrypt(ciphertext, passwd);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}

// console.log("kkkk", aesEncrypt("kkkk", "8u8u8u321%&G"));
// console.log(
//   "222:",
//   aesDecrypt(aesEncrypt("kkkk", "8u8u8u321%&G"), "8u8u8u321%&G")
// );
