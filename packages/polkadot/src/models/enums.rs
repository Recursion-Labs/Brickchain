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