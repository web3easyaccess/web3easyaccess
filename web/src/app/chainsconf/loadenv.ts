import { ChainCode } from "../lib/myTypes";
import { createPublicClient, http } from "viem";
import { sepolia, mainnet, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, custom } from "viem";

import { chainPublicClient } from "@/app/lib/chainQueryClient";


export async function readFactoryAddr(chainCode: string) {
    console.log("getFactoryAddr, chainCode:", chainCode);
    let res;
    if (chainCode == "DEFAULT_ANVIL_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_LOCAL;
    } else if (chainCode == "MORPH_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_MORPH_TEST;
    } else if (chainCode == "MORPH_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_MORPH_MAIN;
    } else if (chainCode == "SCROLL_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_SCROLL_TEST;
    } else if (chainCode == "LINEA_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_LINEA_TEST;
    } else if (chainCode == ChainCode.LINEA_CHAIN) {
        res = process.env.CHAIN_FACTORY_ADDRESS_LINEA_MAIN;
    } else if (chainCode == ChainCode.BSC_MAIN_NET) {
        res = process.env.CHAIN_FACTORY_ADDRESS_BSC_MAIN;
    } else if (chainCode == ChainCode.OPBNB_MAIN_NET) {
        res = process.env.CHAIN_FACTORY_ADDRESS_OPBNB_MAIN;
    } else if (chainCode == "SEPOLIA_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_SEPOLIA;
    } else if (chainCode == ChainCode.NEOX_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_NEOX_TEST;
    } else if (chainCode == ChainCode.ARBITRUM_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_ARBITRUM_TEST;
    } else if (chainCode == ChainCode.ETHEREUM_MAIN_NET.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_ETH_MAIN;
    } else if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_OPTIMISM_MAIN;
    } else if (chainCode == ChainCode.OPTIMISM_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_OPTIMISM_TEST;
    } else if (chainCode == ChainCode.UNICHAIN_MAIN_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_UNICHAIN_MAIN;
    } else if (chainCode == ChainCode.UNICHAIN_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_UNICHAIN_TEST;
    } else if (chainCode == ChainCode.AIACHAIN_MAIN_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_AIACHAIN_MAIN;
    } else if (chainCode == ChainCode.AIACHAIN_TEST_CHAIN.toString()) {
        res = process.env.CHAIN_FACTORY_ADDRESS_AIACHAIN_TEST;
    } else if (chainCode == "SOLANA_TEST_CHAIN") {
        res = process.env.CHAIN_FACTORY_ADDRESS_SOLANA_TEST;
    }
    if (res == undefined || res == "") {
        throw Error("FACTORY IS NOT SET!");
    }
    return res;
}

// DEFAULT_ANVIL_CHAIN, MORPH_TEST_CHAIN
export async function readChainClient(_chainCode: string) {
    let chainCode = _chainCode;
    if (chainCode == undefined || chainCode == "" || chainCode == null) {
        let x = 1 / 0;
        // chainCode = myCookies.getChainCode();
    }
    const myClient = chainPublicClient(
        chainCode,
        await readFactoryAddr(chainCode)
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
    } else if (chainCode == "MORPH_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_MORPH_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_MORPH_MAIN;
        _l1GasPriceOracleContract =
            "x3931ade842f5bb8763164bdd81e5361dce6cc1ef";
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
    } else if (chainCode == "LINEA_CHAIN") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_LINEA_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_LINEA_MAIN;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == "BSC_MAIN_NET") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_BSC_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_BSC_MAIN;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == "OPBNB_MAIN_NET") {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_OPBNB_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_OPBNB_MAIN;
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
    } else if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_OPTIMISM_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_OPTIMISM_MAIN;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.OPTIMISM_TEST_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_OPTIMISM_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_OPTIMISM_TEST;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.UNICHAIN_MAIN_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_UNICHAIN_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_UNICHAIN_MAIN;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.UNICHAIN_TEST_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_UNICHAIN_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_UNICHAIN_TEST;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.AIACHAIN_MAIN_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_AIACHAIN_MAIN
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_AIACHAIN_MAIN;
        _l1GasPriceOracleContract = "0x0";
        _l1DataFeeFunc = "";
    } else if (chainCode == ChainCode.AIACHAIN_TEST_CHAIN.toString()) {
        _freeFeeAmountWhenCreated = Number(
            process.env.INIT_FREE_FEE_AMOUNT_AIACHAIN_TEST
        );
        _currentPrivateKey = process.env.CHAIN_PRIVATE_KEY_AIACHAIN_TEST;
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
