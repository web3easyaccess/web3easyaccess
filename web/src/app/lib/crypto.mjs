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
    const msg = "1201.";
    const passwd = "1qazxsw2#EDC";
    const xxx = aesEncrypt(msg, passwd);
    console.log("encode:", msg);
    console.log("decode:", xxx);
}

// test1();
