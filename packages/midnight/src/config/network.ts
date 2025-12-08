// Network configuration for Midnight Testnet

export const TESTNET_CONFIG = {
  indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
  indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
  node: "https://rpc.testnet-02.midnight.network",
  proofServer: "http://127.0.0.1:6300",
} as const;

export const NETWORK_IDS = {
  testnet: "TestNet",
  mainnet: "MainNet",
} as const;

export const CONTRACT_NAMES = [
  "main",
  "propertyRegistry",
  "marketplace",
  "escrow",
  "verification",
  "role",
  "accessControl",
  "auditLog",
  "fractionalToken",
] as const;

export type ContractName = (typeof CONTRACT_NAMES)[number];

export const CONTRACT_PATHS: Record<ContractName, string> = {
  main: "build/main",
  propertyRegistry: "build/property_registry",
  marketplace: "build/marketplace",
  escrow: "build/escrow",
  verification: "build/verification",
  role: "build/role",
  accessControl: "build/accessControl",
  auditLog: "build/auditLog",
  fractionalToken: "build/fractional_token",
};
