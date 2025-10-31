pub mod database;
pub mod models;
pub mod services;
pub mod api;

pub use database::Database;
pub use models::*;
pub use services::RealEstateService;
pub use api::*;

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_database_setup() -> Result<()> {
        // This test requires a running PostgreSQL instance
        // Skip if DATABASE_URL is not set
        if std::env::var("DATABASE_URL").is_err() {
            println!("Skipping database test - DATABASE_URL not set");
            return Ok(());
        }

        let database_url = std::env::var("DATABASE_URL")?;
        let db = Database::new(&database_url).await?;
        db.migrate().await?;

        let service = RealEstateService::new(db);
        
        // Test global state initialization
        let state = service.get_global_state().await?;
        assert_eq!(state.total_supply, 0);
        assert_eq!(state.circulating_supply, 0);
        assert_eq!(state.holder_count, 0);
        assert_eq!(state.token_state, TokenState::Active);

        Ok(())
    }

    #[tokio::test]
    async fn test_token_operations() -> Result<()> {
        if std::env::var("DATABASE_URL").is_err() {
            println!("Skipping token operations test - DATABASE_URL not set");
            return Ok(());
        }

        let database_url = std::env::var("DATABASE_URL")?;
        let db = Database::new(&database_url).await?;
        db.migrate().await?;

        let service = RealEstateService::new(db);

        // Create property
        let property_id = service.create_property(
            "Test Property".to_string(),
            "Test Description".to_string(),
            1000000,
        ).await?;

        // Create holder
        let holder_id = service.create_token_holder(
            "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY".to_string(),
            "Test Holder".to_string(),
        ).await?;

        // Mint tokens
        service.mint_tokens(holder_id, property_id, 1000).await?;

        // Check balance
        let balance = service.get_token_balance(holder_id, property_id).await?;
        assert_eq!(balance, 1000);

        // Check global state
        let state = service.get_global_state().await?;
        assert_eq!(state.total_supply, 1000);
        assert_eq!(state.circulating_supply, 1000);
        assert_eq!(state.holder_count, 1);

        Ok(())
    }
}