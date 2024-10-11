
import EIP155Lib from '@/lib/EIP155Lib';
import { W3eaWallet } from './W3eaWallet';

export let w3eaWallet: W3eaWallet; // EIP155Lib;

export let receiverData = { address: "", chainKey: "" }


const testMnemonic = "elegant pyramid concert absurd grant price chimney expire jar car erase account artwork saddle tank enlist figure swamp oxygen coach evil urge genuine animal"
const testPrivate = () => {
    // it's test address's password account
    // w3ea password address: = 0x3D2bF7dFac80D6A6ec192AF63E61F1b86B3C99D7
    const xxxWallet = EIP155Lib.init({ mnemonic: testMnemonic })
    console.log("test password address:", xxxWallet.getAddress());
    return xxxWallet.getPrivateKey();
}


export const getChainKey = () => {
    if (receiverData.chainKey == "") {
        loadW3eaWallet();
    }
    return "eip155:11155111";
    // return receiverData.chainKey;
}

export const getW3eaAddress = () => {
    if (receiverData.address == "") {
        loadW3eaWallet();
    }
    return receiverData.address;
}



/**
 * Get wallet for the address in params
 */
export const loadW3eaWallet = () => {
    // implementation as EIP155WalletUtil.getWallet

    // todo : send parent to get address. waiting server sent. and received

    if (receiverData.address == "") {
        receiverData.address = "0x6fFE2E68855a59A76c781708AF2914a796239af7";
        console.log("error,address havn't received!");
    }
    if (w3eaWallet == null || w3eaWallet == undefined || w3eaWallet.getAddress() != receiverData.address) {
        // EIP155Lib.init({ mnemonic: w3eatest })
        w3eaWallet = new W3eaWallet(receiverData.address, testPrivate());
    }

    console.log("w3ea account address:", w3eaWallet.getAddress());
    return {
        w3eaWallet: w3eaWallet,
        w3eaAddress: w3eaWallet.getAddress()
    }

}

