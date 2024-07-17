import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { createWalletClient, custom } from "viem";

import { getChainObj } from "./myChain";

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export function chainPublicClient(chainCode, factoryAddr) {
    const chainObj = getChainObj(chainCode);

    const currentRpcUrl = chainObj.rpcUrls.default.http[0]; //process.env.RPC_URL;
    if (typeof currentRpcUrl === "undefined" || currentRpcUrl === undefined) {
        throw new Error("RpcUrl NOT DEFINED!");
    }

    return {
        factoryAddr: `0x${factoryAddr.substring(2)}`,
        publicClient: createPublicClient({
            batch: {
                multicall: true,
            },
            chain: chainObj,
            transport: http(currentRpcUrl),
        }),
        walletClient: createWalletClient({
            chain: chainObj,
            transport: http(currentRpcUrl),
        }),
        rpcUrl: currentRpcUrl,
    };
}
