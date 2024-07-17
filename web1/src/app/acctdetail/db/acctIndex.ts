// users.js
import sql from "./db.js";

import { AcctIndex } from "../types.js";

export async function getTransactionHashs(acctAddress) {
  const trans = await sql`
    select
    tran_hash
    from t_acct_index
    where acct_address = ${acctAddress}
    order by block_number desc, tran_order desc
  `;
  // users = Result [{ hash: "Walter" }, { hash: 'Murray' }, ...]
  return trans;
}

/*
    insert the first row when account created.
*/
export async function initTransactions(acctAddress, blockNumber, tranHash) {
  await sql`
  insert into t_acct_index(acct_address,block_number,tran_hash)
  values(${acctAddress}, ${blockNumber}, ${tranHash})
    `;
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

export async function insertTransactions(aiArr: AcctIndex[]) {
  await sql`
  insert into t_acct_index(acct_address,block_number,tran_order,tran_hash)
  ${sql(aiArr)}
    `;
}
