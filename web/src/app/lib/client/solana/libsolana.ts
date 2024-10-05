"use client";

// import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { ChainCode, chainCodeFromString } from "../../myTypes";
import { hexToBytes } from "viem";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, setProvider, Program, Idl } from "@coral-xyz/anchor";
// import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import idl from "./idl/easyaccess.json";
import type { Easyaccess } from "./types/easyaccess";

import { getMnemonic, getPasswdAccount, PrivateInfoType } from "../keyTools";

import { serverSign } from "../../../lib/server/solana/libsolanaserver";

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
    console.log("solana genPda,ownerId:", ownerId);
    console.log("solana genPda,ownerId2:", hexToBytes(ownerId));

    const [acctPDA, acctBump] = web3.PublicKey.findProgramAddressSync(
        [
            hexToBytes(ownerId),
            //anchor.utils.bytes.utf8.encode("AAZZ1199AAZZ1199AAZZ1199AAZZ1199"),
            // provider.wallet.publicKey.toBuffer(),
        ],
        getFactorProgramId(chainCode)
    );
    return acctPDA;
};

export const queryAccount = async (chainCode: ChainCode, ownerId: String) => {
    const acctPDA = genPda(chainCode, ownerId);
    console.log("solana,queryAccount,ownerId:", ownerId);
    console.log("solana,queryAccount2:", acctPDA.toBase58());
    const balance = await querySolBalance(chainCode, acctPDA.toBase58());
    return {
        accountAddr: acctPDA.toBase58(),
        created: balance > 0,
        passwdAddr: balance > 0 ? "" : "", // todo ....
    };
};

export const querySolBalance = async (
    chainCode: ChainCode,
    pubKeyBase58: String
) => {
    console.log("querySolBalance,pubKeyBase58:", pubKeyBase58);
    const lamports = await getConnection(chainCode)?.getBalance(
        new web3.PublicKey(pubKeyBase58)
    );
    return lamports == undefined ? 0 : lamports / web3.LAMPORTS_PER_SOL;
};

export async function queryAssets(
    chainCode: ChainCode,
    factoryAddr: string,
    pubKeyBase58: string
) {
    console.log("solana queryAssets:pubKeyBase58:", pubKeyBase58);
    const solBalance = await querySolBalance(chainCode, pubKeyBase58);

    return [
        {
            token_address: "",
            token_symbol: "SOL",
            balance: solBalance,
        },
    ];
}

export async function newAccountAndTransferSol_onClient(
    chainCode: string,
    ownerId: `0x${string}`,
    questionNos: string,
    to: `0x${string}`,
    amountInEthWei: bigint,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    bridgeDirection: string,
    privateInfo: PrivateInfoType
) {
    console.log(
        "solana,newAccountAndTransferSol_onClient:",
        chainCode,
        ownerId,
        privateInfo,
        questionNos,
        data
    );
    if (data != null && data != undefined && data.length > 0) {
        throw new Error("not supported data this time, in solana.1.");
    }
    const amountInLamports = amountInEthWei / BigInt(1e9);
    const transferFeeInLamports = detectEstimatedFee / BigInt(1e9);
    return funCreateSolTrans(
        "NEW",
        chainCode,
        ownerId,
        "",
        questionNos,
        to,
        amountInLamports, //
        onlyQueryFee,
        privateInfo,
        transferFeeInLamports
    );
}

export async function createTransaction_onClient(
    chainCode: string,
    ownerId: `0x${string}`,
    accountAddr: `0x${string}`,
    to: `0x${string}`,
    amountInEthWei: bigint,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    bridgeDirection: string,
    privateInfo: PrivateInfoType
) {
    console.log(
        "solana,createTransaction_onClient:",
        chainCode,
        ownerId,
        privateInfo,
        data
    );
    if (data != null && data != undefined && data.length > 0) {
        throw new Error("not supported data this time, in solana.2.");
    }
    const amountInLamports = amountInEthWei / BigInt(1e9);
    const transferFeeInLamports = detectEstimatedFee / BigInt(1e9);
    return funCreateSolTrans(
        "TRANSFER",
        chainCode,
        ownerId,
        accountAddr,
        "",
        to,
        amountInLamports, //
        onlyQueryFee,
        privateInfo,
        transferFeeInLamports
    );
}

