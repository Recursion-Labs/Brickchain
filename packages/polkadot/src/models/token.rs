use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use super::enums::TokenState;

/// Global token state model matching the contract's global state
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct GlobalTokenState {
    pub id: i32, // Always 1, singleton record
    pub total_supply: i64,
    pub circulating_supply: i64,
    pub nonce: i64,
    pub token_state: TokenState,
    pub holder_count: i64,
    pub updated_at: DateTime<Utc>,
}