
-- typeorm

create table t_acct_index(
    acct_address varchar(42),
    block_number bigint,
    tran_order int,
    tran_hash varchar(66) -- When tran_hash is set to 0, block_number represents the start block number
);

create index t_acct_index_i01 on t_acct_index(acct_address, block_number, tran_order);
create index t_acct_index_i02 on t_acct_index(tran_hash, acct_address);



create table t_sync_address_list(
    address varchar(42),
    current_block_number bigint,
    sync_time timestamp
);

create table t_address_trans(
address varchar(42),
token_address varchar(42),  -- it indicates eth, when the token_address equal 0xffffffffffffffffffffffffffffffffffffffff 
nft_address varchar(42),
nft_id bigint,
symbol varchar(40),
value bigint,
decimal_val bigint,
opposite_addr varchar(42),
block_number bigint,
block_timestamp bigint,
tran_hash varchar(66)
);

create index t_address_trans01 on t_address_trans(address);

