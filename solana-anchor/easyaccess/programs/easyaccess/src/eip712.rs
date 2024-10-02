use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::keccak;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct EIP712Domain {
    // ... 域名信息
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct MyMessage {
    // ... 消息数据
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, PartialEq)]
pub struct EIP712 {
    types: BTreeMap<String, Vec<Type>>,
    domain: EIP712Domain,
    primaryType: String,
    message: MyMessage,
}

fn hash_struct(types: &BTreeMap<String, Vec<Type>>, primaryType: &str, struct_data: &[u8]) -> Vec<u8> {
    // ... 实现哈希计算逻辑
}
