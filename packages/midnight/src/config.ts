// Configuration management for BrickChain contracts

export interface NetworkConfig {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
  networkId: string;
}

export interface ContractConfig {
  name: string;
  file: string;
  stateId: string;
  required: boolean;
}

export interface DeploymentConfig {
  contracts: ContractConfig[];
  zkConfigPath: string;
  privateStateBaseName: string;
  initializationOrder: string[];
}

// Network configurations
export const NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    indexer: "https://indexer.testnet-02.midnight.network/api/v1/graphql",
    indexerWS: "wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws",
    node: "https://rpc.testnet-02.midnight.network",
    proofServer: "http://127.0.0.1:6300",
    networkId: "testnet"
  },
  mainnet: {
    indexer: "https://indexer.midnight.network/api/v1/graphql",
    indexerWS: "wss://indexer.midnight.network/api/v1/graphql/ws",
    node: "https://rpc.midnight.network",
    proofServer: "http://127.0.0.1:6300",
    networkId: "mainnet"
  },
  local: {
    indexer: "http://localhost:3001/api/v1/graphql",
    indexerWS: "ws://localhost:3001/api/v1/graphql/ws",
    node: "http://localhost:3000",
    proofServer: "http://127.0.0.1:6300",
    networkId: "local"
  }
};

// Contract deployment configuration
export const DEPLOYMENT_CONFIG: DeploymentConfig = {
  contracts: [
    { name: "main", file: "main/contract/index.cjs", stateId: "brickchainMainState", required: true },
    { name: "property_registry", file: "property_registry/contract/index.cjs", stateId: "propertyRegistryState", required: true },
    { name: "fractional_token", file: "fractional_token/contract/index.cjs", stateId: "fractionalTokenState", required: true },
    { name: "marketplace", file: "marketplace/contract/index.cjs", stateId: "marketplaceState", required: true },
    { name: "verification", file: "verification/contract/index.cjs", stateId: "verificationState", required: true },
    { name: "role", file: "role/contract/index.cjs", stateId: "roleState", required: false },
    { name: "utils", file: "utils/contract/index.cjs", stateId: "utilsState", required: false }
  ],
  zkConfigPath: "managed/brickchain",
  privateStateBaseName: "brickchain",
  initializationOrder: ["main", "role", "property_registry", "fractional_token", "marketplace", "verification"]
};

// Test configuration
export const TEST_CONFIG = {
  contractsDir: 'packages/midnight/contracts',
  buildDir: 'build',
  contractFiles: [
    'main.compact',
    'property_registry.compact',
    'fractional_token.compact',
    'marketplace.compact',
    'verification.compact',
    'role.compact',
    'utils.compact',
    'lib/types.compact'
  ],
  requiredTypes: [
    'PropertyMetadata',
    'PropertyDetails',
    'OwnershipProof',
    'Listing',
    'Escrow',
    'VerificationRequest',
    'VerifiedProof'
  ],
  utilityFunctions: [
    'getCurrentTime',
    'validateAddress',
    'validateAmount',
    'validateShares'
  ],
  contractTests: [
    {
      name: 'property_registry',
      circuits: ['registerProperty', 'initializeRegistry', 'updatePropertyStatus']
    },
    {
      name: 'fractional_token',
      circuits: ['transferShares', 'initializeToken', 'mintShares', 'burnShares']
    },
    {
      name: 'marketplace',
      circuits: ['createListing', 'fulfillListing', 'initializeMarketplace']
    },
    {
      name: 'verification',
      circuits: ['requestVerification', 'verifyProof', 'initializeVerification']
    }
  ]
};

// Fee configuration (in wei/units)
export const FEE_CONFIG = {
  registrationFee: 1000000n,
  transferFee: 1000n,
  marketplaceFee: 250n, // 2.5% in basis points
  verificationFee: 500n,
  maxShares: 1000000,
  minAmount: 1n
};

// Validation limits
export const VALIDATION_LIMITS = {
  maxPropertyNameLength: 100,
  maxLocationLength: 200,
  maxCIDLength: 100,
  maxFileNameLength: 50,
  minValuation: 1000n,
  maxValuation: 1000000000000n, // 1 trillion wei
  maxListingDuration: 365 * 24 * 60 * 60, // 1 year in seconds
  minListingDuration: 24 * 60 * 60 // 1 day in seconds
};

// Get current network configuration
export function getCurrentNetworkConfig(): NetworkConfig {
  const network = process.env.MIDNIGHT_NETWORK || 'testnet';
  const config = NETWORKS[network];
  
  if (!config) {
    throw new Error(`Unknown network: ${network}. Available networks: ${Object.keys(NETWORKS).join(', ')}`);
  }
  
  return config;
}

// Get contract configuration by name
export function getContractConfig(name: string): ContractConfig | undefined {
  return DEPLOYMENT_CONFIG.contracts.find(c => c.name === name);
}

// Get required contracts only
export function getRequiredContracts(): ContractConfig[] {
  return DEPLOYMENT_CONFIG.contracts.filter(c => c.required);
}

// Validate configuration
export function validateConfig(): void {
  // Validate network config
  const networkConfig = getCurrentNetworkConfig();
  if (!networkConfig.indexer || !networkConfig.node) {
    throw new Error('Invalid network configuration: missing required endpoints');
  }
  
  // Validate contract config
  const requiredContracts = getRequiredContracts();
  if (requiredContracts.length === 0) {
    throw new Error('No required contracts configured');
  }
  
  // Validate initialization order
  for (const contractName of DEPLOYMENT_CONFIG.initializationOrder) {
    if (!getContractConfig(contractName)) {
      throw new Error(`Contract '${contractName}' in initialization order not found in contract config`);
    }
  }
}

// Environment-specific overrides
export function getEnvironmentConfig(): Partial<NetworkConfig> {
  return {
    indexer: process.env.MIDNIGHT_INDEXER_URL,
    indexerWS: process.env.MIDNIGHT_INDEXER_WS_URL,
    node: process.env.MIDNIGHT_NODE_URL,
    proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL
  };
}