"use server";

import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

import { chainPublicClient } from "../../lib/chainQueryClient";
import { ChainCode } from "@/app/lib/myTypes";

export async function getFactoryAddr(chainCode: string) {
    console.log("getFactoryAddr, chainCode:", chainCode);
    let res;
    if (chainCode == "DEFAULT_ANVIL_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_LOCAL;
    } else if (chainCode == "MORPH_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_MORPH_TEST;
    } else if (chainCode == "SCROLL_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_SCROLL_TEST;
    } else if (chainCode == "LINEA_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_LINEA_TEST;
    } else if (chainCode == "SEPOLIA_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_SEPOLIA;
    } else if (chainCode == ChainCode.NEOX_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_NEOX_TEST;
    } else if (chainCode == ChainCode.ARBITRUM_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_ARBITRUM_TEST;
    } else if (chainCode == ChainCode.ETHEREUM_MAIN_NET.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_ETH_MAIN;
    } else if (chainCode == "SOLANA_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_SOLANA_TEST;
    }
    if (res == undefined || res == "") {
        throw Error("FACTORY IS NOT SET!");
    }
    return res;
}

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export async function chainClient(_chainCode: string) {
    let chainCode = _chainCode;
    if (chainCode == undefined || chainCode == "" || chainCode == null) {
        let x = 1 / 0;
        // chainCode = myCookies.getChainCode();
    }
    const myClient = chainPublicClient(
        chainCode,
        await getFactoryAddr(chainCode)
    );

    let _l1GasPriceOracleContract = "0x0";
    let _l1DataFeeFunc = "";
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
        _l1GasPriceOracleContract =
            "0x778d1d9a4d8b6b9ade36d967a9ac19455ec3fd0b";
        _l1GasPriceOracleContract = ""; // morph .... comment .. todo.
        _l1DataFeeFunc = "calculateIntrinsicGasFee";
    } else if (chainCode == "SCROLL_TEST_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_SCROLL_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_SCROLL_TEST;
        _l1GasPriceOracleContract =
            "0x5300000000000000000000000000000000000002";
        _l1DataFeeFunc = "getL1Fee";
    } else if (chainCode == "LINEA_TEST_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_LINEA_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_LINEA_TEST;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == "SEPOLIA_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_SEPOLIA
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_SEPOLIA;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.NEOX_TEST_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_NEOX_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_NEOX_TEST;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.ARBITRUM_TEST_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_ARBITRUM_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_ARBITRUM_TEST;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.ETHEREUM_MAIN_NET.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_ETH_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_ETH_MAIN;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == "SOLANA_TEST_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_SOLANA_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_SOLANA_TEST;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else {
        var a = 1 / 0;
    }
    console.log(
        `_currentPrivateKey:len:${_currentPrivateKey?.length
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
        l1GasPriceOracleContract: _l1GasPriceOracleContract,
        l1DataFeeFunc: _l1DataFeeFunc,
    };
}
