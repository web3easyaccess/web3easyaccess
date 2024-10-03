import { createWalletClient, http, keccak256 } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

import { entropyToMnemonic } from "@scure/bip39";

import { english, simplifiedChinese, generateMnemonic } from "viem/accounts";

const entropy = Buffer.from("1234567890ABCDEF1234567890ABCDEF");
const entropy2 = new Uint8Array([
  0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90,
  0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34,
  0x56, 0x78, 0x90, 0xab, 0xcd, 0xef,
]);

const hexString =
  "1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF";

const entropy3 = Uint8Array.from(Buffer.from(hexString, "hex"));

const backToHexString = Buffer.from(entropy3).toString("hex");

const mnemonic2 = entropyToMnemonic(entropy2, english);
const mnemonic3 = entropyToMnemonic(entropy3, english);

// const mnemonic = generateMnemonic(english, 256);

console.log(":mnemonic2:", mnemonic2);
console.log(":mnemonic3:", mnemonic3);

const account = mnemonicToAccount(
  mnemonic3, // "legal winner thank year wave sausage worth useful legal winner thank yellow",
  {
    addressIndex: 0,
  }
);

const account1 = mnemonicToAccount(
  mnemonic3, // "legal winner thank year wave sausage worth useful legal winner thank yellow",
  {
    addressIndex: 1,
  }
);
const account2 = mnemonicToAccount(
  mnemonic3, // "legal winner thank year wave sausage worth useful legal winner thank yellow",
  {
    addressIndex: 2,
  }
);

console.log("00:", account.address, account, keccak256(account.publicKey));
console.log(
  "01:",
  account1.address,
  account1.publicKey,
  keccak256(account1.publicKey)
);
console.log(
  "02:",
  account2.address,
  account2.publicKey,
  keccak256(account2.publicKey)
);

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

/*
 */
