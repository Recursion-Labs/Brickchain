pub mod property;
pub mod token;
pub mod holder;
pub mod global_state;

pub use property::PropertyService;
pub use token::TokenService;
pub use holder::TokenHolderService;
pub use global_state::GlobalStateService;

use std::sync::Arc;
use crate::database::Database;

pub struct RealEstateService {
    pub property: PropertyService,
    pub token: TokenService,
    pub holder: TokenHolderService,
    pub global_state: GlobalStateService,
}

impl RealEstateService {
    pub fn new(db: Database) -> Self {
        let db = Arc::new(db);
        Self {
            property: PropertyService::new(db.clone()),
            token: TokenService::new(db.clone()),
            holder: TokenHolderService::new(db.clone()),
            global_state: GlobalStateService::new(db),
        }
    }

    // Delegate methods for backward compatibility
    pub async fn create_property(
        &self,
        address: String,
        description: String,
        value_usd: i64,
    ) -> anyhow::Result<uuid::Uuid> {
        self.property.create_property(address, description, value_usd).await
    }

    pub async fn update_property_status(
        &self,
        property_id: uuid::Uuid,
        status: crate::models::PropertyStatus,
    ) -> anyhow::Result<()> {
        self.property.update_property_status(property_id, status).await?;
        self.global_state.increment_nonce().await
    }

    pub async fn create_token_holder(
        &self,
        polkadot_address: String,
        name: String,
    ) -> anyhow::Result<uuid::Uuid> {
        self.holder.create_token_holder(polkadot_address, name).await
    }

    pub async fn mint_tokens(
        &self,
        to_holder_id: uuid::Uuid,
        property_id: uuid::Uuid,
        amount: i64,
    ) -> anyhow::Result<()> {
        self.token.mint_tokens(to_holder_id, property_id, amount).await
    }

    pub async fn transfer_tokens(
        &self,
        from_holder_id: uuid::Uuid,
        to_holder_id: uuid::Uuid,
        property_id: uuid::Uuid,
        amount: i64,
    ) -> anyhow::Result<()> {
        self.token.transfer_tokens(from_holder_id, to_holder_id, property_id, amount).await
    }

    pub async fn get_token_balance(&self, holder_id: uuid::Uuid, property_id: uuid::Uuid) -> anyhow::Result<i64> {
        self.token.get_token_balance(holder_id, property_id).await
    }

    pub async fn get_global_state(&self) -> anyhow::Result<crate::models::GlobalTokenState> {
        self.token.get_global_state().await
    }

}