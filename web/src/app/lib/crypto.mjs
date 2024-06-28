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

function test1() {
  const msg = "010203aa!bbccd#*def";
  const passwd = "aabbccpass!";
  const enc = aesEncrypt(msg, passwd);
  console.log("encode:", enc);
  console.log("decode:", aesDecrypt(enc, passwd));
}

// test1();
