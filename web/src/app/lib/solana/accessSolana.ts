import { PublicKey } from "@solana/web3.js";

import { clusterApiUrl, Connection } from "@solana/web3.js";

import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { getPasswdAccount } from "@/app/dashboard/privateinfo/lib/keyTools";

import { PrivateInfoType } from "@/app/dashboard/privateinfo/lib/keyTools";

import { readFileSync } from "fs";

const privateInfo: PrivateInfoType = {
    email: "zhtkeepup@gmail.com",
    pin: "",
    question1answer: "",
    question2answer: "",
    firstQuestionNo: "",
    secondQuestionNo: "",
    confirmedSecondary: false,
};

/*
mainnet-beta https://api.mainnet-beta.solana.com
devnet https://api.devnet.solana.com
testnet https://api.testnet.solana.com
*/

export const test1 = async () => {
    return;
    // 读取 JSON 文件
    // const walletKeypairJson = readFileSync(
    //     "C:/Users/do99c/Downloads/wallet-keypair.json",
    //     "utf8"
    // );
    // //    "[33,94,145,128,135,124,118,129,174,188,235,248,143,209,12,82,58,116,121,10,4,197,130,161,160,163,115,170,124,111,45,142,120,16,15,182,227,20,234,75,63,236,127,215,62,132,167,189,148,109,218,33,148,191,231,1,36,56,8,148,230,20,138,65]";
    // // fs.readFileSync("./wallet-keypair.json", "utf8");

    // // 解析 JSON
    // const walletKeypair = JSON.parse(walletKeypairJson);

    // 创建 Keypair 对象
    // const keypair = Keypair.fromSecretKey(
    //     new Uint8Array(walletKeypair.secretKey)
    // );
    const keypair = Keypair.generate();
    console.log("solana wallet address:", keypair.publicKey);

    console.log("test1 in solana....keypair:", keypair.publicKey);
    //const keypair = Keypair.generate();

    // const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // const signature = await connection.requestAirdrop(
    //     keypair.publicKey,
    //     LAMPORTS_PER_SOL
    // );
    // const { blockhash, lastValidBlockHeight } =
    //     await connection.getLatestBlockhash();
    // await connection.confirmTransaction({
    //     blockhash,
    //     lastValidBlockHeight,
    //     signature,
    // });

    const ethAccount = getPasswdAccount(privateInfo);
    //     const message = "new account!";

    const owner = ethAccount.address;
    console.log("ownerId as ethAccount:", owner);

    const programId = new PublicKey(
        "5yT1eyW2kQZUkYTEk9Zj8jiqb4Tu2LU2hqgEUreJ5tuv"
    );

    const [userAcctPda, userAcctBump] = PublicKey.findProgramAddressSync(
        [Buffer.from(owner)],
        programId
    );

    console.log("userAcctPda:{}", userAcctPda.toBase58());
};

// describe("pda_account", () => {
//     const program = pg.program;
//     const wallet = pg.wallet;

//     //     const message = "new account!";
//     const owner_raw = "GMpWTEeLYMuH2ZiFfdC8WkSHqQv7Ug6C68TJf6c7TSVH";
//     const owner = owner_raw.substring(0, 32);

//     const [userAcctPda, userAcctBump] = PublicKey.findProgramAddressSync(
//         [Buffer.from(owner)],
//         program.programId
//     );

//     console.log("userAcctPda:{}", userAcctPda.toBase58());

//     // const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
//     //   [Buffer.from("vault"), wallet.publicKey.toBuffer()],
//     //   program.programId
//     // );

//     it("call new account", async () => {
//         const transactionSignature = await program.methods
//             .newAccount(owner)
//             .accounts({
//                 userAccount: userAcctPda,
//             })
//             .rpc({ commitment: "confirmed" });
//         console.log("......123......program.account...:", program.account);
//         // const messageAccount = await program.account.userAccount.fetch(
//         //   messagePda,
//         //   "confirmed"
//         // );

//         // console.log(JSON.stringify(messageAccount, null, 2));
//         console.log(
//             "Transaction Signature:",
//             `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
//         );
//     });

//     // it("Create Message Account", async () => {
//     //   const message = "Hello, World!";
//     //   const transactionSignature = await program.methods
//     //     .create(message)
//     //     .accounts({
//     //       messageAccount: messagePda,
//     //     })
//     //     .rpc({ commitment: "confirmed" });

//     //   const messageAccount = await program.account.messageAccount.fetch(
//     //     messagePda,
//     //     "confirmed"
//     //   );

//     //   console.log(JSON.stringify(messageAccount, null, 2));
//     //   console.log(
//     //     "Transaction Signature:",
//     //     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
//     //   );
//     // });

//     // it("Update Message Account", async () => {
//     //   const message = "Hello, Solana!";
//     //   const transactionSignature = await program.methods
//     //     .update(message)
//     //     .accounts({
//     //       messageAccount: messagePda,
//     //       vaultAccount: vaultPda,
//     //     })
//     //     .rpc({ commitment: "confirmed" });

//     //   const messageAccount = await program.account.messageAccount.fetch(
//     //     messagePda,
//     //     "confirmed"
//     //   );

//     //   console.log(JSON.stringify(messageAccount, null, 2));
//     //   console.log(
//     //     "Transaction Signature:",
//     //     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
//     //   );
//     // });

//     // it("Delete Message Account", async () => {
//     //   const transactionSignature = await program.methods
//     //     .delete()
//     //     .accounts({
//     //       messageAccount: messagePda,
//     //       vaultAccount: vaultPda,
//     //     })
//     //     .rpc({ commitment: "confirmed" });

//     //   const messageAccount = await program.account.messageAccount.fetchNullable(
//     //     messagePda,
//     //     "confirmed"
//     //   );

//     //   console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
//     //   console.log(
//     //     "Transaction Signature:",
//     //     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
//     //   );
//     // });
// });
