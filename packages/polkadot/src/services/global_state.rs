use anyhow::Result;
use std::sync::Arc;
use crate::database::Database;

#[derive(Clone)]
pub struct GlobalStateService {
    db: Arc<Database>,
}

impl GlobalStateService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    /// Helper to increment nonce
    pub async fn increment_nonce(&self) -> Result<()> {
        sqlx::query("UPDATE global_token_state SET nonce = nonce + 1, updated_at = NOW() WHERE id = 1")
            .execute(self.db.pool())
            .await?;
        Ok(())
    }
}