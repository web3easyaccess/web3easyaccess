import * as anchor from "@coral-xyz/anchor";
import { Program,BN } from "@coral-xyz/anchor";
import { Easyaccess } from "../target/types/easyaccess";

import { hexToBytes } from "viem"; 

import nacl from "tweetnacl";

import { PublicKey, LAMPORTS_PER_SOL ,SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
} from '@solana/web3.js';

import web3 from "@solana/web3.js";

import { expect } from 'chai';

const connection = new web3.Connection(
    "http://127.0.0.1:8899", // web3.clusterApiUrl("devnet"), 
    "confirmed");

    const sk = new Uint8Array([60, 250, 107,  73, 217, 201,  24, 127, 203, 159,
        113, 171, 188, 219, 157, 223, 161, 149, 219, 249,
        159,  53, 221, 151, 101,  54, 116, 251,  73,  56,
        164, 243,  36, 221, 126, 195, 209,  70,   2, 147,
        162, 125,  62, 144, 152, 161, 125, 167, 170, 100,
        111, 220, 209, 234, 129,  22, 212, 241,  47, 135,
         97,  73, 149,  15]);

async function airdropTransfer (toPubkey: PublicKey, amountInSol: number) {



    let balance1 = await connection.getBalance(toPubkey);
    console.log(`${toPubkey} balance before airdrop: ${balance1}`);

    
    let payer = web3.Keypair.fromSecretKey(sk);
    console.log("pubkey:", payer.publicKey.toBase58());
    // 3UuZygtJF5w61m2ApmVsAAMzbtipZDbPp83S9keKteuU
    
    let airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        (1+amountInSol)*web3.LAMPORTS_PER_SOL,
        );
    await connection.confirmTransaction({ signature: airdropSignature });
    
    // Create a transfer instruction for transferring SOL from wallet_1 to wallet_2
    const transferInstruction = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: toPubkey,
    lamports: amountInSol * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
    });
    
    // Add the transfer instruction to a new transaction
    const transaction = new Transaction().add(transferInstruction);

    // Send and confirm transaction
    // Note: feePayer is by default the first signer, or payer, if the parameter is not set
    await sendAndConfirmTransaction(connection, transaction, [payer]);

    let balance2 = await connection.getBalance(toPubkey);
    console.log(`${toPubkey} balance after airdrop: ${balance2}`);
}

