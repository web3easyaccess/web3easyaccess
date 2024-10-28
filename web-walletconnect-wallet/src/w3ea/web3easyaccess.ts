
import EIP155Lib from '@/lib/EIP155Lib';
import { W3eaWallet } from './W3eaWallet';
import { getReceiverData, getW3eaWallet, setW3eaWallet } from './channelInWc';




const testMnemonic = "elegant pyramid concert absurd grant price chimney expire jar car erase account artwork saddle tank enlist figure swamp oxygen coach evil urge genuine animal"
const testPrivate = () => {
    // it's test address's password account
    // w3ea password address: = 0x3D2bF7dFac80D6A6ec192AF63E61F1b86B3C99D7
    const xxxWallet = EIP155Lib.init({ mnemonic: testMnemonic })
    console.log("test password address:", xxxWallet.getAddress());
    return xxxWallet.getPrivateKey();
}


export const getChainKey = () => {
    if (getReceiverData().chainKey == "") {
        loadW3eaWallet();
    }
    return getReceiverData().chainKey;
}

export const getW3eaAddress = () => {
    if (getReceiverData().address == "") {
        loadW3eaWallet();
    }
    return getReceiverData().address;
}



/**
 * Get wallet for the address in params
 */
export const loadW3eaWallet = () => {
    // implementation as EIP155WalletUtil.getWallet

    // todo : send parent to get address. waiting server sent. and received

    if (getReceiverData().address == "") {
        getReceiverData().address = "";
        console.log("error,address havn't received!");
    } else {
        console.log("loadW3eaWallet, receiverData.address: ", getReceiverData().address);
    }
    if (getW3eaWallet() == null || getW3eaWallet() == undefined || getW3eaWallet().getAddress() != getReceiverData().address || getW3eaWallet().getAddress() == "") {
        // EIP155Lib.init({ mnemonic: w3eatest })
        setW3eaWallet(new W3eaWallet(getReceiverData().address, testPrivate()));
    }

    console.log("w3ea account address:", getW3eaWallet().getAddress());
    return {
        w3eaWallet: getW3eaWallet(),
        w3eaAddress: getW3eaWallet().getAddress()
    }

}

