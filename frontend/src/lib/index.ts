/**
 * Lib Index
 * Central import point for utility functions and services
 */

// API services
export { apiClient } from './api';

// Storage service
export { storageApiClient } from './storage';

// Property utilities - storage operations
export {
  uploadFileToStorage,
  uploadMultipleFilesToStorage,
  getStorageFileMetadata,
  listStorageDocuments,
  downloadStorageFile,
  deleteStorageFile,
  exportStorageDocumentMetadata,
  checkStorageHealth,
} from './property';

// Property utilities - property operations
export {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from './property';

// Property workflows
export { createPropertyWithDocuments } from './property';

// Auth
export { AuthManager } from './auth';

// Utils
export * from './utils';
