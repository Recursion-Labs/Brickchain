/**
 * IPFS Pinning Service
 * Handles pinning files to local IPFS node
 */

import axios from 'axios';
import FormData from 'form-data';

class IPFSPinningService {
  private ipfsApiUrl: string;
  private ipfsGatewayUrl: string;
  private storageServiceUrl: string;

  constructor() {
    // Use local IPFS node in Docker or localhost
    this.ipfsApiUrl = process.env.IPFS_API_URL || 'http://localhost:5001';
    this.ipfsGatewayUrl = process.env.IPFS_GATEWAY_URL || 'http://localhost:8080/ipfs';
    this.storageServiceUrl = process.env.STORAGE_SERVICE_URL || 'http://localhost:3020';
  }

  /**
   * Pin a file to local IPFS node
   * @param fileId - SHA256 hash of the file
   * @returns CID of the pinned file
   */
  async pinFileToIPFS(fileId: string): Promise<string> {
    try {
      console.log(`[IPFS] Starting pinning process for file: ${fileId}`);
      console.log(`[IPFS] Storage service URL: ${this.storageServiceUrl}`);
      console.log(`[IPFS] IPFS API URL: ${this.ipfsApiUrl}`);

      // Step 1: Download file from storage service
      console.log(`[IPFS] Step 1: Downloading file from storage...`);
      const fileBuffer = await this.downloadFileFromStorage(fileId);
      console.log(`[IPFS] Downloaded ${fileBuffer.length} bytes`);
      
      // Step 2: Add to IPFS (automatically pins)
      console.log(`[IPFS] Step 2: Adding file to IPFS...`);
      const cid = await this.addFileToIPFS(fileBuffer, fileId);
      console.log(`[IPFS] Got CID: ${cid}`);
      
      // Step 3: Ensure file is pinned recursively
      console.log(`[IPFS] Step 3: Ensuring recursive pinning...`);
      await this.ensurePinned(cid);
      
      console.log(`[IPFS] Successfully pinned file ${fileId} with CID: ${cid}`);
      return cid;
    } catch (error) {
      console.error(`[IPFS] Pinning failed for file ${fileId}:`, error);
      throw new Error(`Failed to pin file to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Download file from storage service
   */
  private async downloadFileFromStorage(fileId: string): Promise<Buffer> {
    try {
      const url = `${this.storageServiceUrl}/api/docs/${fileId}/download`;
      console.log(`[IPFS] Downloading from: ${url}`);
      
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      console.log(`[IPFS] Download successful, got ${response.data.length} bytes`);
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`[IPFS] Download failed:`, error);
      throw new Error(`Failed to download file from storage service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Add file to local IPFS node
   */
  private async addFileToIPFS(fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, `${filename}.pdf`);

      const url = `${this.ipfsApiUrl}/api/v0/add`;
      console.log(`[IPFS] Adding file to IPFS at: ${url}`);

      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
        params: {
          progress: false,
          wrap: false,
        },
        responseType: 'text', // Explicitly request text response to avoid auto-parsing
      });

      console.log(`[IPFS] Response type: ${typeof response.data}, is Buffer: ${Buffer.isBuffer(response.data)}`);

      // IPFS returns newline-delimited JSON
      let responseText: string;
      if (typeof response.data === 'string') {
        responseText = response.data;
      } else if (Buffer.isBuffer(response.data)) {
        responseText = response.data.toString('utf-8');
      } else if (typeof response.data === 'object') {
        // If it's already parsed as an object, it's the single IPFS response
        const lastLine = response.data as any;
        if (!lastLine.Hash) {
          throw new Error('No IPFS hash returned');
        }
        console.log(`[IPFS] File added to IPFS with CID: ${lastLine.Hash}`);
        return lastLine.Hash;
      } else {
        responseText = String(response.data);
      }
      
      const lines = responseText.trim().split('\n');
      const lastLine = JSON.parse(lines[lines.length - 1]);

      if (!lastLine.Hash) {
        throw new Error('No IPFS hash returned');
      }

      console.log(`[IPFS] File added to IPFS with CID: ${lastLine.Hash}`);
      return lastLine.Hash;
    } catch (error) {
      console.error(`[IPFS] Add to IPFS failed:`, error);
      throw new Error(`Failed to add file to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Ensure file is pinned recursively
   */
  private async ensurePinned(cid: string): Promise<void> {
    try {
      await axios.post(
        `${this.ipfsApiUrl}/api/v0/pin/add`,
        {},
        {
          params: {
            arg: cid,
            recursive: true,
          },
        }
      );
      console.log(`[IPFS] CID ${cid} pinned recursively`);
    } catch (error: any) {
      // If already pinned, axios will throw - this is ok
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          console.log(`[IPFS] CID ${cid} already pinned`);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get IPFS gateway URL for a CID
   */
  getIPFSUrl(cid: string): string {
    return `${this.ipfsGatewayUrl}/${cid}`;
  }

  /**
   * List all pinned objects
   */
  async listPinnedObjects(): Promise<string[]> {
    try {
      const response = await axios.post(
        `${this.ipfsApiUrl}/api/v0/pin/ls`,
        {},
        {
          responseType: 'text', // Explicitly request text response
        }
      );

      // Response is newline-delimited JSON
      let responseText: string;
      if (typeof response.data === 'string') {
        responseText = response.data;
      } else if (Buffer.isBuffer(response.data)) {
        responseText = response.data.toString('utf-8');
      } else {
        responseText = String(response.data);
      }
      
      const lines = responseText.trim().split('\n');
      const cids: string[] = [];
      
      for (const line of lines) {
        if (line.trim()) {
          const obj = JSON.parse(line);
          if (obj.Keys) {
            cids.push(...Object.keys(obj.Keys));
          }
        }
      }

      return cids;
    } catch (error) {
      console.error('[IPFS] Failed to list pinned objects:', error);
      return [];
    }
  }

  /**
   * Unpin a file from IPFS
   */
  async unpinFile(cid: string): Promise<void> {
    try {
      await axios.post(
        `${this.ipfsApiUrl}/api/v0/pin/rm`,
        {},
        {
          params: {
            arg: cid,
            recursive: true,
          },
        }
      );
      console.log(`[IPFS] Unpinned CID: ${cid}`);
    } catch (error) {
      console.error(`[IPFS] Failed to unpin ${cid}:`, error);
      throw error;
    }
  }
}

export const ipfsPinningService = new IPFSPinningService();
