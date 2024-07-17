export type AcctIndex = {
  acct_address: string;
  block_number: bigint;
  tran_order: number;
  tran_hash: string;
};

export type Transaction = {
  acct_address: string;
  block_number: bigint;
  tran_order: number;
  tran_hash: string;
};

export type AddressTrans = {
  address: string;
  token_address: string;
  nft_address: string;
  nft_id: bigint;
  symbol: string;
  value: bigint;
  decimal_val: bigint;
  opposite_addr: string;
  block_number: bigint;
  block_timestamp: bigint;
  tran_hash: string;
};
