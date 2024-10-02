import * as anchor from "@coral-xyz/anchor";
import { Program,BN } from "@coral-xyz/anchor";
import { Easyaccess } from "../target/types/easyaccess";

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
  
    // console.log("passwdAddr:xxxxxxx223:",anchor.workspace.Easyaccess );
    const program = anchor.workspace.Easyaccess as Program<Easyaccess>
    console.log("passwdAddr:xxxxxxx224");
    // 4mkgCymBNuDYnjdPrdjaQVifSfn4JkdZ2R3nb8CwjJkr
    const passwdAddr1 = "0x61bd43feE0AaE9443cA238DE1056c52402c8dc91".substring(2);
    const passwdAddr2 = "0x55b3448D38724997747083323992C88dB4AccE55".substring(2);
    const ownerId0 = "0xAAAAA55b3448D38724997747083323992C88dB4AccE55ABC";
    const ownerId = ownerId0.substring(ownerId0.length-32) ;//anchor.utils.bytes.hex.decode(passwdAddr01);

    console.log("ownerId:",ownerId);
  
    it('Sets and changes passwd addr!', async () => {
        console.log("passwdAddr:xxxxxxx224a");
      const [acctPDA, acctBump] = PublicKey.findProgramAddressSync(
          [
            anchor.utils.bytes.utf8.encode(ownerId),
              // provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
      )
      // 8p2szsPqFErA4m3kxYvSG1f7xEiuvZ9iXqwdSkLzjpuQ
      // 8p2szsPqFErA4m3kxYvSG1f7xEiuvZ9iXqwdSkLzjpuQ
      console.log("passwdAddr:xxxxxxx224b,acctPDA in client:",acctPDA);

      await program.methods.createAcct(ownerId, passwdAddr1)
        .accounts({
          walletAcct: provider.wallet.publicKey,
          acct: acctPDA,
        })
        .rpc()
  
        const addrOnChain = (await program.account.acctEntity.fetch(acctPDA)).passwdAddr;
        console.log("passwdAddr on chain:",addrOnChain);

      expect(addrOnChain).to.equal(
        passwdAddr1
      )
  
      let passwdAddrSign:string = passwdAddr1;
      let walletAddr = provider.wallet.publicKey.toBase58();
      console.log("walletAddr:",walletAddr);
      await program.methods
        .changeAcctPasswdAddr(ownerId, passwdAddrSign, walletAddr.substring(walletAddr.length-32))
        .accounts({
          walletAcct: provider.wallet.publicKey,
          acct: acctPDA,
        })
        .rpc()
  
        const addrOnChain2 = (await program.account.acctEntity.fetch(acctPDA)).passwdAddr;
        console.log("passwdAddr on chain2:",addrOnChain2);
    //   expect(addrOnChain2).to.equal(
    //       passwdAddr2
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






