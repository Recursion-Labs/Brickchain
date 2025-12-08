// Contract type definitions for BrickChain Midnight contracts

export enum PropertyStatus {
  Registered = 0,
  Verified = 1,
  Tokenized = 2,
  Listed = 3,
  Sold = 4,
  Deactivated = 5,
}

export enum ListingStatus {
  Active = 0,
  Sold = 1,
  Cancelled = 2,
  Expired = 3,
}

export enum EscrowStatus {
  Pending = 0,
  Deposited = 1,
  Released = 2,
  Disputed = 3,
  Cancelled = 4,
  Resolved = 5,
}

export enum VerificationStatus {
  Pending = 0,
  InProgress = 1,
  Approved = 2,
  Rejected = 3,
  Expired = 4,
}

export enum Role {
  USER = 0,
  ADMIN = 1,
  MODERATOR = 2,
}

export enum TokenState {
  Active = 0,
  Paused = 1,
  Frozen = 2,
}

export interface DeploymentInfo {
  contractAddress: string;
  deployedAt: string;
  networkId: string;
  deployer: string;
}

export interface ContractAddresses {
  main: string;
  propertyRegistry: string;
  marketplace: string;
  escrow: string;
  verification: string;
  role: string;
  accessControl: string;
  auditLog: string;
  fractionalToken: string;
}

export interface PropertyData {
  propertyId: string;
  owner: string;
  status: PropertyStatus;
  valuation: bigint;
  locationHash: string;
  documentHash: string;
}

export interface ListingData {
  listingId: string;
  propertyId: string;
  seller: string;
  price: bigint;
  status: ListingStatus;
  timestamp: bigint;
  duration: bigint;
}

export interface EscrowData {
  escrowId: string;
  listingId: string;
  buyer: string;
  seller: string;
  amount: bigint;
  status: EscrowStatus;
  createdAt: bigint;
  releasedAt?: bigint;
}

export interface VerificationRequest {
  requestId: string;
  propertyId: string;
  requester: string;
  status: VerificationStatus;
  documentHash: string;
  timestamp: bigint;
  verifier?: string;
  resultHash?: string;
}
