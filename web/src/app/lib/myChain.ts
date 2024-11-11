import { ChainCode } from "./myTypes";

import * as co from "@/app/chainsconf/chainobjs";

export const getChainObj = (
    chainCode: ChainCode
): {
    id: number;
    name: string;
    nativeCurrency: {};
    rpcUrls: {};
    blockExplorers: {};
    contracts: {};
    testnet: boolean;
    chainCode: ChainCode;
    l1ChainCode: ChainCode;
} => {
    return co.getChainObj(chainCode);
}; // morphHoleskyTestnet;

export function isMorphNet(chainCode) {
    return co.isMorphNet(chainCode);
}

export function isScrollNet(chainCode) {
    return co.isScrollNet(chainCode);
}



