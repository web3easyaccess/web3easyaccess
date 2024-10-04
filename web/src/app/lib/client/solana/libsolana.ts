// import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { ChainCode, chainCodeFromString } from "../../myTypes";

import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, setProvider, Program, Idl } from "@coral-xyz/anchor";
// import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import idl from "./idl/easyaccess.json";
import type { Easyaccess } from "./types/easyaccess";

import { getMnemonic, getPasswdAccount, PrivateInfoType } from "../keyTools";

interface AnchorWallet {
    publicKey: web3.PublicKey;
    signTransaction<T extends web3.Transaction | web3.VersionedTransaction>(
        transaction: T
    ): Promise<T>;
    signAllTransactions<T extends web3.Transaction | web3.VersionedTransaction>(
        transactions: T[]
    ): Promise<T[]>;
}

const getFactorProgramId = (chainCode: ChainCode) => {
    return new web3.PublicKey("BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD");
};

const connDevnet = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
);
const connMainnet = new web3.Connection(
    web3.clusterApiUrl("mainnet-beta"),
    "confirmed"
);

const getConnection = (chainCode: ChainCode) => {
    if (chainCode == ChainCode.SOLANA_TEST_CHAIN) {
        const connLocal = new web3.Connection(
            "http://127.0.0.1:8899", // web3.clusterApiUrl("devnet"),
            "confirmed"
        );
        return connLocal;
    }

    return connDevnet;
};

export const privateInfoToKeypair = (privateInfo: PrivateInfoType) => {
    const mnemonic = getMnemonic(privateInfo);
    // const mnemonic =
    //     "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";

    // arguments: (mnemonic, password)
    const seed = bip39.mnemonicToSeedSync(mnemonic, "");
    const keypair = web3.Keypair.fromSeed(seed.slice(0, 32));

    // console.log(`${keypair.publicKey.toBase58()}`);
    // output: 5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG
    return keypair;
};

const genPda = (chainCode: ChainCode, ownerId: String) => {
    const [acctPDA, acctBump] = web3.PublicKey.findProgramAddressSync(
        [
            anchor.utils.bytes.utf8.encode(ownerId.toString()),
            // provider.wallet.publicKey.toBuffer(),
        ],
        getFactorProgramId(chainCode)
    );
    return acctPDA;
};

export const queryAccount = (chainCode: ChainCode, ownerId: String) => {
    const acctPDA = genPda(chainCode, ownerId);
    console.log("solana,queryAccount,ownerId:", ownerId);
    console.log("solana,queryAccount2:", acctPDA.toBase58());
    console.log("solana,queryAccount3:", acctPDA.toString());
    return acctPDA.toBase58();
};

export const querySolBalance = async (
    chainCode: ChainCode,
    pubKeyBase58: String
) => {
    const lamports = await getConnection(chainCode)?.getBalance(
        new web3.PublicKey(pubKeyBase58)
    );
    return lamports == undefined ? 0 : lamports / web3.LAMPORTS_PER_SOL;
};

export async function newAccountAndTransferSol_onClient(
    chainCode: string,
    ownerId: string,
    privateInfo: PrivateInfoType,
    questionNos: string,
    to: `0x${string}`,
    amount: BigInt,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint
) {
    console.log(
        "newAccountAndTransferSol_onClient:",
        chainCode,
        ownerId,
        privateInfo,
        questionNos
    );

    const myChainCode = chainCodeFromString(chainCode);
    console.log("1111111:7777a:");
    // passwdAccount:
    const passwdKeypair = privateInfoToKeypair(privateInfo);
    console.log("1111111:7777b:");

    const signer: web3.Signer = {
        publicKey: passwdKeypair.publicKey,
        secretKey: passwdKeypair.secretKey,
    };

    console.log("1111111:6666666a:signer:", signer.publicKey.toBase58());
    const wallet: AnchorWallet = {
        publicKey: passwdKeypair.publicKey,
        signTransaction: async (
            tx: web3.Transaction | web3.VersionedTransaction
        ) => {
            console.log("before sign,tx:", tx);
            tx.sign(signer);
            console.log("after  sign,tx:", tx);
            return tx;
        },
        signAllTransactions: async (
            transactions: web3.Transaction[] | web3.VersionedTransaction[]
        ) => {
            transactions.forEach((tx) => {
                tx.sign([signer]);
            });
            return transactions;
        },
    };
    console.log("1111111:6666666b:");
    const provider = new AnchorProvider(getConnection(myChainCode), wallet, {
        commitment: "confirmed",
    });
    console.log("1111111:6666666c:");
    setProvider(provider);

    console.log("1111111:provider:", provider);

    const program = new Program(idl as Idl) as Program<Easyaccess>;

    console.log("1111111:program:", program);

    // we can also explicitly mention the provider
    // const program = new Program(idl as Idl, provider) as Program<CounterProgram>;

    const acctPDA = genPda(myChainCode, ownerId);

    console.log("1111111:acctPDA:", acctPDA);

    await program.methods
        .createAcct(ownerId, passwdKeypair.publicKey.toBase58(), questionNos)
        .accounts({
            payerAcct: passwdKeypair.publicKey,
            userAcct: acctPDA,
            SystemProgram: web3.SystemProgram,
        })
        // .signers([signer])
        .rpc();

    console.log("1111111:createAcct:", acctPDA);

    const addrOnChain = (await program.account.acctEntity.fetch(acctPDA))
        .passwdAddr;
    console.log("newAccountAndTransferSol,passwdAddr on chain:", addrOnChain);
}
