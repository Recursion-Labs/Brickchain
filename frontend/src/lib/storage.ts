/**
 * Storage API Client
 * Complete implementation of all Rust storage server endpoints
 * 
 * Endpoints:
 *  POST   /api/store              → Upload PDF (auto IPFS + blockchain)
 *  GET    /api/docs               → List all documents
 *  GET    /api/docs/:id           → Get document metadata
 *  GET    /api/docs/:id/download  → Download PDF file
 *  DELETE /api/docs/:id           → Delete document
 *  GET    /api/docs/:id/export    → Export on-chain JSON
 *  GET    /health                 → Health check
 */

import type {
  StorageUploadResponse,
  StorageListResponse,
  StorageDeleteResponse,
  StorageExportResponse,
} from '@/types/storage.types';

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://localhost:3020';

/**
 * Convert bytes array to hex string
 */
function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

class StorageApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * POST /api/store
   * Upload a file to the storage server
   * Auto pins to IPFS and publishes to blockchain
   */
  async uploadFile(file: File): Promise<StorageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log(`[Storage] Uploading file: ${file.name} (${file.size} bytes) to ${this.baseURL}/api/store`);
      
      const response = await fetch(`${this.baseURL}/api/store`, {
        method: 'POST',
        body: formData,
      });

      console.log(`[Storage] Response status: ${response.status}, OK: ${response.ok}`);

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`[Storage] Error response body: ${responseText}`);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || `HTTP ${response.status}` };
        }
        
        throw new Error(
          errorData.message || errorData.error || `Upload failed with status ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`[Storage] Upload response:`, data);

      // Handle case where response is empty or has no success flag
      if (!data || typeof data !== 'object') {
        console.warn('[Storage] Empty or invalid response body:', data);
        throw new Error('Storage server returned empty response - file may have been uploaded but cannot verify');
      }

      if (!data.success && !data.id) {
        throw new Error(data.message || 'Upload failed');
      }

      // Check if response has required fields
      if (!data.id) {
        console.warn('[Storage] Response missing id:', data);
        throw new Error('Storage server returned incomplete response - missing file id');
      }

      return {
        success: true,
        id: typeof data.id === 'string' ? data.id : bytesToHex(data.id),
        sha256: data.sha256,
        cid: data.cid,
        size_bytes: data.size_bytes,
        block_hash: data.block_hash,
        message: data.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Storage] Upload error:', errorMessage);
      console.error('[Storage] Base URL:', this.baseURL);
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple files
   * Makes separate requests for each file
   */
  async uploadMultipleFiles(
    files: File[]
  ): Promise<StorageUploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Multiple file upload error:', errorMessage);
      throw new Error(`Failed to upload files: ${errorMessage}`);
    }
  }

  /**
   * GET /api/docs
   * List all stored documents
   */
  async listDocuments(): Promise<StorageListResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/docs`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to list documents: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('List documents error:', errorMessage);
      return null;
    }
  }

  /**
   * GET /api/docs/:id
   * Get document metadata by ID (SHA256 hex)
   */
  async getFileMetadata(fileId: string): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/api/docs/${fileId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Get metadata error:', errorMessage);
      throw new Error(`Failed to get file metadata: ${errorMessage}`);
    }
  }

  /**
   * GET /api/docs/:id/download
   * Download the PDF file
   */
  async downloadFile(fileId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/docs/${fileId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Download file error:', errorMessage);
      return null;
    }
  }

  /**
   * DELETE /api/docs/:id
   * Delete document by ID
   */
  async deleteFile(fileId: string): Promise<StorageDeleteResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/docs/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Delete file error:', errorMessage);
      return null;
    }
  }

  /**
   * GET /api/docs/:id/export
   * Export document metadata for blockchain verification
   */
  async exportDocumentMetadata(fileId: string): Promise<StorageExportResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/docs/${fileId}/export`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to export metadata: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Export metadata error:', errorMessage);
      return null;
    }
  }

  /**
   * Pin a document to IPFS via Express API
   * POST /v1/admin/documents/:id/pin
   */
  async pinDocumentToIPFS(fileId: string): Promise<{ cid: string; ipfsUrl: string }> {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const url = `${apiBaseUrl}/v1/admin/documents/${fileId}/pin`;
      const token = this.getAccessToken();
      
      console.log(`[Storage] Pinning to IPFS:`, {
        url,
        fileId,
        hasToken: !!token,
        tokenLength: token?.length || 0,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`[Storage] Pin response status: ${response.status}, OK: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Storage] Pin error response:`, errorText);
        throw new Error(`Failed to pin document: ${response.statusText} (${errorText})`);
      }

      const data = await response.json();
      console.log(`[Storage] Pin response data:`, data);
      
      return { cid: data.cid, ipfsUrl: data.ipfsUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Storage] Pin to IPFS error:', errorMessage);
      throw new Error(`Failed to pin to IPFS: ${errorMessage}`);
    }
  }

  /**
   * Get access token from cookies
   */
  private getAccessToken(): string {
    if (typeof window === 'undefined') return '';
    
    // Parse cookies to get access token
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'accessToken') {
        return decodeURIComponent(value);
      }
    }
    
    return '';
  }

  /**
   * GET /health
   * Health check for storage server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Storage server health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageApiClient = new StorageApiClient(STORAGE_BASE_URL);
