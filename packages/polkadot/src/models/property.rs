use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use super::enums::PropertyStatus;

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