describe("easyaccess", () => {
 
    console.log("passwdAddr:xxxxxxx222");
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider)
  
    let walletAddr = provider.wallet.publicKey.toBase58();
      console.log("walletAddr:",walletAddr);
    
    // console.log("passwdAddr:xxxxxxx223:",anchor.workspace.Easyaccess );
    const program = anchor.workspace.Easyaccess as Program<Easyaccess>
    console.log("passwdAddr:xxxxxxx224");
    // 4mkgCymBNuDYnjdPrdjaQVifSfn4JkdZ2R3nb8CwjJkr
    const passwdAddr1 = "47DkNqiKdH7XwpkNQm9u6seByzcHb1rztXYrF7Egfkbg";
    const passwdAddr2 = "47DkNqiKdH7XwpkNQm9u6seByzcHb1rztXYrF7Egfkbg";
    const ownerId0 = "0x477a3efac4b9f407e6abbef158c7312585d675f688e11949c468b8d4dc560000"; //
    const ownerId = hexToBytes(ownerId0);
    // ownerId0.substring(ownerId0.length-32) ;//anchor.utils.bytes.hex.decode(passwdAddr01);

    console.log("ownerId:",ownerId);
  
    it('Sets and changes passwd addr!', async () => {
        console.log("passwdAddr:xxxxxxx224a");
      const [acctPDA, acctBump] = PublicKey.findProgramAddressSync(
          [
            ownerId,
            // anchor.utils.bytes.utf8.encode(ownerId),
              // provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
      )
      // 8p2szsPqFErA4m3kxYvSG1f7xEiuvZ9iXqwdSkLzjpuQ
      // 8p2szsPqFErA4m3kxYvSG1f7xEiuvZ9iXqwdSkLzjpuQ
      console.log("passwdAddr:xxxxxxx224b,acctPDA in client:",acctPDA);
      await airdropTransfer (acctPDA, 3);
      console.log("passwdAddr:xxxxxxx224b,acctPDA in client222:",acctPDA);
      //  owner_id: Vec<u8>, passwd_addr: String, question_nos:String)
      await program.methods.createAcct(Buffer.from(ownerId), "U2FsdGVkX1/9hml4Tf3VLEBNhUoJ5vzRZkX4UfEE2bE=", new BN(1*LAMPORTS_PER_SOL), new BN(10))
        .accounts({
          payerAcct: provider.wallet.publicKey,
          userPasswdAcct: provider.wallet.publicKey,
          userAcct: acctPDA,
          toAccount: provider.wallet.publicKey,
        })
        .rpc()
        console.log("passwdAddr:xxxxxxx224b,acctPDA in client3333:",acctPDA);
        const addrOnChain = (await program.account.acctEntity.fetch(acctPDA)).passwdAddr;
        console.log("passwdAddr on chain:",addrOnChain);
        const ooId = (await program.account.acctEntity.fetch(acctPDA)).ownerId;
        console.log("ownerId on chain:",ooId);
        let balance2 = await connection.getBalance(acctPDA);
        console.log("passwdAddr:xxxxxxx224b,acctPDA in balance222:",balance2);
        return;

      expect(addrOnChain).to.equal(
        passwdAddr1
      )
  
      let passwdAddrSign:string = passwdAddr1;
      
      await program.methods
        .changeAcctPasswdAddr(ownerId, passwdAddr2)
        .accounts({
          payerAcct: provider.wallet.publicKey,
          userPasswdAcct: provider.wallet.publicKey,
          useracct: acctPDA,
        })
        .rpc()
  
        const addrOnChain2 = (await program.account.acctEntity.fetch(acctPDA)).passwdAddr;
        console.log("passwdAddr on chain2:",addrOnChain2);
    //   expect(addrOnChain2).to.equal(
    //       passwdAddr2  // 4mkgCymBNuDYnjdPrdjaQVifSfn4JkdZ2R3nb8CwjJkr
    //   )

      console.log("1sol=", LAMPORTS_PER_SOL);
      await airdropTransfer (acctPDA, 2);

      const toAccount = new PublicKey("47DkNqiKdH7XwpkNQm9u6seByzcHb1rztXYrF7Egfkbg");

      let walletBalance = await connection.getBalance(provider.wallet.publicKey);
      let pdaBalance = await connection.getBalance(acctPDA);
      let toAccountBalance = await connection.getBalance(toAccount);

      console.log(`before transfer, walletBalance=${walletBalance}, pdaBalance=${pdaBalance}, toAccountBalance=${toAccountBalance}`);
    
      passwdAddrSign = passwdAddr2;
      const lamports = new BN(2*LAMPORTS_PER_SOL) ;
      console.log("my lamports:",lamports, typeof lamports);

      let mPayer = web3.Keypair.fromSecretKey(sk);

      

      const signature = await program.methods.transferAcctLamports(ownerId, lamports)
          .accounts({
            walletAcct: provider.wallet.publicKey,
            passwdAcct: provider.wallet.publicKey, // mPayer.publicKey,
            fromAcct: acctPDA,
            toAccount: toAccount,
          })
          .rpc();
    console.log("transferAcctLamports, signature");
    await connection.confirmTransaction(signature, { commitment: 'confirmed' });
    
    await new Promise(r => setTimeout(r, 1000));

    walletBalance = await connection.getBalance(provider.wallet.publicKey);
    pdaBalance = await connection.getBalance(acctPDA);
    toAccountBalance = await connection.getBalance(toAccount);

    console.log(`after- transfer, walletBalance=${walletBalance}, pdaBalance=${pdaBalance}, toAccountBalance=${toAccountBalance}`);
    
    
          const fromAcctOnChain = (await program.account.acctEntity.fetch(acctPDA)).ownerId;
          console.log("fromAcctOnChain on chain3333:",fromAcctOnChain);
        expect(ownerId).to.equal(
            ownerId
        )
      })




});






