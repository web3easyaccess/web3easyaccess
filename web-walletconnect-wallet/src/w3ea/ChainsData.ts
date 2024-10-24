
import { EIP155_CHAINS } from "@/data/EIP155Data"

import { loadW3eaWallet, receiverData } from "./web3easyaccess";

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

    const ccc = {
        chainKey: 'eip155:1:error',
        chainId: 1,
        name: 'ErrorEth',
        logo: '/chain-logos/eip155-1-error.png',
        rgb: '99, 125, 234',
        rpc: 'https://cloudflare-eth.com/',
        namespace: 'eip155'
    } as W3eaChain;

    if (receiverData == null || receiverData == undefined || receiverData.chainKey == "" || receiverData.chainKey == undefined) {
        loadW3eaWallet();
    }

    if (receiverData == null || receiverData == undefined || receiverData.chainKey == "" || receiverData.chainKey == undefined) {
        console.log("getChain error,receiverData is empty!");
        return ccc
    }
    if (receiverData.chainKey.startsWith("eip155:")) {
        row = Object.entries(EIP155_CHAINS).filter(a => a[0] == receiverData.chainKey);
    }
    if (row == null || row == undefined || row.length == 0) {
        console.log("getChain error:not supported current!,chainKey:" + receiverData.chainKey);
        return ccc
    }
    const c = row[0][1] as W3eaChain;
    c.chainKey = receiverData.chainKey;
    return c;
}
