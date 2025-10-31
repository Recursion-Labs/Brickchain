use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

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