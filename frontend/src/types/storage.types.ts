/**
 * Storage Types
 * All storage server related types
 */

export interface StorageFileMetadata {
  id_hex: string;
  filename: string;
  mime: string;
  size_bytes: number;
  cid: string;
  created_at_unix_ms: number;
}

export interface StorageUploadResponse {
  success: boolean;
  id: string;
  sha256: number[];  // Array of bytes
  cid: string | null;
  size_bytes: number;
  block_hash?: string | null;
  message: string;
}

export interface StorageListResponse {
  success: boolean;
  documents: StorageFileMetadata[];
  count: number;
}

export interface StorageGetResponse {
  success: boolean;
  metadata?: StorageFileMetadata;
  message: string;
}

export interface StorageDeleteResponse {
  success: boolean;
  message: string;
}

export interface StorageExportResponse {
  sha256: string;
  cid: string;
  size_bytes: number;
  filename: string;
  created_at: number;
}
