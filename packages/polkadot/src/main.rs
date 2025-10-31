use anyhow::Result;
use tracing::{info, warn};
use tracing_subscriber;

mod database;
mod models;
mod services;

use database::Database;
use services::RealEstateService;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::init();
    
    info!("Starting Polkadot Real Estate Database Service");
    
    // Initialize database connection
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://localhost/polkadot_realestate".to_string());
    
    let db = Database::new(&database_url).await?;
    
    // Run migrations
    db.migrate().await?;
    
    // Initialize service
    let service = RealEstateService::new(db);
    
    // Example usage demonstrating contract alignment
    demo_real_estate_operations(&service).await?;
    
    info!("Database service initialized successfully");
    Ok(())
}

async fn demo_real_estate_operations(service: &RealEstateService) -> Result<()> {
    info!("Running real estate operations demo");
    
    // Create a property (aligns with register_property circuit)
    let property_id = service.create_property(
        "123 Main St, City, State".to_string(),
        "Single family home, 3BR/2BA".to_string(),
        1_000_000, // $1M property value
    ).await?;
    
    info!("Created property with ID: {}", property_id);
    
    // Create token holder (aligns with mint circuit)
    let holder_id = service.create_token_holder(
        "0x1234567890abcdef".to_string(), // Polkadot address
        "John Doe".to_string(),
    ).await?;
    
    info!("Created token holder with ID: {}", holder_id);
    
    // Mint tokens (aligns with mint circuit)
    service.mint_tokens(holder_id, property_id, 1000).await?;
    info!("Minted 1000 tokens for property {} to holder {}", property_id, holder_id);
    
    // Transfer tokens (aligns with transfer circuit)
    let recipient_id = service.create_token_holder(
        "0xabcdef1234567890".to_string(),
        "Jane Smith".to_string(),
    ).await?;
    
    service.transfer_tokens(holder_id, recipient_id, property_id, 300).await?;
    info!("Transferred 300 tokens from {} to {}", holder_id, recipient_id);
    
    // Check balances
    let balance = service.get_token_balance(holder_id, property_id).await?;
    info!("Holder {} balance: {}", holder_id, balance);
    
    let recipient_balance = service.get_token_balance(recipient_id, property_id).await?;
    info!("Recipient {} balance: {}", recipient_id, recipient_balance);
    
    // Update property status (aligns with tokenize_property circuit)
    service.update_property_status(property_id, models::PropertyStatus::Tokenized).await?;
    info!("Updated property {} status to Tokenized", property_id);
    
    Ok(())
}