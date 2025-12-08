'use client';

/**
 * usePropertyUpload Hook
 * Simple hook for property creation with file uploads
 */

import { useState } from 'react';
import { createPropertyWithDocuments, uploadFileToStorage } from '@/lib/property';
import type { PropertyCreateInput, FileUploadItem, PropertyCreateResult } from '@/types/property.types';

export function usePropertyUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const createProperty = async (
    propertyData: PropertyCreateInput,
    files: FileUploadItem[]
  ): Promise<PropertyCreateResult> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await createPropertyWithDocuments(propertyData, files);

    if (result.success) {
      setSuccess(true);
      setPropertyId(result.propertyId || null);
    } else {
      setError(result.message);
    }

    setIsLoading(false);
    return result;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    const cid = await uploadFileToStorage(file);

    if (!cid) {
      setError('Failed to upload file');
    }

    setIsLoading(false);
    return cid;
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
    setPropertyId(null);
  };

  return {
    isLoading,
    error,
    success,
    propertyId,
    createProperty,
    uploadFile,
    reset,
  };
}
