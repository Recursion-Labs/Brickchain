// Wallet types and interfaces for multi-provider wallet integration

export type WalletProvider = 'metamask' | 'walletconnect' | 'lace' | 'midnight';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: WalletProvider | null;
  chainId?: string | number;
  balance?: string;
  isConnecting: boolean;
  error: string | null;
  // Extended Midnight wallet state (from create-midnight-dapp)
  walletState?: MidnightWalletState;
  providerName?: string;
  walletName?: string;
  apiVersion?: string;
  capabilities?: {
    walletTransfer?: boolean;
    coinEnum?: boolean;
  };
}

export interface WalletConfig {
  provider: WalletProvider;
  name: string;
  icon: string;
  description: string;
  supportedChains?: string[];
  isInstalled?: boolean;
}

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  error?: string;
  provider?: WalletProvider;
  // Extended fields for detailed wallet state
  walletState?: MidnightWalletState;
  providerName?: string;
  walletName?: string;
  apiVersion?: string;
  capabilities?: {
    walletTransfer?: boolean;
    coinEnum?: boolean;
  };
}

export interface MidnightWalletState {
  address: string;
  addressLegacy?: string;
  coinPublicKey: string;
  coinPublicKeyLegacy?: string;
  encryptionPublicKey: string;
  encryptionPublicKeyLegacy?: string;
  balance?: string;
  balances?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MidnightWalletAPI {
  state(): Promise<WalletState>;
  submitTransaction(tx: Record<string, unknown>): Promise<string>;
  isEnabled(): Promise<boolean>;
  enable(): Promise<MidnightWalletAPI>;
  walletName?: string;
  apiVersion?: string;
  providerName?: string;
}

// Error types
export const WALLET_ERRORS = {
  NOT_INSTALLED: 'WALLET_NOT_INSTALLED',
  NOT_ENABLED: 'WALLET_NOT_ENABLED',
  CONNECTION_REJECTED: 'CONNECTION_REJECTED',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  USER_REJECTED: 'USER_REJECTED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type WalletErrorType = typeof WALLET_ERRORS[keyof typeof WALLET_ERRORS];

// Wallet detection functions
export interface WalletDetector {
  isInstalled(): boolean;
  getProvider(): Record<string, unknown> | null;
  getName(): string;
  getIcon(): string;
}

// Network configurations
export interface NetworkConfig {
  chainId: string | number;
  name: string;
  rpcUrl?: string;
  blockExplorerUrl?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Cardano network config
export const CARDANO_NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    chainId: 1,
    name: 'Cardano Mainnet',
    blockExplorerUrl: 'https://cardanoscan.io',
    nativeCurrency: {
      name: 'ADA',
      symbol: 'ADA',
      decimals: 6,
    },
  },
  testnet: {
    chainId: 0,
    name: 'Cardano Testnet',
    blockExplorerUrl: 'https://preprod.cardanoscan.io',
    nativeCurrency: {
      name: 'tADA',
      symbol: 'tADA',
      decimals: 6,
    },
  },
};

// Midnight network config
export const MIDNIGHT_NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    chainId: 'midnight-testnet',
    name: 'Midnight Testnet',
    nativeCurrency: {
      name: 'tDUST',
      symbol: 'tDUST',
      decimals: 8,
    },
  },
};

// Ethereum network config (for MetaMask)
export const ETHEREUM_NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};