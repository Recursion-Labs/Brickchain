/**
 * Property Types
 * Simple frontend type definitions
 */

export interface PropertyCreateInput {
  title: string;
  description: string;
  location?: string;
  price?: number;
  currency?: string;
  documents?: string[]; // CIDs from storage
  metadata?: Record<string, unknown>;
}

export interface FileUploadItem {
  file: File;
  description?: string;
}

export interface UploadedDocument {
  cid: string;
  fileName: string;
  size: number;
}

export interface PropertyCreateResult {
  success: boolean;
  propertyId?: string;
  documents: UploadedDocument[];
  message: string;
}
