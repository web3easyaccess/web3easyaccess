"use server";

import popularAddr from "../../dashboard/privateinfo/lib/popularAddr";

import axios from "axios";
import { Axios, AxiosResponse, AxiosError } from "axios";

import { isMorphNet } from "../../lib/myChain";
import {
  getContract,
  formatEther,
  parseEther,
  encodeAbiParameters,
  encodeFunctionData,
} from "viem";

import { chainClient } from "./chainWriteClient";

import abis from "./abi/abis";

export async function queryLatestBlockNumber() {
  const blockNumber = await chainClient().publicClient.getBlockNumber();
  return blockNumber;
}

export async function queryBlock(blockNumber: bigint) {
  const block = await chainClient().publicClient.getBlock({
    blockNumber: blockNumber,
  });
  return block;
}

export async function queryEthBalance(addr: string) {
  if (addr == undefined || addr == popularAddr.ZERO_ADDR) {
    return "0.0";
  }
  // const blockNumber = await client.getBlockNumber();
  var addrWithout0x = addr;
  if (addr.substring(0, 2) == "0x" || addr.substring(0, 2) == "0X") {
    addrWithout0x = addr.substring(2);
  }
  const balance = await chainClient().publicClient.getBalance({
    address: `0x${addrWithout0x}`,
  });
  const balanceAsEther = formatEther(balance);
  return balanceAsEther;
}

export async function queryTransactions(addr: string) {
  if (isMorphNet()) {
    return _queryMorphTransactions(addr);
  } else {
    return [];
  }
}

export async function queryAssets(addr: string) {
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

async function _queryMorphTransactions(addr: string) {
  const url =
    process.env.MORPH_EXPLORER_API_URL +
    "/addresses/" +
    // "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6" + //
    addr +
    "/transactions";
  console.log("query morph trans:", url);
  const url2 =
    process.env.MORPH_EXPLORER_API_URL +
    "/addresses/" +
    // "0x3d078713797d3a9B39a95681538A1A535C3Cd6f6" +
    addr +
    "/internal-transactions";
  const resultData: {
    timestamp: any;
    block_number: any;
    result: any;
    to: any;
    hash: any;
    gas_price: any;
    gas_used: any;
    gas_limit: any;
    l1_fee: any;
    from: any;
    value: any;
  }[] = [];
  try {
    const response: AxiosResponse = await axios.get(url);
    response.data.items.forEach((e) => {
      const aRow = {
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
      error.toString().indexOf("status code 404") >= 0 ? "ERROR 404" : error
    );
    // throw error; // Or handle the error differently
  }

  try {
    const response: AxiosResponse = await axios.get(url2);
    response.data.items.forEach((e) => {
      const aRow = {
        timestamp: e.timestamp,
        block_number: e.block,
        result: e.success ? "ok" : "error",
        to: e.to == null ? "" : e.to.hash,
        hash: e.transaction_hash + "::" + e.index + "::" + e.type,

        gas_price: 0,
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
      error.toString().indexOf("status code 404") >= 0 ? "ERROR 404" : error
    );
    // throw error; // Or handle the error differently
  }
  return resultData;
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

async function _queryMorphTokens(addr: string) {
  const url =
    process.env.MORPH_EXPLORER_API_URL +
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
      resultData.push(aRow);
    });
  } catch (error) {
    console.error(
      "_queryMorphTokens error:url=" + url,
      error.toString().indexOf("status code 404") >= 0 ? "ERROR 404" : error
    );
    // throw error; // Or handle the error differently
  }
  return resultData;
}
