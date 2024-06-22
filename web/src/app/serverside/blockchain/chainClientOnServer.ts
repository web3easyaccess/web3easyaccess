import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

import { currentNet } from "./myChain";

export const currentRpcUrl = currentNet().rpcUrls.default.http[0]; //process.env.RPC_URL;
if (typeof currentRpcUrl === "undefined" || currentRpcUrl === undefined) {
  throw new Error("RpcUrl NOT DEFINED!");
}

const _adminAddr = process.env.CHAIN_ADMIN_ADDRESS;
if (typeof _adminAddr === "undefined" || _adminAddr === undefined) {
  //throw new Error("administratorAddress NOT DEFINEDx!");
}

const currentPrivateKey = process.env.CHAIN_PRIVATE_KEY;
if (
  typeof currentPrivateKey === "undefined" ||
  currentPrivateKey === undefined
) {
  //throw new Error("PrivateKey NOT DEFINED!");
}

//////////////////

/////////////////

export const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: currentNet(),
  transport: http(currentRpcUrl),
});

export const walletClient = createWalletClient({
  chain: currentNet(),
  transport: http(currentRpcUrl),
});

export const account = privateKeyToAccount(
  `0x${currentPrivateKey.substring(2)}`
);

export const adminAddr: `0x${string}` = `0x${_adminAddr.substring(2)}`;
