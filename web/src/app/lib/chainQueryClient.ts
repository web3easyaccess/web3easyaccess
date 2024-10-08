import { createPublicClient, http } from "viem";

import { createWalletClient, custom } from "viem";

import { getChainObj } from "./myChain";

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export function chainPublicClient(chainCode, factoryAddr) {
    const chainObj = getChainObj(chainCode);
    if (factoryAddr == undefined || factoryAddr == null || factoryAddr == "") {
        throw new Error("factory environment is not set.chainCode=", chainCode);
    }
    // const currentRpcUrl = chainObj.rpcUrls.default.http[0]; //process.env.RPC_URL;
    // if (typeof currentRpcUrl === "undefined" || currentRpcUrl === undefined) {
    //     throw new Error("RpcUrl NOT DEFINED!");
    // }
    if (chainCode.toString().indexOf("SOLANA") >= 0) {
        return {};
    }

    return {
        factoryAddr: `0x${factoryAddr.substring(2)}`,
        publicClient: createPublicClient({
            batch: {
                multicall: true,
            },
            chain: chainObj,
            transport: http(),
        }),
        walletClient: createWalletClient({
            chain: chainObj,
            transport: http(),
        }),
        // rpcUrl: currentRpcUrl,
    };
}
