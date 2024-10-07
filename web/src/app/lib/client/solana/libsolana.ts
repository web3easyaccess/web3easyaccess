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

import { getServerSidePubKeyBase58, serverSideSign } from "../../../lib/server/solana/libsolanaserver";
import { getChainObj } from "../../myChain";

interface AnchorWallet {
    publicKey: web3.PublicKey;
    signTransaction<T extends web3.Transaction | web3.VersionedTransaction>(
        transaction: T
    ): Promise<T>;
    signAllTransactions<T extends web3.Transaction | web3.VersionedTransaction>(
        transactions: T[]
    ): Promise<T[]>;
}

export const isSolana = (chainCode) => {
    if (chainCode.toString().indexOf("SOLANA") >= 0) {
        return true;
    } else {
        return false;
    }
};

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
    const chainObj = getChainObj(chainCode);
    const apiUrl = chainObj.rpcUrls.default.http[0];
    console.log("solana connection,apiUrl:", apiUrl);
    const connection = new web3.Connection(
        apiUrl, // web3.clusterApiUrl("devnet"),
        "confirmed"
    );
    return connection;
};

export async function queryQuestionIdsEnc(
    chainCode: string,
    factoryAddr: string,
    acctPubKeyBase58: string
) {
    const { program, connection, passwdKeypair } = initFactoryProgram(
        chainCodeFromString(chainCode),
        null
    );
    const pda = new web3.PublicKey(acctPubKeyBase58);
    const nos = (await program.account.acctEntity.fetch(pda)).questionNos;
    console.log("solana,queryQuestionIdsEnc:", nos);
    return nos;
}

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

const genPda = (chainCode: ChainCode, factoryAddr: string, ownerId: String) => {
    console.log("solana genPda,ownerId:", ownerId);
    console.log("solana genPda,ownerId2:", hexToBytes(ownerId));

    const [acctPDA, acctBump] = web3.PublicKey.findProgramAddressSync(
        [
            hexToBytes(ownerId),
            //anchor.utils.bytes.utf8.encode("AAZZ1199AAZZ1199AAZZ1199AAZZ1199"),
            // provider.wallet.publicKey.toBuffer(),
        ],
        new web3.PublicKey(factoryAddr)
    );
    return acctPDA;
};

export const queryAccount = async (
    chainCode: ChainCode,
    factoryAddr: string,
    ownerId: String
) => {
    const acctPDA = genPda(chainCode, factoryAddr, ownerId);
    console.log("solana,queryAccount,ownerId:", ownerId);
    console.log("solana,queryAccount2:", acctPDA.toBase58());

    let created = false;
    const accountInfo = await getConnection(chainCode)?.getAccountInfo(acctPDA);
    if (accountInfo != null && accountInfo != undefined) {
        if (
            accountInfo.data != null &&
            accountInfo.data != undefined &&
            accountInfo.data.length > 0
        )
            created = true;
    }
    let passwdAddr = "";
    if (created) {
        const { program, connection, passwdKeypair } = initFactoryProgram(
            chainCodeFromString(chainCode),
            null
        );
        console.log("xxxyyyzzz,acctPDA:", acctPDA.toString(), accountInfo);
        passwdAddr = (await program.account.acctEntity.fetch(acctPDA))
            .passwdAddr;
        console.log("xxxyyy:addr:", passwdAddr);
    }

    return {
        accountAddr: acctPDA.toBase58(),
        created: created,
        passwdAddr: passwdAddr,
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
        transferFeeInLamports,
        null
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
    console.log("solana,createTransaction_onClient:", chainCode, ownerId, data);
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
        transferFeeInLamports,
        null
    );
}



export async function changePasswdAddr_onClient(
    chainCode: string,
    bigBrotherOwnerId: `0x${string}`,
    bigBrotherAccountAddr: `0x${string}`,
    passwdAddr: `0x${string}`,
    newPasswdAddr: `0x${string}`,
    newQuestionNos: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    privateInfo: PrivateInfoType, // old private info.
    newPrivateInfo: PrivateInfoType // new info
) {
    console.log(
        "solana,changePasswdAddr_onClient:",
        chainCode,
        bigBrotherOwnerId,
        newQuestionNos
    );

    const transferFeeInLamports = detectEstimatedFee / BigInt(1e9);
    return funCreateSolTrans(
        "CHGPASSWD",
        chainCode,
        bigBrotherOwnerId,
        "",
        newQuestionNos,
        "",
        BigInt(0), //
        onlyQueryFee,
        privateInfo,
        transferFeeInLamports,
        newPrivateInfo
    );
}


async function testAirDrop(conn: web3.Connection) {
    return;
    const pubk = await getServerSidePubKeyBase58();
    console.log(
        "airdrop,serverSidePayer:",
        pubk
    );
    let airdropSignature = await conn.requestAirdrop(
        new web3.PublicKey(pubk),
        1 * web3.LAMPORTS_PER_SOL
    );
    await conn.confirmTransaction({
        signature: airdropSignature,
    });
}

