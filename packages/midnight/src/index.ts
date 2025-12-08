// Main exports for BrickChain Midnight package

// Client
export { BrickChainClient } from "./client/BrickChainClient.js";

// APIs
export { PropertyRegistryAPI } from "./api/PropertyRegistryAPI.js";
export { MarketplaceAPI } from "./api/MarketplaceAPI.js";
export { EscrowAPI } from "./api/EscrowAPI.js";
export { VerificationAPI } from "./api/VerificationAPI.js";
export { FractionalTokenAPI } from "./api/FractionalTokenAPI.js";
export { AccessControlAPI } from "./api/AccessControlAPI.js";
export { AuditLogAPI } from "./api/AuditLogAPI.js";
export { RoleAPI } from "./api/RoleAPI.js";

// Types
export * from "./types/contracts.js";

// Config
export * from "./config/network.js";

// Utils
export * from "./utils/wallet.js";
export * from "./utils/providers.js";

// Deployment
export * from "./deployment/deployer.js";

// Errors
export * from "./errors.js";
