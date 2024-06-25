import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

import { getChainObj } from "./myChain";

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export function chainClient() {
  const chainObj = getChainObj();

  const currentRpcUrl = chainObj.rpcUrls.default.http[0]; //process.env.RPC_URL;
  if (typeof currentRpcUrl === "undefined" || currentRpcUrl === undefined) {
    throw new Error("RpcUrl NOT DEFINED!");
  }

  let _adminAddr = undefined;
  let _currentPrivateKey = undefined;
  if (chainObj.chainCode == "DEFAULT_ANVIL_CHAIN") {
    _adminAddr = process.env.CHAIN_ADMIN_ADDRESS_LOCAL;
    _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_LOCAL;
  } else if (chainObj.chainCode == "MORPH_TEST_CHAIN") {
    _adminAddr = process.env.CHAIN_ADMIN_ADDRESS_MORPH_TEST;
    _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_MORPH_TEST;
  } else {
    _adminAddr = "0xNO_CHAIN_CODE";
    console.warn("NOT SELECT CHAIN CODE.");
  }
  if (typeof _adminAddr === "undefined" || _adminAddr === undefined) {
    throw new Error("CHAIN_ADMIN_ADDRESS_.. NOT DEFINED in .env!");
  }

  let account = null;
  if (
    typeof _currentPrivateKey === "undefined" ||
    _currentPrivateKey === undefined
  ) {
  } else {
    account = privateKeyToAccount(`0x${_currentPrivateKey.substring(2)}`);
  }

  return {
    account: account,
    adminAddr: `0x${_adminAddr.substring(2)}`,
    publicClient: createPublicClient({
      batch: {
        multicall: true,
      },
      chain: getChainObj(),
      transport: http(currentRpcUrl),
    }),
    walletClient: createWalletClient({
      chain: getChainObj(),
      transport: http(currentRpcUrl),
    }),
  };
}
