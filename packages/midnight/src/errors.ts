// Error handling utilities for BrickChain contracts

export enum ErrorCode {
  // Contract Errors
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  CONTRACT_COMPILATION_FAILED = 'CONTRACT_COMPILATION_FAILED',
  CONTRACT_DEPLOYMENT_FAILED = 'CONTRACT_DEPLOYMENT_FAILED',
  CONTRACT_INITIALIZATION_FAILED = 'CONTRACT_INITIALIZATION_FAILED',
  CONTRACT_CALL_FAILED = 'CONTRACT_CALL_FAILED',
  
  // Wallet Errors
  WALLET_CONNECTION_FAILED = 'WALLET_CONNECTION_FAILED',
  WALLET_INSUFFICIENT_BALANCE = 'WALLET_INSUFFICIENT_BALANCE',
  WALLET_TRANSACTION_FAILED = 'WALLET_TRANSACTION_FAILED',
  WALLET_SEED_INVALID = 'WALLET_SEED_INVALID',
  
  // Provider Errors
  PROVIDER_CONFIG_FAILED = 'PROVIDER_CONFIG_FAILED',
  PROVIDER_CONNECTION_FAILED = 'PROVIDER_CONNECTION_FAILED',
  ZK_CONFIG_NOT_FOUND = 'ZK_CONFIG_NOT_FOUND',
  INDEXER_CONNECTION_FAILED = 'INDEXER_CONNECTION_FAILED',
  
  // Validation Errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_SHARES = 'INVALID_SHARES',
  INVALID_PROPERTY_ID = 'INVALID_PROPERTY_ID',
  INVALID_LISTING_ID = 'INVALID_LISTING_ID',
  
  // File System Errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_FAILED = 'FILE_READ_FAILED',
  FILE_WRITE_FAILED = 'FILE_WRITE_FAILED',
  DEPLOYMENT_FILE_INVALID = 'DEPLOYMENT_FILE_INVALID',
  
  // Network Errors
  NETWORK_CONNECTION_FAILED = 'NETWORK_CONNECTION_FAILED',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
  INSUFFICIENT_GAS = 'INSUFFICIENT_GAS',
  
  // Authorization Errors
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  MISSING_ADMIN_ROLE = 'MISSING_ADMIN_ROLE',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  
  // Business Logic Errors
  PROPERTY_ALREADY_EXISTS = 'PROPERTY_ALREADY_EXISTS',
  LISTING_EXPIRED = 'LISTING_EXPIRED',
  INSUFFICIENT_SHARES = 'INSUFFICIENT_SHARES',
  MARKETPLACE_PAUSED = 'MARKETPLACE_PAUSED',
  
  // Unknown Error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class BrickChainError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'BrickChainError';
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack
    };
  }
}

export class ContractError extends BrickChainError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONTRACT_CALL_FAILED, context?: Record<string, any>) {
    super(message, code, context);
    this.name = 'ContractError';
  }
}

export class DeploymentError extends BrickChainError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONTRACT_DEPLOYMENT_FAILED, context?: Record<string, any>) {
    super(message, code, context);
    this.name = 'DeploymentError';
  }
}

export class ValidationError extends BrickChainError {
  constructor(message: string, code: ErrorCode, context?: Record<string, any>) {
    super(message, code, context);
    this.name = 'ValidationError';
  }
}

export class WalletError extends BrickChainError {
  constructor(message: string, code: ErrorCode = ErrorCode.WALLET_CONNECTION_FAILED, context?: Record<string, any>) {
    super(message, code, context);
    this.name = 'WalletError';
  }
}

export class NetworkError extends BrickChainError {
  constructor(message: string, code: ErrorCode = ErrorCode.NETWORK_CONNECTION_FAILED, context?: Record<string, any>) {
    super(message, code, context);
    this.name = 'NetworkError';
  }
}

// Error handler wrapper for async functions
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof BrickChainError) {
        throw error;
      }
      
      const context = errorContext ? { context: errorContext } : undefined;
      throw new BrickChainError(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCode.UNKNOWN_ERROR,
        context
      );
    }
  };
}

// Validation helpers
export function validateAddress(address: string): void {
  if (!address || address === '0x0000000000000000000000000000000000000000' || address.length === 0) {
    throw new ValidationError('Invalid address provided', ErrorCode.INVALID_ADDRESS, { address });
  }
}

