import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Easyaccess } from "../target/types/easyaccess";

import { bytesToHex, hexToBytes } from "viem";

import nacl from "tweetnacl";

import {
    PublicKey, LAMPORTS_PER_SOL, SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';

import web3 from "@solana/web3.js";

import { expect } from 'chai';

const connection = new web3.Connection(
    "http://127.0.0.1:8899", // web3.clusterApiUrl("devnet"), 
    "confirmed");



const privk0 = new Uint8Array([
    147, 240, 231, 155, 4, 5, 11, 134, 204, 12, 221,
    145, 54, 157, 77, 75, 228, 6, 26, 136, 248, 6,
    81, 218, 50, 66, 117, 113, 122, 234, 95, 96, 11,
    99, 95, 213, 231, 32, 50, 238, 68, 31, 84, 150,
    13, 227, 171, 71, 192, 103, 37, 13, 112, 196, 65,
    222, 43, 221, 177, 242, 112, 101, 141, 196
]);

const privk1 = new Uint8Array([
    56, 77, 23, 179, 55, 136, 218, 145, 201, 243, 98,
    12, 80, 160, 33, 217, 170, 195, 118, 182, 160, 98,
    246, 249, 238, 13, 38, 88, 189, 53, 38, 21, 137,
    201, 28, 252, 246, 36, 193, 151, 5, 155, 173, 205,
    19, 219, 145, 24, 155, 143, 87, 189, 76, 216, 68,
    133, 138, 19, 47, 222, 91, 147, 62, 43
]);

// mTNZwZ27rbcov4LrKGcmvugvGhr3U2tGhVwGjGXznQK
const passwdAcct0 = web3.Keypair.fromSecretKey(privk0);

// AGrimcRE763rd22xYb5JiutsaFbfEPHaZh4MSEoSW2Zp
const passwdAcct1 = web3.Keypair.fromSecretKey(privk1);
console.log("passwdAcct0:", passwdAcct0.publicKey.toBase58());
console.log("passwdAcct1:", passwdAcct1.publicKey.toBase58());

const provider = anchor.AnchorProvider.env()
anchor.setProvider(provider)

// 47DkNqiKdH7XwpkNQm9u6seByzcHb1rztXYrF7Egfkbg
const payer = provider.wallet;
console.log("payer:", payer.publicKey.toBase58());

const ownerId0 = hexToBytes(
    "0x477a3efac4b9f407e6abbef158c7312585d675f688e11949c468b8d4dc560000");
const ownerId1 = hexToBytes(
    "0x477a3efac4b9f407e6abbef158c7312585d675f688e11949c468b8d4dc560001");


async function airdropTransfer(toPubkey: PublicKey, amountInSol: number) {


    let balance1 = await connection.getBalance(toPubkey);
    console.log(`${toPubkey} balance before airdrop: ${balance1}`);


    let payerXXX = web3.Keypair.generate();
    // console.log("pubkey:", payer.publicKey.toBase58());
    // // 3UuZygtJF5w61m2ApmVsAAMzbtipZDbPp83S9keKteuU

    let airdropSignature = await connection.requestAirdrop(
        payerXXX.publicKey,
        (1 + amountInSol) * web3.LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction({ signature: airdropSignature });

    // Create a transfer instruction for transferring SOL from wallet_1 to wallet_2
    const transferInstruction = SystemProgram.transfer({
        fromPubkey: payerXXX.publicKey,
        toPubkey: toPubkey,
        lamports: amountInSol * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
    });

    // Add the transfer instruction to a new transaction
    const transaction = new Transaction().add(transferInstruction);

    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    await sendAndConfirmTransaction(connection, transaction, [payerXXX]);

    let balance2 = await connection.getBalance(toPubkey);
    console.log(`${toPubkey} balance after airdrop: ${balance2}`);
}

describe("easyaccess", () => {

    // console.log("passwdAddr:xxxxxxx223:",anchor.workspace.Easyaccess );
    const program = anchor.workspace.Easyaccess as Program<Easyaccess>

    const [acctPDA0, _acctBump] = PublicKey.findProgramAddressSync(
        [
            ownerId0,
            // anchor.utils.bytes.utf8.encode(ownerId),
            // payer.publicKey.toBuffer(),
        ],
        program.programId
    )
    const [acctPDA1, _acctBump2] = PublicKey.findProgramAddressSync(
        [
            ownerId1,
            // anchor.utils.bytes.utf8.encode(ownerId),
            // payer.publicKey.toBuffer(),
        ],
        program.programId
    )

    console.log("acctPDA0 in client:", acctPDA0.toBase58());
    console.log("acctPDA1 in client:", acctPDA1.toBase58());

    it('Sets and changes passwd addr!', async () => {
        console.log("passwdAddr:xxxxxxx224a");

        // create account 0
        await airdropTransfer(acctPDA0, 3);
        const questionNos = "U2FsdGVkX1/9hml4Tf3VLEBNhUoJ5vzRZkX4UfEE2bE=";
        //  AompEk8ZGRwTmUwR41kRkSPJddsZeSsXMuGUJeRSixXt
        await program.methods.createFirstAcct(
            Buffer.from(ownerId0), questionNos,
            new BN(1 * LAMPORTS_PER_SOL), new BN(10))
            .accounts({
                payerAcct: payer.publicKey,
                userPasswdAcct: passwdAcct0.publicKey,
                userAcct: acctPDA0,
                toAccount: payer.publicKey,
            }).signers([passwdAcct0])
            .rpc()

        await new Promise(r => setTimeout(r, 100));
        console.log("passwdAddr:xxxxxxx224b,acctPDA0 in client:", acctPDA0.toBase58());
        let v1 = (await program.account.acctEntity.fetch(acctPDA0)).ownerId;
        let v2 = (await program.account.acctEntity.fetch(acctPDA0)).bigBrothrAcctAddr;
        let v3 = (await program.account.acctEntity.fetch(acctPDA0)).passwdAddr;
        let v4 = (await program.account.acctEntity.fetch(acctPDA0)).questionNos;
        let v5 = (await program.account.acctEntity.fetch(acctPDA0)).bump;
        console.log("0-ownerId:", v1);
        console.log("0-ownerId2:", bytesToHex(v1));
        console.log("0-bigBrothrAcctAddr:", v2);
        console.log("0-passwdAddr:", v3);
        console.log("0-questionNos:", v4);
        console.log("0-bump:", v5);


        // transfer from account 0 to account 1;
        let balance0 = await connection.getBalance(acctPDA0);
        let balance1 = await connection.getBalance(acctPDA1);
        console.log("balance,before transfer,0 & 1:", balance0, ",", balance1, payer.publicKey.toBase58());
        await program.methods.transferAcctLamports(
            Buffer.from(ownerId0),
            new BN(1 * LAMPORTS_PER_SOL), new BN(10))
            .accounts({
                payerAcct: payer.publicKey,
                userPasswdAcct: passwdAcct0.publicKey,
                userAcct: acctPDA0,
                toAccount: acctPDA1,
                bigBrotherAcct: acctPDA0,
            }).signers([passwdAcct0])
            .rpc();

        await new Promise(r => setTimeout(r, 100));

        balance0 = await connection.getBalance(acctPDA0);
        balance1 = await connection.getBalance(acctPDA1);
        console.log("balance,after- transfer,0 & 1:", balance0, ",", balance1);

        // create account 1
        await program.methods.createOtherAcct(
            Buffer.from(ownerId1), questionNos,
            new BN(0 * LAMPORTS_PER_SOL), new BN(10))
            .accounts({
                payerAcct: payer.publicKey,
                userPasswdAcct: passwdAcct0.publicKey,
                userAcct: acctPDA1,
                toAccount: acctPDA1,
                bigBrotherAcct: acctPDA0
            }).signers([passwdAcct0])
            .rpc()
        await new Promise(r => setTimeout(r, 800));
        console.log("passwdAddr:xxxxxxx224b,acctPDA in client3333:", acctPDA1);
        v1 = (await program.account.acctEntity.fetch(acctPDA1)).ownerId;
        v2 = (await program.account.acctEntity.fetch(acctPDA1)).bigBrothrAcctAddr;
        v3 = (await program.account.acctEntity.fetch(acctPDA1)).passwdAddr;
        v4 = (await program.account.acctEntity.fetch(acctPDA1)).questionNos;
        v5 = (await program.account.acctEntity.fetch(acctPDA1)).bump;
        console.log("1-ownerId:", v1);
        console.log("1-ownerId2:", bytesToHex(v1));
        console.log("1-bigBrothrAcctAddr:", v2);
        console.log("1-passwdAddr:", v3);
        console.log("1-questionNos:", v4);
        console.log("1-bump:", v5);


        ////


        // transfer from account 1 to account 0;
        balance0 = await connection.getBalance(acctPDA0);
        balance1 = await connection.getBalance(acctPDA1);
        console.log("222,balance,before transfer,0 & 1:", balance0, ",", balance1, payer.publicKey.toBase58());
        await program.methods.transferAcctLamports(
            Buffer.from(ownerId1),
            new BN(0.1 * LAMPORTS_PER_SOL), new BN(10))
            .accounts({
                payerAcct: payer.publicKey,
                userPasswdAcct: passwdAcct0.publicKey,
                userAcct: acctPDA1,
                toAccount: acctPDA0,
                bigBrotherAcct: acctPDA0,
            }).signers([passwdAcct0])
            .rpc();

        await new Promise(r => setTimeout(r, 800));

        balance0 = await connection.getBalance(acctPDA0);
        balance1 = await connection.getBalance(acctPDA1);
        console.log("222,balance,after- transfer,0 & 1:", balance0, ",", balance1);



        let questionNos2 = "+++++++++++++++++++++++UoJ5vzRZkX4UfEE2bE=";
        // change password.
        let passwd = (await program.account.acctEntity.fetch(acctPDA0)).passwdAddr;
        let qs = (await program.account.acctEntity.fetch(acctPDA0)).questionNos;
        console.log("passwd,before change:", passwd);
        console.log("passwd,before change2:", qs);
        airdropTransfer(payer.publicKey, 1);
        airdropTransfer(passwdAcct0.publicKey, 1);
        airdropTransfer(passwdAcct1.publicKey, 1);
        airdropTransfer(acctPDA0, 1);
        await new Promise(r => setTimeout(r, 1800));

        await program.methods.changeAcctPasswdAddr(
            Buffer.from(ownerId0),
            questionNos2, new BN(10))
            .accounts({
                payerAcct: payer.publicKey,
                userPasswdAcct: passwdAcct0.publicKey,
                newPasswdAcct: passwdAcct1.publicKey,
                userAcct: acctPDA0,
                bigBrotherAcct: acctPDA0,
            }).signers([passwdAcct0, passwdAcct1])
            .rpc();

        await new Promise(r => setTimeout(r, 800));
        balance0 = await connection.getBalance(acctPDA0);
        passwd = (await program.account.acctEntity.fetch(acctPDA0)).passwdAddr;
        qs = (await program.account.acctEntity.fetch(acctPDA0)).questionNos;
        console.log("passwd,after  change:", passwd);  // here is line 250
        console.log("passwd,after change2:", qs, balance0);

        return;

    })

});

