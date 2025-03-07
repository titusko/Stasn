
import { useState, useCallback } from 'react';
import axios from 'axios';

interface UploadOptions {
  name?: string;
  metadata?: Record<string, string>;
}

interface UploadResult {
  ipfsHash: string;
  pinSize: number;
  timestamp: string;
}

export function useIpfsUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const uploadFile = useCallback(async (file: File, options?: UploadOptions) => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options?.name) {
        formData.append('name', options.name);
      }
      
      if (options?.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      const response = await axios.post('/api/ipfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult({
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = 
        axios.isAxiosError(err) 
          ? err.response?.data?.message || err.message
          : 'Upload failed';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setUploadResult(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    error,
    uploadResult,
    reset,
  };
}
