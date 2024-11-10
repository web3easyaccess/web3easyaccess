import { createPublicClient, http } from "viem";

import { createWalletClient, custom } from "viem";

import { publicActionsL2 } from 'viem/op-stack'

import { getChainObj } from "./myChain";
import { ChainCode } from "./myTypes";

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

    let pClient = createPublicClient({
        batch: {
            multicall: true,
        },
        chain: chainObj,
        transport: http(),
    });

    let wClient = createWalletClient({
        chain: chainObj,
        transport: http(),
    });

    if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN ||
        chainCode == ChainCode.OPTIMISM_TEST_CHAIN ||
        chainCode == ChainCode.UNICHAIN_MAIN_CHAIN ||
        chainCode == ChainCode.UNICHAIN_TEST_CHAIN) {
        pClient = pClient.extend(publicActionsL2());
        wClient = wClient.extend(publicActionsL2());
    }

    return {
        factoryAddr: `0x${factoryAddr.substring(2)}`,
        publicClient: pClient,
        walletClient: wClient,
        // rpcUrl: currentRpcUrl,
    };
}
