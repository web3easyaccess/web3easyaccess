import popularAddr from "../dashboard/privateinfo/lib/popularAddr";
import { privateKeyToAccount } from "viem/accounts";
import axios from "axios";
import { Axios, AxiosResponse, AxiosError } from "axios";

import { isMorphNet, isScrollNet } from "./myChain";
import { Transaction } from "./myTypes";
import { getChainObj } from "./myChain";
import {
    getContract,
    formatEther,
    parseEther,
    encodeAbiParameters,
    encodeFunctionData,
} from "viem";

import { chainPublicClient } from "./chainQueryClient";
import { getOwnerIdLittleBrother } from "../dashboard/privateinfo/lib/keyTools";

import abis from "../serverside/blockchain/abi/abis";

const accountOnlyForRead = privateKeyToAccount(
    "0x1000000000000000000000000000000000000000000000000000000000000000"
);
// console.log("have a look. what is the address:", accountOnlyForRead.address);
/**
 */

/**
 *  Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number..
 *
 * - Docs: https://viem.sh/docs/utilities/formatUnits
 *
 * @example
 * import { formatUnits } from 'viem'
 *
 * formatUnits(420000000000n, 9)
 * // '420'
 */
export function formatUnits(value: bigint, decimals: number) {
    let display = value.toString();

    const negative = display.startsWith("-");
    if (negative) display = display.slice(1);

    display = display.padStart(decimals, "0");

    let [integer, fraction] = [
        display.slice(0, display.length - decimals),
        display.slice(display.length - decimals),
    ];
    fraction = fraction.replace(/(0+)$/, "");
    return `${negative ? "-" : ""}${integer || "0"}${
        fraction ? `.${fraction}` : ""
    }`;
}

/**
 * Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
 *
 * - Docs: https://viem.sh/docs/utilities/parseUnits
 *
 * @example
 * import { parseUnits } from 'viem'
 *
 * parseUnits('420', 9)
 * // 420000000000n
 */
export function parseUnits(value: string, decimals: number) {
    let [integer, fraction = "0"] = value.split(".");

    const negative = integer.startsWith("-");
    if (negative) integer = integer.slice(1);

    // trim leading zeros.
    fraction = fraction.replace(/(0+)$/, "");

    // round off if the fraction is larger than the number of decimals.
    if (decimals === 0) {
        if (Math.round(Number(`.${fraction}`)) === 1)
            integer = `${BigInt(integer) + 1n}`;
        fraction = "";
    } else if (fraction.length > decimals) {
        const [left, unit, right] = [
            fraction.slice(0, decimals - 1),
            fraction.slice(decimals - 1, decimals),
            fraction.slice(decimals),
        ];

        const rounded = Math.round(Number(`${unit}.${right}`));
        if (rounded > 9)
            fraction = `${BigInt(left) + BigInt(1)}0`.padStart(
                left.length + 1,
                "0"
            );
        else fraction = `${left}${rounded}`;

        if (fraction.length > decimals) {
            fraction = fraction.slice(1);
            integer = `${BigInt(integer) + 1n}`;
        }

        fraction = fraction.slice(0, decimals);
    } else {
        fraction = fraction.padEnd(decimals, "0");
    }

    return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

export async function queryAccountList(
    chainCode: string,
    factoryAddr: string,
    baseOwnerId: string
) {
    const acctList: { addr: string; created: boolean; orderNo: number }[] = [];
    // max count supported is 10.
    for (let k = 0; k < 10; k++) {
        console.log("getOwnerIdLittleBrother before:", baseOwnerId, k);
        const realOwnerId = getOwnerIdLittleBrother(baseOwnerId, k);
        console.log("getOwnerIdLittleBrother after:", realOwnerId);
        const account = await queryAccount(chainCode, factoryAddr, realOwnerId);
        console.log(realOwnerId + "'s account: " + account);
        acctList.push({
            addr: account?.accountAddr,
            created: account?.created,
            orderNo: k,
        });
        if (account?.created == false) {
            break;
        }
    }

    return acctList;
}

export async function queryAccount(
    chainCode: string,
    factoryAddr: string,
    ownerId: `0x${string}`
) {
    try {
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log(
            "factoryAddr in queryAccount:",
            chainCode,
            factoryAddr,
            ownerId
        );
        const accountAddr = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: factoryAddr,
            abi: abis.queryAccount,
            functionName: "queryAccount",
            args: [ownerId],
        });

        if (accountAddr == popularAddr.ZERO_ADDR) {
            const predictAddr = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: factoryAddr,
                abi: abis.predictAccountAddress,
                functionName: "predictAccountAddress",
                args: [ownerId],
            });
            return { accountAddr: predictAddr, created: false, passwdAddr: "" };
        } else {
            const passwdAddr = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: accountAddr,
                abi: abis.passwdAddr,
                functionName: "passwdAddr",
                args: [],
            });
            return {
                accountAddr: accountAddr,
                created: true,
                passwdAddr: passwdAddr,
            };
        }
    } catch (e) {
        console.log(
            "==================queryAccount error======================, ownerId=" +
                ownerId,
            e
        );
        throw new Error("queryAccount error!");
    }
}

