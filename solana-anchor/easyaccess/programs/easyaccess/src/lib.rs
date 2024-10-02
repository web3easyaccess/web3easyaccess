use anchor_lang::prelude::*;
// use anchor_lang::solana_program::keccak;
// use anchor_lang::solana_program::system_program;
// use anchor_lang::{solana_program::entrypoint::ProgramResult, system_program::{transfer, Transfer}};
// use anchor_lang::solana_program::ed25519_program;
// use anchor_lang::solana_program::sysvar;

declare_id!("BA3YWB1TPRqMcKjMRBugDqjcowNiZJb4FcPwjWfg9aCD");

#[program]
pub mod easyaccess {

    use super::*;

    // handler function
    pub fn create_acct(ctx: Context<CreateAcct>, owner_id: String, passwd_addr: String) -> Result<()> {
        let acct = &mut ctx.accounts.acct;
        msg!("pda :");
        msg!(&acct.key().to_string());
        msg!("owner_id:");
        msg!(&owner_id);
        
        if owner_id.as_bytes().len() != 32 {
            // proper error handling omitted for brevity
            panic!("owner_id len error");
        }
        if passwd_addr.as_bytes().len() > 42 {
            panic!("passwd addr len error");
        }
        acct.owner_id = owner_id;
        acct.passwd_addr = passwd_addr;
        acct.bump = ctx.bumps.acct;
        Ok(())
    }

    // handler function (add this next to the create_user_stats function in the game module)
    pub fn change_acct_passwd_addr(ctx: Context<ChangeAcctPasswd>, owner_id: String, passwd_addr_sign: String, new_passwd_addr: String) -> Result<()> {
        if owner_id.as_bytes().len() != 32 {
            // proper error handling omitted for brevity
            panic!("owner_id len error");
        }

        if passwd_addr_sign != ctx.accounts.acct.passwd_addr {
            // todo ....
            panic!("old passwd addr error"); 
        }

        if new_passwd_addr.as_bytes().len() > 42 {
            panic!("passwd addr len error");
        }

       
        ctx.accounts.acct.passwd_addr = new_passwd_addr;
        Ok(())
    }

    pub fn transfer_acct_lamports(ctx: Context<TransferAcctLamports>, owner_id: String, lamports: u64) -> Result<()> {
        if owner_id.as_bytes().len() != 32 {
            // proper error handling omitted for brevity
            // msg!("x:{}", lamports);
            panic!("owner_id len error");
        }
        if ctx.accounts.passwd_acct.is_signer && 
            ctx.accounts.passwd_acct.key().to_string().ends_with(&ctx.accounts.from_acct.passwd_addr) {
        } else {
            msg!("error::::::::");
            msg!("{}, is_signer:{}", ctx.accounts.passwd_acct.key(), ctx.accounts.passwd_acct.is_signer);
            msg!("{}", ctx.accounts.from_acct.passwd_addr);
            panic!("passwd addr error"); 
        }

        
        // if passwd_addr_sign != ctx.accounts.from_acct.passwd_addr {
        //     // todo ....
        //     msg!("error1:");
        //     msg!(&ctx.accounts.from_acct.passwd_addr);
        //     msg!(&passwd_addr_sign);
        //     panic!("passwd addr error"); 
        // }

        // if ctx.accounts.from_acct.lamports < lamports {
        //     panic!("InsufficientFunds"); 
        // }

        let from_pubkey = ctx.accounts.from_acct.to_account_info();
        let to_pubkey = ctx.accounts.to_account.to_account_info();
        // let program_id = ctx.accounts.system_program.to_account_info();


        // https://solanacookbook.com/references/programs.html#how-to-transfer-sol-in-a-program
        // Does the from account have enough lamports to transfer?
        if **from_pubkey.try_borrow_lamports()? < lamports {
            panic!("InsufficientFundsForTransaction"); 
        }
        // Debit from_account and credit to_account
        **from_pubkey.try_borrow_mut_lamports()? -= lamports;
        **to_pubkey.try_borrow_mut_lamports()? += lamports;



        // let seed = owner_id.as_bytes();
        // let bump_seed = ctx.bumps.from_acct;
        // let signer_seeds: &[&[&[u8]]] = &[&[seed.as_ref(), &[bump_seed]]];
 
        // let cpi_context = CpiContext::new(
        //     program_id,
        //     Transfer {
        //         from: from_pubkey,
        //         to: to_pubkey,
        //     },
        // )
        // .with_signer(signer_seeds);
 
        // transfer(cpi_context, lamports)?;

        Ok(())
    }




}

#[account]
pub struct AcctEntity {
    owner_id: String,
    passwd_addr: String,
    bump: u8,
}

// validation struct
#[derive(Accounts)]
#[instruction(owner_id: String)]
pub struct CreateAcct<'info> {
    #[account(mut)]
    pub wallet_acct: Signer<'info>,
    // space: 8 discriminator + 4 owner_id length + 32 owner_id + 4 passwd_addr length + 40 passwd_addr + 1 bump
    #[account(
        init,
        payer = wallet_acct,
        space = 8 + 4 + 32 + 4 + 40 + 1, seeds = [owner_id.as_bytes()], bump
    )]
    pub acct: Account<'info, AcctEntity>,
    pub system_program: Program<'info, System>,
}

// validation struct
#[derive(Accounts)]
#[instruction(owner_id: String)]
pub struct ChangeAcctPasswd<'info> {
    pub wallet_acct: Signer<'info>,
    #[account(mut, seeds = [owner_id.as_bytes()], bump = acct.bump)]
    pub acct: Account<'info, AcctEntity>,
}


// validation struct
#[derive(Accounts)]
#[instruction(owner_id: String)]
pub struct TransferAcctLamports<'info> {
    pub wallet_acct: Signer<'info>,
    pub passwd_acct: Signer<'info>,
    
    #[account(mut, seeds = [owner_id.as_bytes()], bump )]
    pub from_acct: Account<'info, AcctEntity>,

    /// CHECK: unsafe
    #[account(mut)]
    pub to_account: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