const sk = new Uint8Array([
    60, 250, 107, 73, 217, 201, 24, 127, 203, 159, 113, 171, 188, 219, 157, 223,
    161, 149, 219, 249, 159, 53, 221, 151, 101, 54, 116, 251, 73, 56, 164, 243,
    36, 221, 126, 195, 209, 70, 2, 147, 162, 125, 62, 144, 152, 161, 125, 167,
    170, 100, 111, 220, 209, 234, 129, 22, 212, 241, 47, 135, 97, 73, 149, 15,
]);

async function funCreateSolTrans_old(
    transType: "NEW" | "TRANSFER",
    chainCode: string,
    ownerId: `0x${string}`,
    fromAcctAddr: string,
    questionNos: string,
    to: string,
    amountInLamports: bigint,
    onlyQueryFee: boolean,
    privateInfo: PrivateInfoType,
    transferFeeInLamports: bigint
) {
    try {
        const myChainCode = chainCodeFromString(chainCode);
        const { program, connection, passwdKeypair } = initFactoryProgram(
            myChainCode,
            privateInfo
        );

        console.log(
            "funCreateSolTrans,",
            transType,
            "transferFeeInLamports:",
            transferFeeInLamports
        );

        const passwdAddrBalance = await querySolBalance(
            myChainCode,
            passwdKeypair.publicKey.toBase58()
        );
        // 适用于开发或测试环境... todo ... 上线主网的话，当前策略需要修改.
        if (myChainCode == ChainCode.SOLANA_TEST_CHAIN) {
            console.log(
                "passwdKeypair.publicKey & balance:",
                passwdKeypair.publicKey.toBase58(),
                passwdAddrBalance
            );
            if (passwdAddrBalance < 0.1) {
                let airdropSignature = await connection.requestAirdrop(
                    passwdKeypair.publicKey,
                    0.1 * web3.LAMPORTS_PER_SOL
                );
                await connection.confirmTransaction({
                    signature: airdropSignature,
                });
            }
            console.log(
                "passwdKeypair.publicKey & balance2:",
                passwdKeypair.publicKey.toBase58(),
                await querySolBalance(
                    myChainCode,
                    passwdKeypair.publicKey.toBase58()
                )
            );
        }

        const acctPDA = genPda(myChainCode, ownerId);

        console.log("11111xx:transType:", transType);
        console.log("11111yy:acctPDA:", acctPDA.toBase58(), questionNos);

        if (transType == "NEW") {
            const accountInfo = await connection.getAccountInfo(acctPDA);
            if (accountInfo != null && accountInfo != undefined) {
                if (
                    accountInfo.data != null &&
                    accountInfo.data != undefined &&
                    accountInfo.data.length > 0
                )
                    throw new Error(
                        `user account[${acctPDA.toBase58()}] has already created!`
                    );
            }
        }

        let xxxPayer;

        {
            xxxPayer = web3.Keypair.fromSecretKey(sk);
            console.log("xxxPayer:", xxxPayer.publicKey.toBase58());
            let airdropSignature = await connection.requestAirdrop(
                xxxPayer.publicKey,
                10 * web3.LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction({
                signature: airdropSignature,
            });
        }

        const createMethodsBuilder = () => {
            let toAccount: web3.PublicKey;
            if (to == undefined || to == null || to == "") {
                toAccount = new web3.PublicKey(acctPDA);
                amountInLamports = BigInt(0);
            } else {
                toAccount = new web3.PublicKey(to);
            }
            let build;
            if (transType == "NEW") {
                build = program.methods
                    .createAcct(
                        Buffer.from(hexToBytes(ownerId)),
                        passwdKeypair.publicKey.toBase58(),
                        questionNos,
                        new anchor.BN(amountInLamports),
                        new anchor.BN(transferFeeInLamports)
                    )
                    .accounts({
                        payerAcct: passwdKeypair.publicKey,
                        userAcct: acctPDA,
                        toAccount: toAccount,
                        SystemProgram: web3.SystemProgram,
                    });
            } else if (transType == "TRANSFER") {
                if (fromAcctAddr != acctPDA.toBase58()) {
                    console.log(
                        `sol transfer, accountAddr error.fromAcctAddr=${fromAcctAddr}, !=:: ownerId=${ownerId}, thePda=${acctPDA}`
                    );
                    throw new Error("accountAddr error!");
                }
                build = program.methods
                    .transferAcctLamports(
                        Buffer.from(hexToBytes(ownerId)),
                        new anchor.BN(amountInLamports),
                        new anchor.BN(transferFeeInLamports)
                    )
                    .accounts({
                        payerAcct: xxxPayer.publicKey, // passwdKeypair.publicKey,
                        userPasswdAcct: passwdKeypair.publicKey,
                        userAcct: acctPDA,
                        toAccount: toAccount,
                        SystemProgram: web3.SystemProgram,
                    });
            } else {
                throw new Error("transType ERROR:", transType);
            }

            return build;
        };

        if (onlyQueryFee) {
            const trans = await createMethodsBuilder().transaction();

            if (1 == 1) {
                //
                const transaction = trans;
                // const wireTransaction = transaction.serialize();

                // send wireTransaction to backend to be signed
                // on backend:
                const latestBlockhash = await connection.getLatestBlockhash();
                transaction.lastValidBlockHeight =
                    latestBlockhash.lastValidBlockHeight;
                transaction.recentBlockhash = latestBlockhash.blockhash;
                transaction.feePayer = xxxPayer.publicKey;
                transaction.partialSign(xxxPayer);
                transaction.partialSign(passwdKeypair);
                const wireTransactionToSendBack = transaction.serialize();

                // send back wireTransactionToSendBack to frontend to be signed by user
                // back on frontend:
                transaction.partialSign(passwdKeypair); // or use a wallet adapter, most likely
                const finalWireTransaction = transaction.serialize();
                const signature = await connection.sendRawTransaction(
                    finalWireTransaction
                );
                console.log("xxxx off chain signature:", signature);
            }

            trans.feePayer = passwdKeypair.publicKey;
            const simTx = await connection.simulateTransaction(trans);

            // 获取计算单元消耗
            const computeUnitsUsed = simTx.value.unitsConsumed;

            // 设置优先级费用率（例如，每个计算单元 0.000001 SOL）
            const priorityFeeRate = 0.000001 * web3.LAMPORTS_PER_SOL;

            // 计算优先级费用
            const priorityFee = computeUnitsUsed * priorityFeeRate;

            // 计算总费用
            const totalFee = 5000 + priorityFee; // 5000 为基本费用

            const realEstimatedFee = totalFee / web3.LAMPORTS_PER_SOL;

            // 预计交易费用: 0.007887 SOL @ 15:04
            console.log("solana预计交易费用:", realEstimatedFee, "SOL");
            const gasPrice_e18 =
                ((1e18 / web3.LAMPORTS_PER_SOL) * totalFee) / computeUnitsUsed; // 外层按照evm里精度18的套路使用.
            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                l1DataFee: 0,
                maxFeePerGas: undefined, //eip-1559
                gasPrice: Math.trunc(gasPrice_e18), // Legacy
                gasCount: computeUnitsUsed,
                tx: "",
            };
        } else {
            const hash = await createMethodsBuilder()
                // .signers([signer])
                .rpc();
            console.log("solana new acct ,hash:", hash);
            console.log(
                "passwdKeypair.publicKey & balance3:",
                passwdKeypair.publicKey.toBase58(),
                await querySolBalance(
                    myChainCode,
                    passwdKeypair.publicKey.toBase58()
                )
            );
            return { success: true, tx: hash, msg: "" };
        }
    } catch (e) {
        console.log("newAccountAndTransferSol error:", e);
        return { success: false, msg: e.transactionMessage, tx: "" };
    }
}