export async function queryQuestionIdsEnc(
    chainCode: string,
    factoryAddr: string,
    accountAddr: string
) {
    try {
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("factoryAddr in queryAccount:", chainCode, factoryAddr);
        const questionIdsEnc = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: accountAddr,
            abi: abis.questionNos,
            functionName: "questionNos",
            args: [],
        });

        return questionIdsEnc;
    } catch (e) {
        console.log(
            "==================queryQuestionIdsEnc error======================, accountAddr=" +
                accountAddr,
            e
        );
        throw new Error("queryQuestionIdsEnc error!");
    }
}

export async function queryTokenDetail(
    chainCode: string,
    factoryAddr: string,
    tokenAddress: string,
    userAddress: string
) {
    try {
        if (
            tokenAddress == undefined ||
            tokenAddress == null ||
            tokenAddress.trim() == ""
        ) {
            return {
                tokenAddress: "",
                symbol: "Please input token address",
                name: "",
                totalSupply: "",
                myBalance: "",
                decimals: "",
            };
        }
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("factoryAddr in queryTokenDetail:", chainCode, factoryAddr);
        const symbol = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: tokenAddress as `0x${string}`,
            abi: abis.symbol,
            functionName: "symbol",
            args: [],
        });
        const name = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: tokenAddress as `0x${string}`,
            abi: abis.name,
            functionName: "name",
            args: [],
        });
        const totalSupply = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: tokenAddress as `0x${string}`,
            abi: abis.totalSupply,
            functionName: "totalSupply",
            args: [],
        });
        const myBalance = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: tokenAddress as `0x${string}`,
            abi: abis.balanceOf,
            functionName: "balanceOf",
            args: [userAddress],
        });
        const decimals = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: tokenAddress as `0x${string}`,
            abi: abis.decimals,
            functionName: "decimals",
            args: [],
        });

        const rtn = {
            tokenAddress: tokenAddress,
            symbol: symbol,
            name: name,
            totalSupply: formatUnits(totalSupply as bigint, decimals as number),
            myBalance: formatUnits(myBalance as bigint, decimals as number),
            decimals: decimals as number,
        };
        console.log("queryTokenDetail rtn:", rtn);
        return rtn;
    } catch (e) {
        console.log(
            "==================queryTokenDetail error======================, tokenAddress=" +
                tokenAddress,
            e
        );
        return {
            tokenAddress: "",
            symbol: "TokenError",
            name: "TokenError!",
            totalSupply: "-1",
            myBalance: "-1",
            decimals: "-1",
        };
    }
}

