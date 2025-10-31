use anyhow::Result;
use tracing::info;
use uuid::Uuid;
use std::sync::Arc;

use crate::database::Database;
use crate::models::PropertyStatus;

#[derive(Clone)]
pub struct PropertyService {
    db: Arc<Database>,
}

impl PropertyService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    /// Create a new property (aligns with register_property circuit)
    pub async fn create_property(
        &self,
        address: String,
        description: String,
        value_usd: i64,
    ) -> Result<Uuid> {
        let property_id = Uuid::new_v4();

        sqlx::query(r#"
            INSERT INTO properties (id, address, description, value_usd, status)
            VALUES ($1, $2, $3, $4, 'registered')
        "#)
        .bind(property_id)
        .bind(&address)
        .bind(&description)
        .bind(value_usd)
        .execute(self.db.pool())
        .await?;

        info!("Created property: {} at {}", property_id, address);
        Ok(property_id)
    }

    /// Update property status (aligns with tokenize_property, transfer_property_ownership, deactivate_property circuits)
    pub async fn update_property_status(
        &self,
        property_id: Uuid,
        status: PropertyStatus,
    ) -> Result<()> {
        sqlx::query(r#"
            UPDATE properties
            SET status = $1, updated_at = NOW()
            WHERE id = $2
        "#)
        .bind(status)
        .bind(property_id)
        .execute(self.db.pool())
        .await?;

        info!("Updated property {} status to {:?}", property_id, status);
        Ok(())
    }
}