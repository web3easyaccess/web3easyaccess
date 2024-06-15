import { getTransactionHashs, getMaxBlockNumber } from "./db/acctIndex";
import { Transaction, AcctIndex } from "./types";

import {
    queryAccount,
    newAccount,
  } from "../blockchain/server/callAdmin";

  import {
    queryEthBalance,
    queryLatestBlockNumber,
    queryBlock
  } from "../blockchain/server/queryAccountInfo";

export async function queryTransactions(acctAddress: string) {
  const txList = await getTransactionHashs(acctAddress);
  const result: Transaction[] = [];
  txList.forEach((e) => {
    const tx: Transaction = { tran_hash: e.tran_hash };
    result.push(tx);
  });
  return txList;
}

export async function syncTransactions(acctAddress: string) {
  const latestBlockNumber = await queryLatestBlockNumber();
  const beginBlockNumber = (await getMaxBlockNumber(acctAddress)) + 1;
  const aiArr: AcctIndex[] = [];
  for (var i = beginBlockNumber; i <= latestBlockNumber; i++) {
    const blk = await queryBlock(i);
    
    const ai:AcctIndex = {
        acct_address: '';
        block_number: i;
        tran_order: number;
        tran_hash: string;
    }
  }
}
