use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

/// Token state enum matching the Compact contract
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "token_state", rename_all = "lowercase")]
pub enum TokenState {
    Active,
    Paused,
    Frozen,
}

/// Property status enum matching the Compact contract
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "property_status", rename_all = "lowercase")]
pub enum PropertyStatus {
    Registered,
    Tokenized,
    Transferred,
    Deactivated,
}

/// Property model representing real estate properties
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Property {
    pub id: Uuid,
    pub address: String,
    pub description: String,
    pub value_usd: i64,
    pub status: PropertyStatus,
    pub owner_id: Option<Uuid>,
    pub token_id: Option<i64>,
    pub property_hash: Option<Vec<u8>>, // For storing property document hash
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Token holder model representing addresses that can hold tokens
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct TokenHolder {
    pub id: Uuid,
    pub polkadot_address: String,
    pub name: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

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

/// Transfer type enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "transfer_type", rename_all = "lowercase")]
pub enum TransferType {
    Mint,
    Transfer,
    Burn,
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

/// Property ownership history for tracking transfers
#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct PropertyOwnership {
    pub id: Uuid,
    pub property_id: Uuid,
    pub previous_owner_id: Option<Uuid>,
    pub new_owner_id: Uuid,
    pub transfer_date: DateTime<Utc>,
    pub transaction_hash: Option<String>,
}

impl Default for TokenState {
    fn default() -> Self {
        TokenState::Active
    }
}

impl Default for PropertyStatus {
    fn default() -> Self {
        PropertyStatus::Registered
    }
}

impl Default for TransferType {
    fn default() -> Self {
        TransferType::Transfer
    }
}