use anyhow::{anyhow, Result};
use tracing::info;
use uuid::Uuid;
use std::sync::Arc;

use crate::database::Database;
use crate::models::{GlobalTokenState, TokenState, TokenTransfer};

pub struct TokenService {
    db: Arc<Database>,
}

impl TokenService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    /// Mint tokens (aligns with mint circuit)
    pub async fn mint_tokens(
        &self,
        to_holder_id: Uuid,
        property_id: Uuid,
        amount: i64,
    ) -> Result<()> {
        if amount <= 0 {
            return Err(anyhow!("Amount must be positive"));
        }

        // Check if token is active
        let global_state = self.get_global_state().await?;
        if global_state.token_state != TokenState::Active {
            return Err(anyhow!("Token is not active"));
        }

        let mut tx = self.db.pool().begin().await?;

        // Update or create balance
        sqlx::query(r#"
            INSERT INTO token_balances (holder_id, property_id, balance)
            VALUES ($1, $2, $3)
            ON CONFLICT (holder_id, property_id)
            DO UPDATE SET balance = token_balances.balance + $3, updated_at = NOW()
        "#)
        .bind(to_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Record transfer
        sqlx::query(r#"
            INSERT INTO token_transfers (from_holder_id, to_holder_id, property_id, amount, transfer_type)
            VALUES (NULL, $1, $2, $3, 'mint')
        "#)
        .bind(to_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Update global state
        sqlx::query(r#"
            UPDATE global_token_state
            SET total_supply = total_supply + $1,
                circulating_supply = circulating_supply + $1,
                nonce = nonce + 1,
                holder_count = (
                    SELECT COUNT(DISTINCT holder_id) FROM token_balances WHERE balance > 0
                ),
                updated_at = NOW()
            WHERE id = 1
        "#)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        info!("Minted {} tokens for property {} to holder {}", amount, property_id, to_holder_id);
        Ok(())
    }

    /// Transfer tokens (aligns with transfer circuit)
    pub async fn transfer_tokens(
        &self,
        from_holder_id: Uuid,
        to_holder_id: Uuid,
        property_id: Uuid,
        amount: i64,
    ) -> Result<()> {
        if amount <= 0 {
            return Err(anyhow!("Amount must be positive"));
        }

        // Check if token is active
        let global_state = self.get_global_state().await?;
        if global_state.token_state != TokenState::Active {
            return Err(anyhow!("Token is not active"));
        }

        let mut tx = self.db.pool().begin().await?;

        // Check sender balance
        let from_balance = sqlx::query_scalar::<_, i64>(
            "SELECT balance FROM token_balances WHERE holder_id = $1 AND property_id = $2"
        )
        .bind(from_holder_id)
        .bind(property_id)
        .fetch_optional(&mut *tx)
        .await?
        .unwrap_or(0);

        if from_balance < amount {
            return Err(anyhow!("Insufficient balance"));
        }

        // Update sender balance
        sqlx::query(r#"
            UPDATE token_balances
            SET balance = balance - $3, updated_at = NOW()
            WHERE holder_id = $1 AND property_id = $2
        "#)
        .bind(from_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Update or create recipient balance
        sqlx::query(r#"
            INSERT INTO token_balances (holder_id, property_id, balance)
            VALUES ($1, $2, $3)
            ON CONFLICT (holder_id, property_id)
            DO UPDATE SET balance = token_balances.balance + $3, updated_at = NOW()
        "#)
        .bind(to_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Record transfer
        sqlx::query(r#"
            INSERT INTO token_transfers (from_holder_id, to_holder_id, property_id, amount, transfer_type)
            VALUES ($1, $2, $3, $4, 'transfer')
        "#)
        .bind(from_holder_id)
        .bind(to_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Update global state
        sqlx::query(r#"
            UPDATE global_token_state
            SET nonce = nonce + 1,
                holder_count = (
                    SELECT COUNT(DISTINCT holder_id) FROM token_balances WHERE balance > 0
                ),
                updated_at = NOW()
            WHERE id = 1
        "#)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        info!("Transferred {} tokens from {} to {} for property {}",
              amount, from_holder_id, to_holder_id, property_id);
        Ok(())
    }

    /// Burn tokens (aligns with burn circuit)
    pub async fn burn_tokens(
        &self,
        from_holder_id: Uuid,
        property_id: Uuid,
        amount: i64,
    ) -> Result<()> {
        if amount <= 0 {
            return Err(anyhow!("Amount must be positive"));
        }

        // Check if token is active
        let global_state = self.get_global_state().await?;
        if global_state.token_state != TokenState::Active {
            return Err(anyhow!("Token is not active"));
        }

        let mut tx = self.db.pool().begin().await?;

        // Check holder balance
        let balance = sqlx::query_scalar::<_, i64>(
            "SELECT balance FROM token_balances WHERE holder_id = $1 AND property_id = $2"
        )
        .bind(from_holder_id)
        .bind(property_id)
        .fetch_optional(&mut *tx)
        .await?
        .unwrap_or(0);

        if balance < amount {
            return Err(anyhow!("Insufficient balance to burn"));
        }

        // Update balance
        sqlx::query(r#"
            UPDATE token_balances
            SET balance = balance - $3, updated_at = NOW()
            WHERE holder_id = $1 AND property_id = $2
        "#)
        .bind(from_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Record burn
        sqlx::query(r#"
            INSERT INTO token_transfers (from_holder_id, to_holder_id, property_id, amount, transfer_type)
            VALUES ($1, $1, $2, $3, 'burn')
        "#)
        .bind(from_holder_id)
        .bind(property_id)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        // Update global state
        sqlx::query(r#"
            UPDATE global_token_state
            SET total_supply = total_supply - $1,
                circulating_supply = circulating_supply - $1,
                nonce = nonce + 1,
                holder_count = (
                    SELECT COUNT(DISTINCT holder_id) FROM token_balances WHERE balance > 0
                ),
                updated_at = NOW()
            WHERE id = 1
        "#)
        .bind(amount)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        info!("Burned {} tokens from holder {} for property {}", amount, from_holder_id, property_id);
        Ok(())
    }

    /// Pause token operations (aligns with pause_token circuit)
    pub async fn pause_token(&self) -> Result<()> {
        sqlx::query(r#"
            UPDATE global_token_state
            SET token_state = 'paused', nonce = nonce + 1, updated_at = NOW()
            WHERE id = 1
        "#)
        .execute(self.db.pool())
        .await?;

        info!("Token operations paused");
        Ok(())
    }

    /// Unpause token operations (aligns with unpause_token circuit)
    pub async fn unpause_token(&self) -> Result<()> {
        let global_state = self.get_global_state().await?;
        if global_state.token_state != TokenState::Paused {
            return Err(anyhow!("Token is not paused"));
        }

        sqlx::query(r#"
            UPDATE global_token_state
            SET token_state = 'active', nonce = nonce + 1, updated_at = NOW()
            WHERE id = 1
        "#)
        .execute(self.db.pool())
        .await?;

        info!("Token operations resumed");
        Ok(())
    }

    /// Get token balance for a holder and property
    pub async fn get_token_balance(&self, holder_id: Uuid, property_id: Uuid) -> Result<i64> {
        let balance = sqlx::query_scalar::<_, i64>(
            "SELECT balance FROM token_balances WHERE holder_id = $1 AND property_id = $2"
        )
        .bind(holder_id)
        .bind(property_id)
        .fetch_optional(self.db.pool())
        .await?
        .unwrap_or(0);

        Ok(balance)
    }

    /// Get global token state
    pub async fn get_global_state(&self) -> Result<GlobalTokenState> {
        let state = sqlx::query_as::<_, GlobalTokenState>(
            "SELECT * FROM global_token_state WHERE id = 1"
        )
        .fetch_one(self.db.pool())
        .await?;

        Ok(state)
    }

    /// Get all transfers for a property
    pub async fn get_property_transfers(&self, property_id: Uuid) -> Result<Vec<TokenTransfer>> {
        let transfers = sqlx::query_as::<_, TokenTransfer>(
            "SELECT * FROM token_transfers WHERE property_id = $1 ORDER BY created_at DESC"
        )
        .bind(property_id)
        .fetch_all(self.db.pool())
        .await?;

        Ok(transfers)
    }
}