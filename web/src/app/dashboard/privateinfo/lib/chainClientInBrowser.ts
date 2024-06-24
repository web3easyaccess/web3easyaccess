import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

export const walletClient = (getChainObj) => {
  return createWalletClient({
    chain: getChainObj,
    transport: http(getChainObj.rpcUrls.default.http[0]),
  });
};