export async function queryNftDetail(
    chainCode: string,
    factoryAddr: string,
    nftAddress: string,
    userAddress: string
) {
    try {
        if (
            nftAddress == undefined ||
            nftAddress == null ||
            nftAddress.trim() == ""
        ) {
            return {
                nftAddress: "",
                symbol: "Please input NFT address",
                name: "",
                myBalance: "0",
            };
        }
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("factoryAddr in queryNftDetail:", chainCode, factoryAddr);
        let symbol;
        let name;
        try {
            symbol = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: nftAddress as `0x${string}`,
                abi: abis.symbol,
                functionName: "symbol",
                args: [],
            });
        } catch (eee1) {
            console.log("warn: query nft symbol error:", eee1);
            symbol = "-";
        }
        try {
            name = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: nftAddress as `0x${string}`,
                abi: abis.name,
                functionName: "name",
                args: [],
            });
        } catch (eee2) {
            console.log("warn: query nft name error:", eee2);
            name = "-";
        }

        const myBalance = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: nftAddress as `0x${string}`,
            abi: abis.balanceOf,
            functionName: "balanceOf",
            args: [userAddress],
        });

        const rtn = {
            nftAddress: nftAddress,
            symbol: symbol,
            name: name,
            myBalance: "" + myBalance,
        };

        console.log("queryNftDetail rtn:", rtn);
        return rtn;
    } catch (e) {
        console.log(
            "==================queryNftDetail error======================, nftAddress=" +
                nftAddress,
            e
        );
        return {
            nftAddress: "",
            symbol: "NftError",
            name: "NftError!",
            myBalance: "-1",
        };
    }
}

export async function queryNftsOwnerUri(
    chainCode: string,
    factoryAddr: string,
    nftAddress: string,
    nftId: bigint
) {
    try {
        if (
            nftAddress == undefined ||
            nftAddress == null ||
            nftAddress.trim() == ""
        ) {
            return { ownerAddr: "0x0000", tokenUri: "" };
        }
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("factoryAddr in queryNftsOwner:", chainCode, factoryAddr);

        const ownerAddr = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: nftAddress as `0x${string}`,
            abi: abis.ownerOf,
            functionName: "ownerOf",
            args: [nftId],
        });

        let tokenUri;
        try {
            tokenUri = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: nftAddress as `0x${string}`,
                abi: abis.tokenURI,
                functionName: "tokenURI",
                args: [nftId],
            });
        } catch (eee2) {
            console.log("warn: query nft uri error:", eee2);
            tokenUri = "";
        }

        console.log("queryNftsOwner rtn:", ownerAddr);
        return { ownerAddr: ownerAddr, tokenUri: tokenUri };
    } catch (e) {
        console.log(
            "==================queryNftsOwner error======================, nftAddress=" +
                nftAddress,
            e
        );
        return { ownerAddr: "0x0000", tokenUri: "" };
    }
}

export async function queryEthBalance(
    chainCode: string,
    factoryAddr: string,
    addr: string
) {
    if (addr == undefined || addr == popularAddr.ZERO_ADDR) {
        return "0.0";
    }
    // const blockNumber = await client.getBlockNumber();
    var addrWithout0x = addr;
    if (addr.substring(0, 2) == "0x" || addr.substring(0, 2) == "0X") {
        addrWithout0x = addr.substring(2);
    }
    const cpc = chainPublicClient(chainCode, factoryAddr);

    const balance = await cpc.publicClient.getBalance({
        address: `0x${addrWithout0x}`,
    });

    const balanceAsEther = formatEther(balance);
    return balanceAsEther;
}

const getW3eapAddr = async (cpc, chainCode: string, factoryAddr: string) => {
    console.log(`factoryAddr ${factoryAddr} called.`);
    const addr = await cpc.publicClient.readContract({
        account: accountOnlyForRead,
        address: factoryAddr,
        abi: abis.w3eaPoint,
        functionName: "w3eaPoint",
        args: [],
    });

    console.log(
        `++++++====factoryAddr ${factoryAddr} called.getW3eapAddr=${addr}`
    );

    return addr;
};

export async function queryW3eapBalance(
    chainCode: string,
    factoryAddr: string,
    addr: string
) {
    if (addr == undefined || addr == popularAddr.ZERO_ADDR) {
        return "0.0";
    }
    try {
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log(
            "factoryAddr in queryW3eapBalance:",
            chainCode,
            factoryAddr
        );
        const w3eapAddr = await getW3eapAddr(cpc, chainCode, factoryAddr);
        console.log("W3EAP address in queryW3eapBalance x:", w3eapAddr);
        console.log("my address in queryW3eapBalance:", addr);
        const pBalance = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: w3eapAddr,
            abi: abis.balanceOf,
            functionName: "balanceOf",
            args: [addr],
        });

        const bb = formatEther(pBalance);
        return bb;
    } catch (e) {
        console.log(
            "==================queryW3eapBalance error======================, accountAddr=" +
                addr,
            e
        );
        throw new Error("queryW3eapBalance error!");
    }
}

