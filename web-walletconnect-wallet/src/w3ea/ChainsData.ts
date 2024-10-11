
import { EIP155_CHAINS } from "@/data/EIP155Data"

import { receiverData } from "./web3easyaccess";

export type W3eaChain = {
    chainKey: string
    chainId: number
    name: string
    logo: string
    rgb: string
    rpc: string
    namespace: string
    smartAccountEnabled?: boolean
}

export const getChain = () => {
    let row;

    const ccc = EIP155_CHAINS['eip155:1'] as W3eaChain;
    ccc.chainKey = 'eip155:1';


    if (receiverData == null || receiverData == undefined || receiverData.chainKey == "" || receiverData.chainKey == undefined) {
        return ccc
    }
    if (receiverData.chainKey.startsWith("eip155:")) {
        row = Object.entries(EIP155_CHAINS).filter(a => a[0] == receiverData.chainKey);
    }
    if (row == null || row == undefined || row.length == 0) {
        console.log("warn:not supported current!,chainKey:" + receiverData.chainKey);
        return ccc
    }
    const c = row[0][1] as W3eaChain;
    c.chainKey = receiverData.chainKey;
    return c;
}
