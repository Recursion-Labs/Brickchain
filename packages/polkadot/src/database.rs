use anyhow::Result;
use sqlx::{PgPool, Row};
use tracing::{info, warn};

use crate::models::*;

pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        info!("Connecting to database: {}", database_url);
        let pool = PgPool::connect(database_url).await?;
        Ok(Self { pool })
    }

    pub async fn migrate(&self) -> Result<()> {
        info!("Running database migrations");
        
        // Create custom types
        sqlx::query(r#"
            DO $$ BEGIN
                CREATE TYPE token_state AS ENUM ('active', 'paused', 'frozen');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        "#)
        .execute(&self.pool)
        .await?;

        sqlx::query(r#"
            DO $$ BEGIN
                CREATE TYPE property_status AS ENUM ('registered', 'tokenized', 'transferred', 'deactivated');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        "#)
        .execute(&self.pool)
        .await?;

        sqlx::query(r#"
            DO $$ BEGIN
                CREATE TYPE transfer_type AS ENUM ('mint', 'transfer', 'burn');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        "#)
        .execute(&self.pool)
        .await?;

        // Create tables
        self.create_properties_table().await?;
        self.create_token_holders_table().await?;
        self.create_token_balances_table().await?;
        self.create_token_transfers_table().await?;
        self.create_global_token_state_table().await?;
        self.create_property_ownership_table().await?;
        
        // Initialize global state if not exists
        self.initialize_global_state().await?;
        
        info!("Database migrations completed");
        Ok(())
    }

    async fn create_properties_table(&self) -> Result<()> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS properties (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                address TEXT NOT NULL,
                description TEXT,
                value_usd BIGINT NOT NULL,
                status property_status NOT NULL DEFAULT 'registered',
                owner_id UUID,
                token_id BIGINT,
                property_hash BYTEA,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        "#)
        .execute(&self.pool)
        .await?;

        // Create indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)")
            .execute(&self.pool)
            .await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id)")
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn create_token_holders_table(&self) -> Result<()> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS token_holders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                polkadot_address TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        "#)
        .execute(&self.pool)
        .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_token_holders_address ON token_holders(polkadot_address)")
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn create_token_balances_table(&self) -> Result<()> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS token_balances (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                holder_id UUID NOT NULL REFERENCES token_holders(id),
                property_id UUID NOT NULL REFERENCES properties(id),
                balance BIGINT NOT NULL DEFAULT 0,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(holder_id, property_id)
            )
        "#)
        .execute(&self.pool)
        .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_token_balances_holder ON token_balances(holder_id)")
            .execute(&self.pool)
            .await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_token_balances_property ON token_balances(property_id)")
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn create_token_transfers_table(&self) -> Result<()> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS token_transfers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                from_holder_id UUID REFERENCES token_holders(id),
                to_holder_id UUID NOT NULL REFERENCES token_holders(id),
                property_id UUID NOT NULL REFERENCES properties(id),
                amount BIGINT NOT NULL,
                transfer_type transfer_type NOT NULL DEFAULT 'transfer',
                transaction_hash TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        "#)
        .execute(&self.pool)
        .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_token_transfers_from ON token_transfers(from_holder_id)")
            .execute(&self.pool)
            .await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_token_transfers_to ON token_transfers(to_holder_id)")
            .execute(&self.pool)
            .await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_token_transfers_property ON token_transfers(property_id)")
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn create_global_token_state_table(&self) -> Result<()> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS global_token_state (
                id INTEGER PRIMARY KEY DEFAULT 1,
                total_supply BIGINT NOT NULL DEFAULT 0,
                circulating_supply BIGINT NOT NULL DEFAULT 0,
                nonce BIGINT NOT NULL DEFAULT 0,
                token_state token_state NOT NULL DEFAULT 'active',
                holder_count BIGINT NOT NULL DEFAULT 0,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                CONSTRAINT single_row CHECK (id = 1)
            )
        "#)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn create_property_ownership_table(&self) -> Result<()> {
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS property_ownership (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                property_id UUID NOT NULL REFERENCES properties(id),
                previous_owner_id UUID REFERENCES token_holders(id),
                new_owner_id UUID NOT NULL REFERENCES token_holders(id),
                transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                transaction_hash TEXT
            )
        "#)
        .execute(&self.pool)
        .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_property_ownership_property ON property_ownership(property_id)")
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn initialize_global_state(&self) -> Result<()> {
        let exists = sqlx::query("SELECT 1 FROM global_token_state WHERE id = 1")
            .fetch_optional(&self.pool)
            .await?;

        if exists.is_none() {
            sqlx::query(r#"
                INSERT INTO global_token_state (id, total_supply, circulating_supply, nonce, token_state, holder_count)
                VALUES (1, 0, 0, 0, 'active', 0)
            "#)
            .execute(&self.pool)
            .await?;
            info!("Initialized global token state");
        }

        Ok(())
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}