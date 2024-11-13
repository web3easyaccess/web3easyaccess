"use server";

import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

import { chainPublicClient } from "../../lib/chainQueryClient";
import { ChainCode } from "@/app/lib/myTypes";
import { readChainClient, readFactoryAddr } from "@/app/chainsconf/loadenv";

export async function queryHosts() {
    let myselfHost = process.env.MYSELF_HOST;
    let walletconnectHost = process.env.WALLET_CONNECT_HOST;
    if (myselfHost == undefined || myselfHost == "") {
        console.log("warn, MYSELF_HOST not set.");
        myselfHost = "http://localhost:3000";
    }
    if (walletconnectHost == undefined || walletconnectHost == "") {
        console.log("warn, WALLET_CONNECT_HOST not set.");
        walletconnectHost = "http://localhost:3001";
    }
    return {
        myselfHost: myselfHost,
        walletconnectHost: walletconnectHost
    }
}

export async function getFactoryAddr(chainCode: string) {
    const cc = await readFactoryAddr(chainCode);
    return cc;
}

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export async function chainClient(_chainCode: string) {
    const cc = await readChainClient(_chainCode);
    return cc;
}
