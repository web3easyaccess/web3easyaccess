
import EIP155Lib from '@/lib/EIP155Lib';
import { W3eaWallet } from './W3eaWallet';

export let wallet: W3eaWallet; // EIP155Lib;

export let receiverData = { address: "0x0000", chainCode: "" }

export const getW3eaAddresses = () => {
    return [receiverData.address];
}



const w3eatest = "elegant pyramid concert absurd grant price chimney expire jar car erase account artwork saddle tank enlist figure swamp oxygen coach evil urge genuine animal"
export function getAddress() {
    if (receiverData.address == "") {
        console.log("error,address havn't received!");
    }
    wallet = new W3eaWallet(receiverData.address, "...passwd private key..."); // EIP155Lib.init({ mnemonic: w3eatest })
    // w3ea password address: = 0x3D2bF7dFac80D6A6ec192AF63E61F1b86B3C99D7
    console.log("w3ea password address:", wallet.getAddress());
    const eip155Wallets = {
        [receiverData.address]: wallet,
    }

    const aa: string[] = getW3eaAddresses();
    return {
        eip155Wallets: eip155Wallets,
        w3eaAddresses: aa
    }
}



/**
 * Get wallet for the address in params
 */
export const getW3eaWallet = async (params: any) => {
    // implementation as EIP155WalletUtil.getWallet
    console.log("w3ea,getW3eaWallet,params:", params);
    return wallet;
}


export function getChain() {
    ;
}