use serde::{Deserialize, Serialize};

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

/// Transfer type enum
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "transfer_type", rename_all = "lowercase")]
pub enum TransferType {
    Mint,
    Transfer,
    Burn,
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