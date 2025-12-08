/**
 * Types Index
 * Central import point for all type definitions
 */

// Property types
export type {
  PropertyCreateInput,
  FileUploadItem,
  UploadedDocument,
  PropertyCreateResult,
} from './property.types';

// Document types
export type {
  UploadedDocument as Document,
  DocumentMetadata,
  DocumentListResponse,
  DocumentDeleteResponse,
  DocumentExportResponse,
} from './document.types';

// Storage types
export type {
  StorageFileMetadata,
  StorageUploadResponse,
  StorageGetResponse,
  StorageListResponse,
  StorageDeleteResponse,
  StorageExportResponse,
} from './storage.types';

// Wallet types
export type {
  WalletProvider,
  WalletState,
  WalletConfig,
  WalletConnectionResult,
  MidnightWalletState,
  MidnightWalletAPI,
  WalletErrorType,
  NetworkConfig,
} from './wallet.types';

export {
  WALLET_ERRORS,
  CARDANO_NETWORKS,
  MIDNIGHT_NETWORKS,
  ETHEREUM_NETWORKS,
} from './wallet.types';
