use anyhow::{anyhow, Result};
use chrono::Utc;
use sqlx::Row;
use tracing::{info, warn};
use uuid::Uuid;

use crate::database::Database;
use crate::models::*;

pub struct RealEstateService {
    db: Database,
}

impl RealEstateService {
    pub fn new(db: Database) -> Self {
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

        self.increment_nonce().await?;
        info!("Updated property {} status to {:?}", property_id, status);
        Ok(())
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

    /// Get property by ID
    pub async fn get_property(&self, property_id: Uuid) -> Result<Property> {
        let property = sqlx::query_as::<_, Property>(
            "SELECT * FROM properties WHERE id = $1"
        )
        .bind(property_id)
        .fetch_one(self.db.pool())
        .await?;

        Ok(property)
    }

    /// Get token holder by ID
    pub async fn get_token_holder(&self, holder_id: Uuid) -> Result<TokenHolder> {
        let holder = sqlx::query_as::<_, TokenHolder>(
            "SELECT * FROM token_holders WHERE id = $1"
        )
        .bind(holder_id)
        .fetch_one(self.db.pool())
        .await?;

        Ok(holder)
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

    /// Helper to increment nonce
    async fn increment_nonce(&self) -> Result<()> {
        sqlx::query("UPDATE global_token_state SET nonce = nonce + 1, updated_at = NOW() WHERE id = 1")
            .execute(self.db.pool())
            .await?;
        Ok(())
    }
}