export async function queryfreeGasFeeAmount(
    chainCode: string,
    factoryAddr: string,
    addr: string
) {
    if (addr == undefined || addr == popularAddr.ZERO_ADDR) {
        return "0.0";
    }
    try {
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("factoryAddr:", factoryAddr);
        const w3eapBalance = await cpc.publicClient.readContract({
            account: accountOnlyForRead,
            address: addr,
            abi: abis.gasFreeAmount,
            functionName: "gasFreeAmount",
            args: [],
        });
        console.log(
            "queryfreeGasFeeAmount,gasFreeAmount,raw w3eapBalance:",
            w3eapBalance
        );
        const bb = formatEther(w3eapBalance);
        return bb;
    } catch (e) {
        console.log(
            "==================queryW3eapBalance error======================, accountAddr=" +
                addr,
            e
        );
        throw new Error("queryW3eapBalance error!");
    }
}

export async function queryAssets(
    chainCode: string,
    factoryAddr: string,
    addr: string
) {
    let tokenList = [];
    try {
        const cpc = chainPublicClient(chainCode, factoryAddr);
        // console.log("rpc:", cpc.rpcUrl);
        console.log("queryAssets factoryAddr xxxx::", factoryAddr);
        const w3eapAddr = await getW3eapAddr(cpc, chainCode, factoryAddr);
        tokenList.push(w3eapAddr);

        const ethBalance = queryEthBalance(chainCode, factoryAddr, addr);

        const myETH = {
            token_address: "",
            token_symbol: "ETH",
            balance: ethBalance,
        };

        const result = [];

        if (isMorphNet(chainCode)) {
            const w3eapIncluded = { addr: w3eapAddr, included: false };
            const res = await _queryMorphTokens(chainCode, addr, w3eapIncluded);
            console.log("result.length==000==", res.length, result.length);
            if (res.length > 0) {
                result.unshift(res);
            }
            console.log("result.length==111==", res.length, result.length);
            if (!w3eapIncluded.included) {
                tokenList = [w3eapAddr];
            } else {
                tokenList = [];
            }
        }

        for (let k = 0; k < tokenList.length; k++) {
            const tknAddr = tokenList[k];
            const symbol = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: tknAddr,
                abi: abis.symbol,
                functionName: "symbol",
                args: [],
            });

            const decimals = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: tknAddr,
                abi: abis.decimals,
                functionName: "decimals",
                args: [],
            });
            let balance = await cpc.publicClient.readContract({
                account: accountOnlyForRead,
                address: tknAddr,
                abi: abis.balanceOf,
                functionName: "balanceOf",
                args: [addr],
            });

            balance = formatEther(balance);

            if (decimals != 18) {
                balance =
                    Number(balance) * 10 ** (18 - Number(decimals.toString()));
            }

            result.push({
                token_address: tknAddr,
                token_symbol: symbol,
                balance: balance,
            });
        }

        result.unshift(myETH);
        console.log("result.length====", result.length);
        return result;
    } catch (e) {
        console.log(
            "==================queryAssets error======================, accountAddr=" +
                addr,
            e
        );
        throw new Error("queryAssets error!");
    }
}

export async function queryTransactions(
    chainCode: string,
    addr: string
): Promise<Transaction[]> {
    if (isMorphNet(chainCode)) {
        const res = await _queryMorphTransactions(chainCode, addr);
        return res;
    } else if (isScrollNet(chainCode)) {
        const res = await _queryScrollTransactions(chainCode, addr);
        return res;
    } else {
        return [];
    }
}

