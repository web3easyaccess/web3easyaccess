// users.js
import sql from "./db.js";

import {
  queryBlock,
  queryLatestBlockNumber,
  queryTransactions,
} from "../../blockchain/server/callAdmin.js";

import { AddressTrans } from "../types.js";

/**
 * call this function when account was created.
 * @param address
 * @param blockNumber
 */
export async function insertSyncList(address, blockNumber) {
  await sql`
    insert into t_sync_address_list(
        address ,
        current_block_number 
    ) values (${address}, ${blockNumber})
  `;
}

/*
    
*/
async function _insertTransactions(trans: AddressTrans[]) {
  await sql`
    insert into t_address_trans(
        address,
        token_address,
        nft_address,
        nft_id,
        symbol,
        value,
        decimal_val,
        opposite_addr,
        block_number,
        block_timestamp ,
        tran_hash
        )
    ${sql(trans)}
      `;
}

export async function doSync() {
  const bn = await sql`
        select min(current_block_number) block_number from t_sync_address_list
    `;
  const startBlockNumber = bn[0].block_number + 1;

  const endBlockNumber = await queryLatestBlockNumber();
  for (var k = startBlockNumber; k <= endBlockNumber; k++) {
    const blk = await queryBlock(k);
    blk.transactions.forEach(async (tx) => {
      const txInfo = await queryTransactions(tx);
    });
  }
}

export async function getMaxBlockNumber(acctAddress) {
  const res = await sql`
    select
    max(block_number) block_number
    from t_acct_index
    where acct_address = ${acctAddress}
  `;
  return res[0].block_number;
}
