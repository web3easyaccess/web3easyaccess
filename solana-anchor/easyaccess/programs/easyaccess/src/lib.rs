use anchor_lang::prelude::*;
// use anchor_lang::solana_program::keccak;
// use anchor_lang::solana_program::system_program;
// use anchor_lang::{solana_program::entrypoint::ProgramResult, system_program::{transfer, Transfer}};
// use anchor_lang::solana_program::ed25519_program;
// use anchor_lang::solana_program::sysvar;

declare_id!("BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD");

#[program]
pub mod easyaccess {

    // todo : The fee transfer to payer did not materialize

    use super::*;

    /**
     * lamports: transfer amount in lamports
     * trans_fee_lamports: transaction's fee, which should be minus from entity account, and add to payer.
     */
    pub fn create_acct(ctx: Context<CreateAcct>, owner_id: Vec<u8>, question_nos:String, lamports: u64, trans_fee_lamports:u64) -> Result<()> {
        let acct = &mut ctx.accounts.user_acct;
        // msg!("pda :");
        // msg!(&acct.key().to_string());
        // msg!("owner_id:");
        // msg!(&owner_id);
        
        if owner_id.len() != 32 {
            // proper error handling omitted for brevity
            msg!("{}",owner_id.len());
            
            panic!("owner_id len error");
        }

        acct.owner_id = owner_id;
        acct.passwd_addr = ctx.accounts.user_passwd_acct.key().to_string();
        acct.question_nos = question_nos;
        acct.bump = ctx.bumps.user_acct;

        let from_pubkey = acct.to_account_info();
        let to_pubkey = ctx.accounts.to_account.to_account_info();

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
        
        let to_pubkey2 = ctx.accounts.payer_acct.to_account_info();
        **from_pubkey.try_borrow_mut_lamports()? -= trans_fee_lamports;
        **to_pubkey2.try_borrow_mut_lamports()? += trans_fee_lamports;

        Ok(())
    }

    // handler function (add this next to the create_user_stats function in the game module)
    pub fn change_acct_passwd_addr(ctx: Context<ChangeAcctPasswd>, owner_id: Vec<u8>, question_nos: String, trans_fee_lamports:u64) -> Result<()> {
        if owner_id.len() != 32 {
            // proper error handling omitted for brevity
            panic!("owner_id len error");
        }

        if ctx.accounts.user_passwd_acct.is_signer && 
            ctx.accounts.user_passwd_acct.key().to_string().eq(&ctx.accounts.user_acct.passwd_addr) {
                
        } else {
            msg!("error::::::::");
            msg!("{}, is_signer:{}", ctx.accounts.user_passwd_acct.key(), ctx.accounts.user_passwd_acct.is_signer);
            msg!("{}", ctx.accounts.user_acct.passwd_addr);
            panic!("passwd addr permit error"); 
        }

        ctx.accounts.user_acct.passwd_addr = ctx.accounts.new_passwd_acct.key().to_string();
        ctx.accounts.user_acct.question_nos = question_nos;

        



        let from_pubkey = ctx.accounts.user_acct.to_account_info();
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
        if ctx.accounts.user_passwd_acct.is_signer && 
            ctx.accounts.user_passwd_acct.key().to_string().eq(&ctx.accounts.user_acct.passwd_addr) {
                
        } else {
            msg!("error::::::::");
            msg!("{}, is_signer:{}", ctx.accounts.user_passwd_acct.key(), ctx.accounts.user_passwd_acct.is_signer);
            msg!("{}", ctx.accounts.user_acct.passwd_addr);
            panic!("passwd addr permit ERROR"); 
        }

        let from_pubkey = ctx.accounts.user_acct.to_account_info();
        let to_pubkey = ctx.accounts.to_account.to_account_info();
        // let program_id = ctx.accounts.system_program.to_account_info();


        // https://solanacookbook.com/references/programs.html#how-to-transfer-sol-in-a-program
        // Does the from account have enough lamports to transfer?
        if **from_pubkey.try_borrow_lamports()? < lamports + trans_fee_lamports {
            panic!("InsufficientFundsForTransaction3"); 
        }
        // Debit from_account and credit to_account
        **from_pubkey.try_borrow_mut_lamports()? -= lamports;
        **to_pubkey.try_borrow_mut_lamports()? += lamports;


        let to_pubkey2 = ctx.accounts.payer_acct.to_account_info();
 
        **from_pubkey.try_borrow_mut_lamports()? -= trans_fee_lamports;
        **to_pubkey2.try_borrow_mut_lamports()? += trans_fee_lamports;


        Ok(())
    }




}

#[account]
pub struct AcctEntity {
    owner_id: Vec<u8>,
    passwd_addr: String,
    question_nos: String,
    bump: u8,
}

// validation struct
#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct CreateAcct<'info> {
    #[account(mut)]
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    
    // space: 8 discriminator + 4 owner_id length + 32 owner_id + 4 passwd_addr length + 44 passwd_addr + 4 question_nos length + 64 question_nos + 1 bump
    #[account(
        init,
        payer = payer_acct,
        space = 8 + 4 + 32 + 4 + 44 + 4 + 64 + 1, seeds = [&owner_id], bump
    )]
    pub user_acct: Account<'info, AcctEntity>,
    
    /// CHECK: unsafe
    #[account(mut)]
    pub to_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// validation struct
#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct ChangeAcctPasswd<'info> {
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    pub new_passwd_acct: Signer<'info>,

    #[account(mut, seeds = [&owner_id], bump = user_acct.bump)]
    pub user_acct: Account<'info, AcctEntity>,
}


// validation struct
#[derive(Accounts)]
#[instruction(owner_id: Vec<u8>)]
pub struct TransferAcctLamports<'info> {
    pub payer_acct: Signer<'info>,
    pub user_passwd_acct: Signer<'info>,
    
    #[account(mut, seeds = [&owner_id], bump )]
    pub user_acct: Account<'info, AcctEntity>,

    /// CHECK: unsafe
    #[account(mut)]
    pub to_account: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