export const formatTimestamp = (tm: number) => {
    let tt = tm;
    if (tt < 1000000000000) {
        tt = tt * 1000;
    }
    let date = new Date(tt);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day = date.getDate();
    day = day < 10 ? "0" + day : day;
    let h = date.getHours();
    h = h < 10 ? "0" + h : h;
    let m = date.getMinutes();
    m = m < 10 ? "0" + m : m;
    let s = date.getSeconds();
    s = s < 10 ? "0" + s : s;
    return year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s;
};

async function _queryScrollTransactions(
    chainCode: string,
    addr: string
): Promise<Transaction[]> {
    const apiUrl = getChainObj(chainCode).blockExplorers.default.apiUrl;
    const normalTransactionsUrl = `${apiUrl}?module=account&action=txlist&address=${addr}&startblock=550000&endblock=99999999&page=1&offset=200&sort=asc&apikey=YourApiKeyToken`;
    const internalTransactionsUrl = `${apiUrl}?module=account&action=txlistinternal&address=${addr}&startblock=550000&endblock=99999999&page=1&offset=200&sort=asc&apikey=YourApiKeyToken`;

    const resultData: Transaction[] = [];
    try {
        console.log(
            "_queryScrollTransactions,77077,normalTransactionsUrl:",
            normalTransactionsUrl
        );
        const response: AxiosResponse = await axios.get(normalTransactionsUrl);
        response.data.result.forEach((e: any) => {
            const aRow: Transaction = {
                timestamp: formatTimestamp(e.timeStamp),
                block_number: e.blockNumber,
                result: e.isError == "0" ? "success" : "fail",
                to: e.to,
                hash: e.hash,
                gas_price: formatEther(BigInt(e.gasPrice)),
                gas_used: e.gasUsed,
                gas_limit: e.gas,
                l1_fee: 0, //
                from: e.from,
                value: formatEther(BigInt(e.value)),
            };
            resultData.push(aRow);
        });
    } catch (error) {
        console.error(
            `_queryScrollTransactions error1 url=${normalTransactionsUrl}:`,
            error.toString().indexOf("status code 404") >= 0
                ? "ERROR 404"
                : error
        );
    }

    try {
        console.log(
            "_queryScrollTransactions,77077,internalTransactionsUrl:",
            internalTransactionsUrl
        );
        const response: AxiosResponse = await axios.get(
            internalTransactionsUrl
        );
        response.data.result.forEach((e: any) => {
            const aRow: Transaction = {
                timestamp: formatTimestamp(e.timeStamp),
                block_number: e.blockNumber,
                result: e.isError == "0" ? "success" : "fail",
                to: e.to,
                hash: e.hash + "::" + "/" + "::" + "/",
                gas_price: formatEther(BigInt("0")),
                gas_used: e.gasUsed,
                gas_limit: e.gas,
                l1_fee: 0, //
                from: e.from,
                value: formatEther(BigInt(e.value)),
            };
            resultData.push(aRow);
        });
    } catch (error) {
        console.error(
            `_queryScrollTransactions error2 url=${internalTransactionsUrl}:`,
            error.toString().indexOf("status code 404") >= 0
                ? "ERROR 404"
                : error
        );
    }

    return resultData;
}

