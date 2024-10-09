use anchor_lang::prelude::*;
// use anchor_lang::solana_program::keccak;
// use anchor_lang::solana_program::system_program;
// use anchor_lang::{solana_program::entrypoint::ProgramResult, system_program::{transfer, Transfer}};
// use anchor_lang::solana_program::ed25519_program;
// use anchor_lang::solana_program::sysvar;

declare_id!("BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD");

mod w3ea {

    use super::*;

    pub fn create_acct(
        program_id: &Pubkey,
        payer_acct: &mut Signer<'_>,
        user_passwd_acct: & Signer<'_>,
        user_acct: &mut Account<'_, AcctEntity>,
        to_account: &mut AccountInfo<'_>,
        big_brother_acct: & Option<&Account<'_, AcctEntity>>,
        user_acct_bump: u8,
        owner_id: Vec<u8>, question_nos:String, lamports: u64, trans_fee_lamports:u64) -> Result<()> {

        if owner_id.len() != 32 {
            // proper error handling omitted for brevity
            msg!("{}",owner_id.len());
            
            panic!("owner_id len error");
        }
        let mut big_brother_owner_id:Vec<u8> = owner_id[..30].to_vec();
        big_brother_owner_id.push(0);
        big_brother_owner_id.push(0);
        
        let (big_brother_acct_fpa, _bump) = Pubkey::find_program_address(&[&big_brother_owner_id], program_id);
        

        user_acct.owner_id = owner_id;
        user_acct.big_brothr_acct_addr = big_brother_acct_fpa.to_string();
        if big_brother_acct_fpa.to_string()==user_acct.key().to_string() {
            // create big brother.
            user_acct.passwd_addr = user_passwd_acct.key().to_string();
        } else {
            // create other acct.
            if big_brother_acct.is_none() || big_brother_acct.unwrap().key()!=big_brother_acct_fpa {
                panic!("your first account error.");
            }
            if big_brother_acct.unwrap().passwd_addr != user_passwd_acct.key().to_string() {
                panic!("password permit error, for creation.{},your signer addr:{}",
                    big_brother_acct.unwrap().passwd_addr,
                    user_passwd_acct.key().to_string());
            }
            user_acct.passwd_addr = "".to_string();
        }
        
        user_acct.question_nos = question_nos;
        
        user_acct.bump = user_acct_bump; // ctx.bumps.user_acct;
        
        
        let from_pubkey = user_acct.to_account_info();
        let to_pubkey = to_account.to_account_info();

        // https://solanacookbook.com/references/programs.html#how-to-transfer-sol-in-a-program
        // Does the from account have enough lamports to transfer?
        if **from_pubkey.try_borrow_lamports()? < lamports + trans_fee_lamports {
            panic!("InsufficientFundsForTransaction"); 
        }

        if lamports>0 {
            // Debit from_account and credit to_account
            **from_pubkey.try_borrow_mut_lamports()? -= lamports;
            **to_pubkey.try_borrow_mut_lamports()? += lamports;
        }
        
        let to_pubkey2 = payer_acct.to_account_info();
        **from_pubkey.try_borrow_mut_lamports()? -= trans_fee_lamports;
        **to_pubkey2.try_borrow_mut_lamports()? += trans_fee_lamports;

        Ok(())
    }
}

#[program]
pub mod easyaccess {

    // todo : The fee transfer to payer did not materialize


    use super::*;

    /**
     * lamports: transfer amount in lamports
     * trans_fee_lamports: transaction's fee, which should be minus from entity account, and add to payer.
     * the ownerId must endsWith 0x0000
     */
    pub fn create_first_acct(ctx: Context<CreateFirstAcct>, owner_id: Vec<u8>, question_nos:String, lamports: u64, trans_fee_lamports:u64) -> Result<()> {
        let bb_acct = None;
        w3ea::create_acct(
            ctx.program_id, 
            &mut ctx.accounts.payer_acct,
            &mut ctx.accounts.user_passwd_acct,
            &mut ctx.accounts.user_acct, 
            &mut ctx.accounts.to_account, 
            &bb_acct, 
            ctx.bumps.user_acct,
            owner_id,
            question_nos,
            lamports,
            trans_fee_lamports
        )

    }