const serverSidePayer = web3.Keypair.fromSecretKey(sk);
async function testAirDrop(conn: web3.Connection) {
    console.log(
        "airdrop,serverSidePayer:",
        serverSidePayer.publicKey.toBase58()
    );
    let airdropSignature = await conn.requestAirdrop(
        serverSidePayer.publicKey,
        1 * web3.LAMPORTS_PER_SOL
    );
    await conn.confirmTransaction({
        signature: airdropSignature,
    });
}

async function funCreateSolTrans(
    transType: "NEW" | "TRANSFER",
    chainCode: string,
    ownerId: `0x${string}`,
    fromAcctAddr: string,
    questionNos: string,
    to: string,
    amountInLamports: bigint,
    onlyQueryFee: boolean,
    privateInfo: PrivateInfoType,
    transferFeeInLamports: bigint
) {
    try {
        const myChainCode = chainCodeFromString(chainCode);
        const { program, connection, passwdKeypair } = initFactoryProgram(
            myChainCode,
            privateInfo
        );

        console.log(
            "funCreateSolTrans,",
            transType,
            "transferFeeInLamports:",
            transferFeeInLamports
        );

        await testAirDrop(connection);

        const acctPDA = genPda(myChainCode, ownerId);

        console.log(
            "11111yy:transType & acctPDA & questionNos:",
            transType,
            acctPDA.toBase58(),
            questionNos
        );

        if (transType == "NEW") {
            const accountInfo = await connection.getAccountInfo(acctPDA);
            if (accountInfo != null && accountInfo != undefined) {
                if (
                    accountInfo.data != null &&
                    accountInfo.data != undefined &&
                    accountInfo.data.length > 0
                )
                    throw new Error(
                        `user account[${acctPDA.toBase58()}] has already created!`
                    );
            }
        }

        const createMethodsBuilder = () => {
            let toAccount: web3.PublicKey;
            if (to == undefined || to == null || to == "") {
                toAccount = new web3.PublicKey(acctPDA);
                amountInLamports = BigInt(0);
            } else {
                toAccount = new web3.PublicKey(to);
            }
            let build;
            if (transType == "NEW") {
                build = program.methods
                    .createAcct(
                        Buffer.from(hexToBytes(ownerId)),
                        passwdKeypair.publicKey.toBase58(),
                        questionNos,
                        new anchor.BN(amountInLamports),
                        new anchor.BN(transferFeeInLamports)
                    )
                    .accounts({
                        payerAcct: serverSidePayer.publicKey,
                        userAcct: acctPDA,
                        toAccount: toAccount,
                        SystemProgram: web3.SystemProgram,
                    });
            } else if (transType == "TRANSFER") {
                if (fromAcctAddr != acctPDA.toBase58()) {
                    console.log(
                        `sol transfer, accountAddr error.fromAcctAddr=${fromAcctAddr}, !=:: ownerId=${ownerId}, thePda=${acctPDA}`
                    );
                    throw new Error("accountAddr error!");
                }
                //
                build = program.methods
                    .transferAcctLamports(
                        Buffer.from(hexToBytes(ownerId)),
                        new anchor.BN(amountInLamports),
                        new anchor.BN(transferFeeInLamports)
                    )
                    .accounts({
                        payerAcct: serverSidePayer.publicKey, // passwdKeypair.publicKey,
                        userPasswdAcct: passwdKeypair.publicKey,
                        userAcct: acctPDA,
                        toAccount: toAccount,
                        SystemProgram: web3.SystemProgram,
                    });
            } else {
                throw new Error("transType ERROR:", transType);
            }

            return build;
        };

        const transaction = await createMethodsBuilder().transaction();

        // const wireTransaction = transaction.serialize();

        // send wireTransaction to backend to be signed
        console.log("+++++++++++++++++++++==1,");
        // on frontend:
        const latestBlockhash = await connection.getLatestBlockhash();
        console.log("+++++++++++++++++++++==3,");
        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
        console.log("+++++++++++++++++++++==4,");
        transaction.recentBlockhash = latestBlockhash.blockhash;
        console.log("+++++++++++++++++++++==5,");
        transaction.feePayer = serverSidePayer.publicKey;
        console.log("+++++++++++++++++++++==6,");
        if (transType != "NEW") {
            transaction.partialSign(passwdKeypair);
        }

        console.log("+++++++++++++++++++++==6b,");
        const serializedTx = transaction.serialize({
            requireAllSignatures: false,
        });
        console.log("+++++++++++++++++++++==6c,");
        const serializedTxJson = JSON.stringify(serializedTx);
        console.log("+++++++++++++++++++++==6d,");
        // on backend:
        const stxJson = await serverSign(serializedTxJson);
        // transaction.partialSign(serverSidePayer);
        console.log("+++++++++++++++++++++==7,");

        const signedSerializedTx: Buffer = JSON.parse(stxJson);
        console.log("+++++++++++++++++++++==7b,");
        let recoveredTransaction = web3.Transaction.from(
            Buffer.from(signedSerializedTx)
        );

        if (onlyQueryFee) {
            let simTx;

            // trans.feePayer = passwdKeypair.publicKey;
            simTx = await connection.simulateTransaction(recoveredTransaction);

            // 获取计算单元消耗
            const computeUnitsUsed = simTx.value.unitsConsumed;

            // 设置优先级费用率（例如，每个计算单元 0.000001 SOL）
            const priorityFeeRate = 0.000001 * web3.LAMPORTS_PER_SOL;

            // 计算优先级费用
            const priorityFee = computeUnitsUsed * priorityFeeRate;

            // 计算总费用
            const totalFee = 5000 + priorityFee; // 5000 为基本费用

            const realEstimatedFee = totalFee / web3.LAMPORTS_PER_SOL;

            // 预计交易费用: 0.007887 SOL @ 15:04
            console.log("solana预计交易费用2:", realEstimatedFee, "SOL");
            const gasPrice_e18 =
                ((1e18 / web3.LAMPORTS_PER_SOL) * totalFee) / computeUnitsUsed; // 外层按照evm里精度18的套路使用.
            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                l1DataFee: 0,
                maxFeePerGas: undefined, //eip-1559
                gasPrice: Math.trunc(gasPrice_e18), // Legacy
                gasCount: computeUnitsUsed,
                tx: "",
            };
        } else {
            // send transaction
            const finalransaction = recoveredTransaction.serialize();
            const signature = await connection.sendRawTransaction(
                finalransaction
            );
            console.log("xxxx 22 off chain signature:", signature);

            // const hash = await createMethodsBuilder()
            //     // .signers([signer])
            //     .rpc();
            // console.log("solana new acct ,hash:", hash);
            // console.log(
            //     "passwdKeypair.publicKey & balance3:",
            //     passwdKeypair.publicKey.toBase58(),
            //     await querySolBalance(
            //         myChainCode,
            //         passwdKeypair.publicKey.toBase58()
            //     )
            // );
            return { success: true, tx: signature, msg: "" };
            // https://explorer.solana.com/tx/hy2VE7yWJVc7SBBjPi4PALj3qCD3GQYLCcnkAEEy5LrSUKdB9ZsA7b1MRV2o329SBrD2frGvRrjzLXqZPxMwQvu?cluster=custom
        }
    } catch (e) {
        console.log("newAccountAndTransferSol error:", e);
        return { success: false, msg: e.transactionMessage, tx: "" };
    }
}

const initFactoryProgram = (
    chainCode: ChainCode,
    privateInfo: PrivateInfoType
) => {
    const myChainCode = chainCode;
    console.log("1111111:7777a:");
    // passwdAccount:
    const passwdKeypair = privateInfoToKeypair(privateInfo);
    console.log(
        "1111111:passwdKeypair.publicKey:",
        passwdKeypair.publicKey.toBase58()
    );

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

    const connection = getConnection(myChainCode);

    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });
    console.log("1111111:6666666c:");
    setProvider(provider);

    console.log("1111111:provider:", provider);

    const program = new Program(idl as Idl) as Program<Easyaccess>;

    console.log("1111111:program:", program.programId.toBase58());

    return {
        program: program,
        connection: connection,
        passwdKeypair: passwdKeypair,
    };
};