async function funCreateSolTrans(
    transType: "NEW" | "TRANSFER" | "CHGPASSWD",
    chainCode: string,
    ownerId: `0x${string}`, // bigBrotherOwnerId for chg passwd
    fromAcctAddr: string,
    questionNos: string, // new questions for chg passwd
    to: string,
    amountInLamports: bigint,
    onlyQueryFee: boolean,
    privateInfo: PrivateInfoType,
    transferFeeInLamports: bigint,
    newPrivateInfo: PrivateInfoType // used in change password.
) {
    try {
        const myChainCode = chainCodeFromString(chainCode);

        const tmpRes = initFactoryProgram(myChainCode, newPrivateInfo);
        const newPasswdKeypair = tmpRes.passwdKeypair;

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

        const factoryAddr = program.programId.toBase58();
        const acctPDA = genPda(myChainCode, factoryAddr, ownerId);

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

        const serverSidePubKey = new web3.PublicKey(await getServerSidePubKeyBase58());

        const createMethodsBuilder = () => {
            const bigBrotherOwnerId =
                ownerId.substring(0, ownerId.length - 4) + "0000";
            const bigBrotherAcctPDA = genPda(
                myChainCode,
                factoryAddr,
                bigBrotherOwnerId
            );

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
                        questionNos,
                        new anchor.BN(amountInLamports),
                        new anchor.BN(transferFeeInLamports)
                    )
                    .accounts({
                        payerAcct: serverSidePubKey,
                        userPasswdAcct: passwdKeypair.publicKey,
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
                        payerAcct: serverSidePubKey, // passwdKeypair.publicKey,
                        userPasswdAcct: passwdKeypair.publicKey,
                        userAcct: acctPDA,
                        toAccount: toAccount,
                        bigBrotherAcct: bigBrotherAcctPDA,
                        SystemProgram: web3.SystemProgram,
                    });
            } else if (transType == "CHGPASSWD") {
                build = program.methods
                    .changeAcctPasswdAddr(
                        Buffer.from(hexToBytes(ownerId)),
                        questionNos,
                        new anchor.BN(transferFeeInLamports)
                    )
                    .accounts({
                        payerAcct: serverSidePubKey, // passwdKeypair.publicKey,
                        userPasswdAcct: passwdKeypair.publicKey,
                        newPasswdAcct: newPasswdKeypair.publicKey,
                        userAcct: acctPDA,
                        bigBrotherAcct: bigBrotherAcctPDA,
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
        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = serverSidePubKey;
        transaction.partialSign(passwdKeypair);
        if (transType == "CHGPASSWD") {
            transaction.partialSign(newPasswdKeypair);
        }

        console.log("+++++++++++++++++++++==6b,");
        const serializedTx = transaction.serialize({
            requireAllSignatures: false,
        });
        console.log("+++++++++++++++++++++==6c,");
        const serializedTxJson = JSON.stringify(serializedTx);
        console.log("+++++++++++++++++++++==6d,");
        // on backend:
        const stxJson = await serverSideSign(serializedTxJson);

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
            const priorityFeeRate = 1; // 0.00000000002 * web3.LAMPORTS_PER_SOL;

            // 计算优先级费用
            const priorityFee = computeUnitsUsed * priorityFeeRate;

            // 计算总费用
            const totalFee = 5000 + priorityFee; // 5000 为基本费用

            const realEstimatedFee = totalFee / web3.LAMPORTS_PER_SOL;

            // 预计交易费用: 0.007887 SOL @ 15:04
            console.log("solana预计交易费用2:", realEstimatedFee, "SOL");
            console.log("solana computeUnitsUsed:", computeUnitsUsed);
            let cuu = computeUnitsUsed;
            if (cuu == 0 || cuu == undefined || cuu == null) {
                console.log("solana computeUnitsUsed, new :", cuu);
                cuu = 77777;
            }
            const gasPrice_e18 =
                ((1e18 / web3.LAMPORTS_PER_SOL) * totalFee) / cuu; // 外层按照evm里精度18的套路使用.
            const res = {
                success: true,
                msg: "",
                realEstimatedFee: BigInt(Math.trunc(realEstimatedFee * 1e18)),
                l1DataFee: 0,
                maxFeePerGas: undefined, //eip-1559
                gasPrice: Math.trunc(gasPrice_e18), // Legacy
                gasCount: cuu,
                tx: "",
            };
            return res;
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
        const msgArr = ("" + e).split("\n");
        return { success: false, msg: msgArr[0] + " " + msgArr[1], tx: "" };
    }
}

const initFactoryProgram = (
    chainCode: ChainCode,
    privateInfo: PrivateInfoType | null
) => {
    if (privateInfo == null || privateInfo == undefined) {
        // only for reading
        privateInfo = {
            email: "aaa",
            pin: "aaa",
            question1answer: "aaa",
            question2answer: "aaa",
            firstQuestionNo: "1",
            secondQuestionNo: "1",
            confirmedSecondary: true,
        };
    }

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
