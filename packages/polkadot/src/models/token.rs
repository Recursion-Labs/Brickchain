use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::enums::{TokenState, TransferType};

/// Token balance model tracking how many tokens each holder has for each property
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct TokenBalance {
    pub id: Uuid,
    pub holder_id: Uuid,
    pub property_id: Uuid,
    pub balance: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Token transfer model for tracking all transfers
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct TokenTransfer {
    pub id: Uuid,
    pub from_holder_id: Option<Uuid>, // None for minting
    pub to_holder_id: Uuid,
    pub property_id: Uuid,
    pub amount: i64,
    pub transfer_type: TransferType,
    pub transaction_hash: Option<String>,
    pub created_at: DateTime<Utc>,
}

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