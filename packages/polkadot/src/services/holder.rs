use anyhow::Result;
use tracing::info;
use uuid::Uuid;
use std::sync::Arc;

use crate::database::Database;

#[derive(Clone)]
pub struct TokenHolderService {
    db: Arc<Database>,
}

impl TokenHolderService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    /// Create a new token holder
    pub async fn create_token_holder(
        &self,
        polkadot_address: String,
        name: String,
    ) -> Result<Uuid> {
        let holder_id = Uuid::new_v4();

        sqlx::query(r#"
            INSERT INTO token_holders (id, polkadot_address, name)
            VALUES ($1, $2, $3)
        "#)
        .bind(holder_id)
        .bind(&polkadot_address)
        .bind(&name)
        .execute(self.db.pool())
        .await?;

        info!("Created token holder: {} ({})", holder_id, polkadot_address);
        Ok(holder_id)
    }
}