export function validateAmount(amount: bigint | number): void {
  const value = typeof amount === 'number' ? BigInt(amount) : amount;
  if (value <= 0n) {
    throw new ValidationError('Amount must be greater than 0', ErrorCode.INVALID_AMOUNT, { amount: value.toString() });
  }
}

export function validateShares(shares: number): void {
  if (shares <= 0 || shares > 1000000) {
    throw new ValidationError('Shares must be between 1 and 1,000,000', ErrorCode.INVALID_SHARES, { shares });
  }
}

export function validatePropertyId(pid: number): void {
  if (!Number.isInteger(pid) || pid <= 0) {
    throw new ValidationError('Property ID must be a positive integer', ErrorCode.INVALID_PROPERTY_ID, { pid });
  }
}

export function validateListingId(listingId: number): void {
  if (!Number.isInteger(listingId) || listingId <= 0) {
    throw new ValidationError('Listing ID must be a positive integer', ErrorCode.INVALID_LISTING_ID, { listingId });
  }
}

export function validateContractAddress(address: string, contractName: string): void {
  if (!address || typeof address !== 'string' || address.length === 0) {
    throw new ContractError(`Invalid contract address for ${contractName}`, ErrorCode.CONTRACT_NOT_FOUND, { 
      contractName, 
      address 
    });
  }
}

// Contract interaction helpers
export function createAuthProof(): string {
  return "true";
}

export function handleContractError(error: any, operation: string): never {
  if (error.message?.includes('require')) {
    throw new ContractError(
      `Contract requirement failed during ${operation}`, 
      ErrorCode.CONTRACT_CALL_FAILED,
      { operation, originalError: error.message }
    );
  }
  
  if (error.message?.includes('Unauthorized')) {
    throw new ContractError(
      `Unauthorized access during ${operation}`, 
      ErrorCode.UNAUTHORIZED_ACCESS,
      { operation, originalError: error.message }
    );
  }
  
  if (error.message?.includes('insufficient')) {
    throw new ContractError(
      `Insufficient resources during ${operation}`, 
      ErrorCode.INSUFFICIENT_SHARES,
      { operation, originalError: error.message }
    );
  }
  
  throw new ContractError(
    `Contract operation failed: ${operation}`, 
    ErrorCode.CONTRACT_CALL_FAILED,
    { operation, originalError: error.message }
  );
}

// Frontend-friendly error mapping
export function mapErrorForFrontend(error: BrickChainError): {
  code: string;
  message: string;
  userMessage: string;
  context?: Record<string, any>;
} {
  const errorMap: Partial<Record<ErrorCode, string>> = {
    [ErrorCode.CONTRACT_NOT_FOUND]: "Contract not found. Please ensure the contract is deployed.",
    [ErrorCode.WALLET_INSUFFICIENT_BALANCE]: "Insufficient wallet balance. Please add funds to continue.",
    [ErrorCode.INVALID_ADDRESS]: "Invalid address format. Please check the address and try again.",
    [ErrorCode.INVALID_AMOUNT]: "Invalid amount. Amount must be greater than 0.",
    [ErrorCode.UNAUTHORIZED_ACCESS]: "Access denied. You don't have permission for this action.",
    [ErrorCode.PROPERTY_ALREADY_EXISTS]: "Property already exists. Please use a different property ID.",
    [ErrorCode.LISTING_EXPIRED]: "This listing has expired and is no longer available.",
    [ErrorCode.MARKETPLACE_PAUSED]: "The marketplace is currently paused. Please try again later.",
    [ErrorCode.NETWORK_CONNECTION_FAILED]: "Network connection failed. Please check your internet connection.",
    [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again or contact support."
  };

  return {
    code: error.code,
    message: error.message,
    userMessage: errorMap[error.code] || errorMap[ErrorCode.UNKNOWN_ERROR] || "An unexpected error occurred. Please try again or contact support.",
    context: error.context
  };
}

// Logging utilities
export function logError(error: BrickChainError): void {
  console.error(`❌ ${error.name}: ${error.message}`);
  if (error.context) {
    console.error('Context:', error.context);
  }
}

export function logSuccess(message: string, data?: any): void {
  console.log(`✅ ${message}`);
  if (data) {
    console.log('Data:', data);
  }
}

export function logWarning(message: string, data?: any): void {
  console.warn(`⚠️  ${message}`);
  if (data) {
    console.warn('Data:', data);
  }
}