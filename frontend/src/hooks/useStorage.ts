'use client';

/**
 * useStorage Hook
 * Simple hook for direct storage operations
 */

import { useState, useCallback } from 'react';
import { storageApiClient } from '@/lib/storage';
import type { StorageUploadResponse } from '@/types/storage.types';

export function useStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<StorageUploadResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await storageApiClient.uploadFile(file);
      setIsLoading(false);
      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      setIsLoading(false);
      return null;
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<StorageUploadResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const responses = await storageApiClient.uploadMultipleFiles(files);
      setIsLoading(false);
      return responses;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      setIsLoading(false);
      return [];
    }
  }, []);

  const checkHealth = useCallback(async () => {
    const healthy = await storageApiClient.healthCheck();
    setIsHealthy(healthy);
    return healthy;
  }, []);

  return {
    isLoading,
    error,
    isHealthy,
    uploadFile,
    uploadMultipleFiles,
    checkHealth,
  };
}
