/**
 * Property Library
 * Combines Express property API + Rust storage operations
 */

import { storageApiClient } from './storage';
import { AuthManager } from './auth';
import type { PropertyCreateInput, FileUploadItem, PropertyCreateResult, UploadedDocument } from '@/types/property.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  status: number;
}

// ============================================================================
// DIRECT API CALLS (No apiClient dependency)
// ============================================================================

/**
 * Make request to Express API
 */
async function propertyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeader = AuthManager.getAuthHeader();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    return {
      success: response.ok,
      data: response.ok ? data : undefined,
      message: data.message || data.error || `Request failed with status ${response.status}`,
      status: response.status,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: 'Network error',
      status: 0,
    };
  }
}

/**
 * Upload single file to Rust storage server
 * Returns CID for the file
 */
export async function uploadFileToStorage(file: File): Promise<string | null> {
  try {
    console.log(`Uploading file to storage: ${file.name}`);
    const result = await storageApiClient.uploadFile(file);
    console.log(`✓ File uploaded - CID: ${result.cid}`);
    return result.cid;
  } catch (error) {
    console.error('Storage upload failed:', error);
    return null;
  }
}

/**
 * Upload multiple files to storage
 */
export async function uploadMultipleFilesToStorage(files: File[]) {
  try {
    console.log(`Uploading ${files.length} files to storage...`);
    const results = await storageApiClient.uploadMultipleFiles(files);
    console.log(`✓ Uploaded ${results.length} files`);
    return results;
  } catch (error) {
    console.error('Multiple file upload failed:', error);
    return null;
  }
}

/**
 * Get file metadata from storage
 */
export async function getStorageFileMetadata(fileId: string) {
  try {
    const metadata = await storageApiClient.getFileMetadata(fileId);
    return metadata;
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return null;
  }
}

/**
 * Check if storage server is healthy
 */
export async function checkStorageHealth(): Promise<boolean> {
  try {
    const isHealthy = await storageApiClient.healthCheck();
    console.log(`Storage server health: ${isHealthy ? '✓ UP' : '✗ DOWN'}`);
    return isHealthy;
  } catch (error) {
    console.error('Storage health check failed:', error);
    return false;
  }
}

/**
 * List all documents in storage
 */
export async function listStorageDocuments() {
  try {
    const documents = await storageApiClient.listDocuments();
    return documents;
  } catch (error) {
    console.error('Failed to list storage documents:', error);
    return null;
  }
}

/**
 * Download file from storage
 */
export async function downloadStorageFile(fileId: string): Promise<Blob | null> {
  try {
    const blob = await storageApiClient.downloadFile(fileId);
    return blob;
  } catch (error) {
    console.error('Failed to download storage file:', error);
    return null;
  }
}

/**
 * Delete document from storage
 */
export async function deleteStorageFile(fileId: string) {
  try {
    const result = await storageApiClient.deleteFile(fileId);
    return result;
  } catch (error) {
    console.error('Failed to delete storage file:', error);
    return null;
  }
}

/**
 * Export document metadata for blockchain verification
 */
export async function exportStorageDocumentMetadata(fileId: string) {
  try {
    const metadata = await storageApiClient.exportDocumentMetadata(fileId);
    return metadata;
  } catch (error) {
    console.error('Failed to export storage document metadata:', error);
    return null;
  }
}

// ============================================================================
// PROPERTY API ENDPOINTS (Express Server)
// ============================================================================

/**
 * GET /v1/public/property
 * Get all properties
 */
function getPropertiesEndpoint(): Promise<ApiResponse> {
  return propertyRequest('/v1/public/property');
}

/**
 * POST /v1/admin/property
 * Create new property
 */