async function _queryMorphTransactions(
    chainCode: string,
    addr: string
): Promise<Transaction[]> {
    const apiUrl = getChainObj(chainCode).explorerApiUrl; // process.env.MORPH_EXPLORER_API_URL
    const url =
        apiUrl +
        "/addresses/" +
        // "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6" + //
        addr +
        "/transactions";
    console.log("query morph trans:", url);
    const url2 =
        apiUrl +
        "/addresses/" +
        // "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6" +
        addr +
        "/internal-transactions";
    const resultData: Transaction[] = [];
    try {
        const response: AxiosResponse = await axios.get(url);
        response.data.items.forEach((e: any) => {
            const aRow: Transaction = {
                timestamp: e.timestamp,
                block_number: e.block,
                result: e.status,
                to: e.to.hash,
                hash: e.hash,
                gas_price: formatEther(BigInt(e.gas_price)),
                gas_used: e.gas_used,
                gas_limit: e.gas_limit,
                l1_fee: e.l1_fee / 1e18,
                from: e.from.hash,
                value: formatEther(BigInt(e.value)),
            };
            resultData.push(aRow);
        });
    } catch (error) {
        console.error(
            `_queryMorphTransactions error url=${url}:`,
            error.toString().indexOf("status code 404") >= 0
                ? "ERROR 404"
                : error
        );
        // throw error; // Or handle the error differently
    }

    try {
        const response: AxiosResponse = await axios.get(url2);
        response.data.items.forEach((e: any) => {
            const aRow: Transaction = {
                timestamp: e.timestamp,
                block_number: e.block,
                result: e.success ? "ok" : "error",
                to: e.to == null ? "" : e.to.hash,
                hash: e.transaction_hash + "::" + e.index + "::" + e.type,

                gas_price: "0",
                gas_used: e.gas_used,
                gas_limit: e.gas_limit,
                l1_fee: 0,
                from: e.from == null ? "" : e.from.hash,
                value: formatEther(BigInt(e.value)),
            };
            resultData.push(aRow);
        });
    } catch (error) {
        console.error(
            `_queryMorphTransactions error url2=${url2}:`,
            error.toString().indexOf("status code 404") >= 0
                ? "ERROR 404"
                : error
        );
        // throw error; // Or handle the error differently
    }
    return resultData;
}

//
// XXXXXXXXXXXX ---------------------------------------------------

export async function queryQuestionIds(addr: string) {
    if (
        addr == undefined ||
        addr == null ||
        addr == popularAddr.ZERO_ADDR ||
        addr == popularAddr.ZERO_ADDRError
    ) {
        return "00";
    }
    const qids = await chainClient().publicClient.readContract({
        account: chainClient().account,
        address: addr,
        abi: abis.questionNos,
        functionName: "questionNos",
        args: [],
    });

    return qids;
}

/// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

export async function queryLatestBlockNumber() {
    const blockNumber = await chainPublicClient().publicClient.getBlockNumber();
    return blockNumber;
}

export async function queryBlock(blockNumber: bigint) {
    const block = await chainPublicClient().publicClient.getBlock({
        blockNumber: blockNumber,
    });
    return block;
}

export async function queryAssetsXXXX(addr: string) {
    if (addr == undefined || addr == null) {
        return [];
    }
    const balance = await queryEthBalance(addr);
    const myETH = {
        token_address: "-",
        token_name: "ETH",
        token_symbol: "ETH",
        token_type: "-",
        balance: balance,
    };
    if (isMorphNet()) {
        const res = await _queryMorphTokens(addr);
        res.unshift(myETH);
        return res;
    } else {
        return [myETH];
    }
}

function formatBalance(value, decimals) {
    var x = Number(value);
    var y = 1;
    for (var k = 0; k < decimals; k++) {
        y = y * 10;
    }

    // console.log("xxxyyy:", x, y);
    return x / y;
}

async function _queryMorphTokens(
    chainCode: string,
    addr: string,
    w3eapIncluded: { addr: string; included: boolean }
) {
    const apiUrl = getChainObj(chainCode).explorerApiUrl;
    const url =
        apiUrl +
        "/addresses/" +
        // "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6" + //
        addr +
        "/token-balances";
    console.log("_queryMorphTokens, query morph trans:", url);

    const resultData: {
        token_address: any;
        // token_decimals: any;
        token_name: any;
        token_symbol: any;
        token_type: any;
        balance: any;
    }[] = [];
    try {
        const response: AxiosResponse = await axios.get(url);
        response.data.forEach((e) => {
            const aRow = {
                token_address: e.token.address,
                token_name: e.token.name,
                token_symbol: e.token.symbol,
                token_type: e.token.type,
                balance: formatBalance(e.value, e.token.decimals), // BigInt(e.value) / BigInt(e.token.decimals),
            };
            if (w3eapIncluded.addr == e.token.address) {
                w3eapIncluded.included = true;
            }
            resultData.push(aRow);
        });
    } catch (error) {
        console.error(
            "_queryMorphTokens error:url=" + url,
            error.toString().indexOf("status code 404") >= 0
                ? "ERROR 404"
                : error
        );
        // throw error; // Or handle the error differently
    }
    return resultData;
}
