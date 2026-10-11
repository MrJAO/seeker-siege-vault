use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct VaultConfig {
    pub mint: Pubkey,
    pub backend_authority: Pubkey,
    pub vault_token_account: Pubkey,
    pub vault_authority_bump: u8,
    pub config_bump: u8,
}
