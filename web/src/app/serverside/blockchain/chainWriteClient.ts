import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

import { chainPublicClient } from "../../lib/chainQueryClient";
import myCookies from "../myCookies";

export function getFactoryAddr(chainCode: string) {
    console.log("getFactoryAddr, chainCode:", chainCode);
    if (chainCode == "DEFAULT_ANVIL_CHAIN") {
        return process.env.CHAIN_FACTORY_ADDRESS_LOCAL;
    } else if (chainCode == "MORPH_TEST_CHAIN") {
        return process.env.CHAIN_FACTORY_ADDRESS_MORPH_TEST;
    } else if (chainCode == "SCROLL_TEST_CHAIN") {
        return process.env.CHAIN_FACTORY_ADDRESS_SCROLL_TEST;
    } else {
        var a = 1 / 0;
    }
}

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export function chainClient() {
    const chainCode = myCookies.getChainCode();
    const myClient = chainPublicClient(chainCode, getFactoryAddr(chainCode));

    let _freeFeeAmountWhenCreated = 0;
    let _currentPrivateKey = undefined;
    if (chainCode == "DEFAULT_ANVIL_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_LOCAL
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_LOCAL;
    } else if (chainCode == "MORPH_TEST_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_MORPH_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_MORPH_TEST;
    } else if (chainCode == "SCROLL_TEST_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_SCROLL_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_SCROLL_TEST;
    } else {
        var a = 1 / 0;
    }
    console.log(
        `_currentPrivateKey:len:${
            _currentPrivateKey?.length
        },p2:${_currentPrivateKey?.substring(0, 2)}`
    );
    let account = null;
    if (
        typeof _currentPrivateKey === "undefined" ||
        _currentPrivateKey === undefined
    ) {
        var a = 1 / 0;
    } else {
        account = privateKeyToAccount(`0x${_currentPrivateKey.substring(2)}`);
    }
    //   myClient.account = account;
    //   myClient.freeFeeWhen1stCreated = _freeFeeAmountWhenCreated;
    //   return myClient;
    return {
        ...myClient,
        account: account,
        freeFeeWhen1stCreated: _freeFeeAmountWhenCreated,
    };
}
