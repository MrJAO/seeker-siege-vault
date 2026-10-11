use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, state::VaultConfig};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The wallet allowed to call withdraw()
    pub backend_authority: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 8 + VaultConfig::INIT_SPACE,
        seeds = [VAULT_CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub vault_config: Account<'info, VaultConfig>,

    /// PDA used purely as a signing authority for the vault token
    #[account(
        seeds = [VAULT_AUTHORITY_SEED, mint.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = vault_authority,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize(ctx: Context<Initialize>) -> Result<()> {
    let vault_config = &mut ctx.accounts.vault_config;
    vault_config.mint = ctx.accounts.mint.key();
    vault_config.backend_authority = ctx.accounts.backend_authority.key();
    vault_config.vault_token_account = ctx.accounts.vault_token_account.key();
    vault_config.vault_authority_bump = ctx.bumps.vault_authority;
    vault_config.config_bump = ctx.bumps.vault_config;

    msg!("Vault initialized for mint {}", ctx.accounts.mint.key());
    Ok(())
}
