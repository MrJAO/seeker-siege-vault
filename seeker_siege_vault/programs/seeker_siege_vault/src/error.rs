use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Only the registered backend authority can call withdraw")]
    Unauthorized,
    #[msg("Withdraw amount must be greater than zero")]
    InvalidAmount,
}
