import axios from 'axios';

const STORAGE_API_URL = process.env.NEXT_PUBLIC_STORAGE_API_URL || 'http://localhost:3020';
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export interface StorageResponse {
  success: boolean;
  id: string;
  sha256: string;
  cid: string;
  size_bytes: number;
  block_hash?: string;
  filename: string;
  timestamp: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  sha256: string;
  cid: string;
  size_bytes: number;
  block_hash?: string;
  timestamp: string;
}

class StorageService {
  /**
   * Upload a document directly to the Rust storage server
   * Automatically stores in: Local DB + IPFS + Blockchain
   */
  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<StorageResponse> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type (allow PDFs and common formats)
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/octet-stream'];
      if (!validTypes.some(type => file.type.includes(type.split('/')[0])) && !file.name.endsWith('.pdf')) {
        throw new Error('Only PDF and image files are supported');
      }

      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Remove trailing slash to avoid double slashes
      const baseUrl = STORAGE_API_URL.replace(/\/$/, '');
      console.log(`[Storage] Uploading ${file.name} to ${baseUrl}/api/store`);

      const response = await axios.post<any>(
        `${baseUrl}/api/store`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Add ngrok bypass header if using ngrok
            ...(STORAGE_API_URL.includes('ngrok') && {
              'ngrok-skip-browser-warning': 'true'
            }),
          },
          onUploadProgress: (progressEvent: any) => {
            if (onProgress && progressEvent.total) {
              const percentComplete = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentComplete);
            }
          },
          timeout: 300000, // 5 minutes timeout
        }
      );

      if (!response.data.success) {
        throw new Error('Upload failed: ' + JSON.stringify(response.data));
      }

      console.log(`[Storage] Upload successful:`, {
        id: response.data.id,
        cid: response.data.cid,
        blockHash: response.data.block_hash,
        sizeBytes: response.data.size_bytes,
      });

      return {
        success: response.data.success,
        id: response.data.id,
        sha256: response.data.sha256,
        cid: response.data.cid,
        size_bytes: response.data.size_bytes,
        block_hash: response.data.block_hash,
        filename: file.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Storage] Upload error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Upload failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get document metadata from storage server
   */
  async getDocument(documentId: string): Promise<DocumentMetadata | null> {
    try {
      const baseUrl = STORAGE_API_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/docs/${documentId}`, {
        headers: {
          ...(STORAGE_API_URL.includes('ngrok') && {
            'ngrok-skip-browser-warning': 'true'
          }),
        },
      });
      
      if (!response.data.success || !response.data.metadata) {
        return null;
      }

      const meta = response.data.metadata;
      return {
        id: meta.id_hex,
        filename: meta.filename,
        sha256: meta.id_hex,
        cid: meta.cid,
        size_bytes: meta.size_bytes,
        timestamp: new Date(meta.created_at_unix_ms).toISOString(),
      };
    } catch (error) {
      console.error('[Storage] Get document error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Download document from storage server
   * Returns the download URL
   */
  getDownloadUrl(documentId: string): string {
    const baseUrl = STORAGE_API_URL.replace(/\/$/, '');
    return `${baseUrl}/api/docs/${documentId}/download`;
  }

  /**
   * Delete a document from storage
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      console.log(`[Storage] Deleting document ${documentId}`);
      const baseUrl = STORAGE_API_URL.replace(/\/$/, '');
      const response = await axios.delete(`${baseUrl}/api/docs/${documentId}`, {
        headers: {
          ...(STORAGE_API_URL.includes('ngrok') && {
            'ngrok-skip-browser-warning': 'true'
          }),
        },
      });
      
      if (!response.data.success) {
        throw new Error('Delete failed: ' + response.data.message);
      }
      
      console.log(`[Storage] Document deleted successfully`);
    } catch (error) {
      console.error('[Storage] Delete error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * List all documents from storage server
   */
  async listDocuments(): Promise<DocumentMetadata[]> {
    try {
      const baseUrl = STORAGE_API_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/api/docs`, {
        headers: {
          ...(STORAGE_API_URL.includes('ngrok') && {
            'ngrok-skip-browser-warning': 'true'
          }),
        },
      });
      
      if (!response.data.success) {
        return [];
      }

      return response.data.documents.map((doc: any): DocumentMetadata => ({
        id: doc.id_hex,
        filename: doc.filename,
        sha256: doc.id_hex,
        cid: doc.cid,
        size_bytes: doc.size_bytes,
        timestamp: new Date(doc.created_at_unix_ms).toISOString(),
      }));
    } catch (error) {
      console.error('[Storage] List documents error:', error);
      return [];
    }
  }

  /**
   * Get IPFS gateway URL for a document
   * Allows anyone to access the document from IPFS
   */
  getIPFSUrl(cid: string): string {
    return `${IPFS_GATEWAY}/${cid}`;
  }

  /**
   * Health check for storage server
   */
  async checkHealth(): Promise<boolean> {
    try {
      const baseUrl = STORAGE_API_URL.replace(/\/$/, '');
      const response = await axios.get(`${baseUrl}/health`, {
        timeout: 5000,
        headers: {
          ...(STORAGE_API_URL.includes('ngrok') && {
            'ngrok-skip-browser-warning': 'true'
          }),
        },
      });
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      console.warn('[Storage] Health check failed:', error);
      return false;
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export const storageService = new StorageService();