    pub fn create_other_acct(ctx: Context<CreateOtherAcct>, owner_id: Vec<u8>, question_nos:String, lamports: u64, trans_fee_lamports:u64) -> Result<()> {
        let bb_acct = Some(&ctx.accounts.big_brother_acct);
        w3ea::create_acct(
            ctx.program_id, 
            &mut ctx.accounts.payer_acct,
            &mut ctx.accounts.user_passwd_acct,
            &mut ctx.accounts.user_acct, 
            &mut ctx.accounts.to_account, 
            &bb_acct, 
            ctx.bumps.user_acct,
            owner_id,
            question_nos,
            lamports,
            trans_fee_lamports
        )

    }

    // handler function (add this next to the create_user_stats function in the game module)
    pub fn change_acct_passwd_addr(ctx: Context<ChangeAcctPasswd>, owner_id: Vec<u8>, question_nos: String, trans_fee_lamports:u64) -> Result<()> {
        if owner_id.len() != 32 {
            // proper error handling omitted for brevity
            panic!("owner_id len error");
        }

        let user_acct = &mut ctx.accounts.user_acct;

        let mut big_brother_owner_id:Vec<u8> = owner_id[..30].to_vec();
        big_brother_owner_id.push(0);
        big_brother_owner_id.push(0);
        
        let (big_brother_acct, _bump) = Pubkey::find_program_address(&[&big_brother_owner_id], ctx.program_id);

        let passwd_addr: String;
        if big_brother_acct.to_string()==user_acct.key().to_string() {
            // myself
            passwd_addr = user_acct.passwd_addr.clone();
        } else {
            panic!("can change your first acct only");
            // passwd_addr = ctx.accounts.big_brother_acct.passwd_addr.clone();
        }

        if ctx.accounts.user_passwd_acct.is_signer && 
            ctx.accounts.user_passwd_acct.key().to_string()==passwd_addr {
                
        } else {
            msg!("error::::::::");
            msg!("given  passwd:{}, is_signer:{}", ctx.accounts.user_passwd_acct.key(), ctx.accounts.user_passwd_acct.is_signer);
            msg!("user's passwd:{}", user_acct.passwd_addr);
            panic!("password permit error, for changing.");
        }
        
        // 
        user_acct.passwd_addr = ctx.accounts.new_passwd_acct.key().to_string();
        user_acct.question_nos = question_nos;
        

        let from_pubkey = user_acct.to_account_info();
        let to_pubkey2 = ctx.accounts.payer_acct.to_account_info();
        

        // https://solanacookbook.com/references/programs.html#how-to-transfer-sol-in-a-program
        // Does the from account have enough lamports to transfer?
        if **from_pubkey.try_borrow_lamports()? < trans_fee_lamports {
            panic!("InsufficientFundsForTransaction2"); 
        }        
        **from_pubkey.try_borrow_mut_lamports()? -= trans_fee_lamports;
        **to_pubkey2.try_borrow_mut_lamports()? += trans_fee_lamports;


        Ok(())
    }

    pub fn transfer_acct_lamports(ctx: Context<TransferAcctLamports>, owner_id: Vec<u8>, lamports: u64, trans_fee_lamports:u64) -> Result<()> {
        if owner_id.len() != 32 {
            // proper error handling omitted for brevity
            // msg!("x:{}", lamports);
            panic!("owner_id len error");
        }

        let mut big_brother_owner_id:Vec<u8> = owner_id[..30].to_vec();
        big_brother_owner_id.push(0);
        big_brother_owner_id.push(0);
        
        let (big_brother_acct, _bump) = Pubkey::find_program_address(&[&big_brother_owner_id], ctx.program_id);

        let passwd_addr: String;
        if big_brother_acct.to_string()==ctx.accounts.user_acct.key().to_string() {
            // myself
            passwd_addr = ctx.accounts.user_acct.passwd_addr.clone();
        } else {
            if big_brother_acct.to_string()!=ctx.accounts.big_brother_acct.key().to_string() {
                panic!("given big brother acct error");
            }
            passwd_addr = ctx.accounts.big_brother_acct.passwd_addr.clone();
        }

        if ctx.accounts.user_passwd_acct.is_signer && 
            ctx.accounts.user_passwd_acct.key().to_string()==passwd_addr {

        } else {
            msg!("error::::::::");
            msg!("given  passwd:{}, is_signer:{}", ctx.accounts.user_passwd_acct.key(), ctx.accounts.user_passwd_acct.is_signer);
            msg!("user's passwd:{}", passwd_addr);
            panic!("password permit error, for transfer.");
        }

        let from_pubkey = ctx.accounts.user_acct.to_account_info();
        let to_pubkey = ctx.accounts.to_account.to_account_info();
        // let program_id = ctx.accounts.system_program.to_account_info();


        // https://solanacookbook.com/references/programs.html#how-to-transfer-sol-in-a-program
        // Does the from account have enough lamports to transfer?
        if **from_pubkey.try_borrow_lamports()? < lamports + trans_fee_lamports {
            panic!("InsufficientFundsForTransaction3"); 
        }
        
        // msg!("0.from:{}",**from_pubkey.try_borrow_mut_lamports()?);

        // Debit from_account and credit to_account
        **from_pubkey.try_borrow_mut_lamports()? -= lamports;
        **to_pubkey.try_borrow_mut_lamports()? += lamports;

        // msg!("1.from:{}",**from_pubkey.try_borrow_mut_lamports()?);

        let to_pubkey2 = ctx.accounts.payer_acct.to_account_info();
 
        **from_pubkey.try_borrow_mut_lamports()? -= trans_fee_lamports;
        **to_pubkey2.try_borrow_mut_lamports()? += trans_fee_lamports;

        // msg!("2.from:{}",**from_pubkey.try_borrow_mut_lamports()?);
        //panic!("test000.");
        Ok(())
    }




}