function createPropertyEndpoint(data: {
  name: string;
  description: string;
  documentId: string;
  type: string;
  location: string;
  value: number;
  shares: number;
}): Promise<ApiResponse> {
  return propertyRequest('/v1/admin/property', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT /v1/admin/property/:id
 * Update property
 */
function updatePropertyEndpoint(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    documentId: string;
    type: string;
    location: string;
    value: number;
    shares: number;
  }>
): Promise<ApiResponse> {
  return propertyRequest(`/v1/admin/property/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE /v1/admin/property/:id
 * Delete property
 */
function deletePropertyEndpoint(id: string): Promise<ApiResponse> {
  return propertyRequest(`/v1/admin/property/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// PROPERTY OPERATIONS (Express API)
// ============================================================================

/**
 * Get all properties (public)
 */
export async function getProperties() {
  try {
    const response = await getPropertiesEndpoint();
    return response;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return null;
  }
}

/**
 * Create property with Express API
 * Maps storage CIDs to property fields
 */
export async function createProperty(propertyData: PropertyCreateInput & { documents?: string[] }) {
  try {
    // Map new format to existing API schema
    const payload = {
      name: propertyData.title,
      description: propertyData.description,
      documentId: propertyData.documents?.[0] || '', // Use first CID as documentId
      type: propertyData.metadata?.type as string || 'residential',
      location: propertyData.location || '',
      value: propertyData.price || 0,
      shares: propertyData.metadata?.shares as number || 100,
    };

    const response = await createPropertyEndpoint(payload);
    return response;
  } catch (error) {
    console.error('Failed to create property:', error);
    return null;
  }
}

/**
 * Update property
 */
export async function updateProperty(id: string, data: Partial<PropertyCreateInput>) {
  try {
    const response = await updatePropertyEndpoint(id, data);
    return response;
  } catch (error) {
    console.error('Failed to update property:', error);
    return null;
  }
}

/**
 * Delete property
 */
export async function deleteProperty(id: string) {
  try {
    const response = await deletePropertyEndpoint(id);
    return response;
  } catch (error) {
    console.error('Failed to delete property:', error);
    return null;
  }
}

/**
 * Delete property with optional document deletion
 * Combined delete wrapper that can delete both property and its storage documents
 */
export async function deletePropertyWithDocuments(
  propertyId: string,
  deleteDocuments: boolean = false
) {
  try {
    console.log(`\n=== Property Deletion Workflow ===`);
    console.log(`Property ID: ${propertyId}`);
    console.log(`Delete documents: ${deleteDocuments}`);

    // Step 1: Get property details to retrieve documentId
    if (deleteDocuments) {
      console.log('\nStep 1: Fetching property details...');
      const propertiesResponse = await getPropertiesEndpoint();
      
      if (!propertiesResponse?.success || !propertiesResponse?.data) {
        throw new Error('Failed to fetch property details');
      }

      const properties = Array.isArray(propertiesResponse.data) ? propertiesResponse.data : [];
      const property = properties.find((p: Record<string, unknown>) => p.id === propertyId);

      if (!property) {
        throw new Error('Property not found');
      }

      // Step 2: Delete documents from storage if documentId exists
      const documentId = property.documentId as string | undefined;
      if (documentId) {
        console.log(`\nStep 2: Deleting storage documents (${documentId})...`);
        try {
          const storageResult = await deleteStorageFile(documentId);
          if (storageResult) {
            console.log(`✓ Documents deleted from storage`);
          }
        } catch (error) {
          console.warn('Warning: Failed to delete storage documents:', error);
          // Continue with property deletion even if storage deletion fails
        }
      }
    }

    // Step 3: Delete property record from Express API
    console.log('\nStep 3: Deleting property record...');
    const response = await deletePropertyEndpoint(propertyId);

    if (!response?.success) {
      throw new Error(response?.message || 'Failed to delete property');
    }

    console.log(`✓ Property deleted successfully!\n`);

    return {
      success: true,
      message: deleteDocuments
        ? 'Property and documents deleted successfully'
        : 'Property deleted successfully',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Deletion failed: ${msg}\n`);
    return {
      success: false,
      message: msg,
    };
  }
}

// ============================================================================
// COMBINED WORKFLOWS
// ============================================================================

/**
 * Complete workflow: Upload files to storage, then create property with CIDs
 * 1. Upload files to Rust storage server (get CIDs)
 * 2. Create property in Express API with CIDs
 */
export async function createPropertyWithDocuments(
  propertyData: Omit<PropertyCreateInput, 'documents'>,
  files: FileUploadItem[]
): Promise<PropertyCreateResult> {
  try {
    console.log('\n=== Property Creation Workflow ===');
    
    // Step 1: Check storage server health
    console.log('\nStep 1: Checking storage server...');
    const isHealthy = await checkStorageHealth();
    if (!isHealthy) {
      throw new Error('Storage server is not available');
    }

    // Step 2: Upload files to storage
    console.log(`\nStep 2: Uploading ${files.length} files to storage...`);
    const uploadedDocs: UploadedDocument[] = [];
    const cids: string[] = [];

    for (const { file } of files) {
      const cid = await uploadFileToStorage(file);
      if (!cid) {
        throw new Error(`Failed to upload ${file.name}`);
      }
      cids.push(cid);
      uploadedDocs.push({
        cid,
        fileName: file.name,
        size: file.size,
      });
    }

    if (cids.length === 0) {
      throw new Error('No files were successfully uploaded');
    }

    console.log(`\nStep 3: Creating property with ${cids.length} documents...`);
    
    // Step 3: Create property with CIDs
    const response = await createProperty({
      ...propertyData,
      documents: cids,
    });

    if (!response?.success) {
      throw new Error(response?.message || 'Failed to create property');
    }

    const propertyId = (response.data as Record<string, unknown>)?.id as string | undefined;
    console.log(`\n✓ Property created successfully! ID: ${propertyId}\n`);

    return {
      success: true,
      propertyId,
      documents: uploadedDocs,
      message: 'Property created with all documents',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`\n✗ Workflow failed: ${msg}\n`);
    return {
      success: false,
      documents: [],
      message: msg,
    };
  }
}
