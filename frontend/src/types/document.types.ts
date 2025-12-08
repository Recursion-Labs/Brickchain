/**
 * Document Type Definitions
 * Types for storage service documents and document operations
 */

export interface UploadedDocument {
  id: string;           // SHA-256 hex identifier
  cid: string;          // IPFS Content Identifier
  filename: string;     // Original filename
  size: number;         // File size in bytes
  ipfsUrl: string;      // Full IPFS gateway URL
  blockHash: string;    // Blockchain transaction hash
  uploadedAt: number;   // Unix timestamp in milliseconds
  mimeType?: string;    // MIME type (e.g., "application/pdf")
}

export interface DocumentMetadata {
  id: string;                // SHA-256 hex
  filename: string;
  mime: string;
  size_bytes: number;
  cid: string;
  created_at_unix_ms: number;
  sha256?: string;
}

export interface DocumentListResponse {
  success: boolean;
  documents: DocumentMetadata[];
  count: number;
  message?: string;
}

export interface DocumentDeleteResponse {
  success: boolean;
  message: string;
}

export interface DocumentExportResponse {
  sha256: string;
  cid: string;
  size_bytes: number;
  filename: string;
  created_at: number;
}