#[account]
pub struct AcctEntity {
    owner_id: Vec<u8>,
    big_brothr_acct_addr: String,
    passwd_addr: String, // the passwd_addr is valid when big_brothr_acct_addr is the account self, otherwise it's null.
    question_nos: String,
    bump: u8,
}

// validation struct
#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct CreateFirstAcct<'info> {
    #[account(mut)]
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    
    // space: 8 discriminator + 4 owner_id length + 32 owner_id + 4 passwd_addr length + 44 passwd_addr + 4 question_nos length + 64 question_nos + 4 big_brothr_acct_addr length + 44 big_brothr_acct_addr + 1 bump
    #[account(
        init,
        payer = payer_acct,
        space = 8 + 4 + 32 + 4 + 44 + 4 + 64 + 4 + 44 + 1, seeds = [&owner_id], bump
    )]
    pub user_acct: Account<'info, AcctEntity>,
    
    /// CHECK: unsafe
    #[account(mut)]
    pub to_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct CreateOtherAcct<'info> {
    #[account(mut)]
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    
    // space: 8 discriminator + 4 owner_id length + 32 owner_id + 4 passwd_addr length + 44 passwd_addr + 4 question_nos length + 64 question_nos + 4 big_brothr_acct_addr length + 44 big_brothr_acct_addr + 1 bump
    #[account(
        init,
        payer = payer_acct,
        space = 8 + 4 + 32 + 4 + 44 + 4 + 64 + 4 + 44 + 1, seeds = [&owner_id], bump
    )]
    pub user_acct: Account<'info, AcctEntity>,
    
    /// CHECK: unsafe
    #[account(mut)]
    pub to_account: AccountInfo<'info>,

    #[account(seeds = [&owner_id[..30],&[0,0]], bump)]
    pub big_brother_acct: Account<'info, AcctEntity>,

    pub system_program: Program<'info, System>,
}

// validation struct
#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct ChangeAcctPasswd<'info> {
    #[account(mut)]
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    pub new_passwd_acct: Signer<'info>,

    #[account(mut, seeds = [&owner_id], bump = user_acct.bump)]
    pub user_acct: Account<'info, AcctEntity>,

    #[account(seeds = [&owner_id[..30],&[0,0]], bump)]
    pub big_brother_acct: Account<'info, AcctEntity>,
}


// validation struct
#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct TransferAcctLamports<'info> {
    #[account(mut)]
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    
    #[account(mut, seeds = [&owner_id], bump )]
    pub user_acct: Account<'info, AcctEntity>,

    /// CHECK: unsafe
    #[account(mut)]
    pub to_account: AccountInfo<'info>,

    #[account(seeds = [&owner_id[..30],&[0,0]], bump)]
    pub big_brother_acct: Account<'info, AcctEntity>,
    
    pub system_program: Program<'info, System>,
}

// extend:
//      solana program extend BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD 20000
// 
/*

has error: Recover the intermediate account's ephemeral keypair file with
`solana-keygen recover` and the following 12-word seed phrase:....
do:
    solana-keygen recover -o recover.json --force
    solana program close recover.json
    anchor deploy --provider.cluster devnet
*/