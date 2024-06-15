import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

export const walletClient = (currentNet) => {
  return createWalletClient({
    chain: currentNet,
    transport: http(currentNet.rpcUrls.default.http[0]),
  });
};
