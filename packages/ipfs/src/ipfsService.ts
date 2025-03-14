
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { Readable } from 'stream';

export interface IPFSUploadOptions {
  name?: string;
  keyvalues?: Record<string, string>;
  pinataMetadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  };
  pinataOptions?: {
    cidVersion?: 0 | 1;
    customPinPolicy?: {
      regions: Array<{
        id: string;
        desiredReplicationCount: number;
      }>;
    };
  };
}

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export class IPFSService {
  private apiUrl: string;
  private jwt: string;

  constructor(jwt: string, apiUrl = 'https://api.pinata.cloud') {
    this.jwt = jwt;
    this.apiUrl = apiUrl;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.jwt}`
    };
  }

  /**
   * Upload a file to IPFS
   * @param file File path or Buffer/ReadableStream
   * @param options Upload options
   * @returns Upload response with IPFS hash
   */
  async uploadFile(
    file: string | Buffer | Readable,
    options: IPFSUploadOptions = {}
  ): Promise<IPFSUploadResponse> {
    try {
      const formData = new FormData();
      
      // Add file to form data
      if (typeof file === 'string') {
        // File path
        formData.append('file', fs.createReadStream(file));
      } else if (Buffer.isBuffer(file)) {
        // Buffer
        formData.append('file', file, { filename: options.name || 'file' });
      } else {
        // ReadableStream
        formData.append('file', file, { filename: options.name || 'file' });
      }

      // Add metadata if provided
      if (options.pinataMetadata) {
        formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata));
      }

      // Add options if provided
      if (options.pinataOptions) {
        formData.append('pinataOptions', JSON.stringify(options.pinataOptions));
      }

      // Make the request to Pinata
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...this.getAuthHeaders(),
            ...formData.getHeaders()
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`IPFS upload failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS
   * @param jsonData The JSON data to upload
   * @param options Upload options
   * @returns Upload response with IPFS hash
   */
  async uploadJSON(
    jsonData: Record<string, any>,
    options: IPFSUploadOptions = {}
  ): Promise<IPFSUploadResponse> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: jsonData,
          pinataMetadata: options.pinataMetadata,
          pinataOptions: options.pinataOptions
        },
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`IPFS JSON upload failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get data for a specific IPFS hash
   * @param ipfsHash The IPFS hash to retrieve
   * @returns The data from IPFS
   */
  async getContent(ipfsHash: string): Promise<any> {
    try {
      // Use public IPFS gateway
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to retrieve IPFS content: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Unpin content from IPFS
   * @param ipfsHash The IPFS hash to unpin
   * @returns Success status
   */
  async unpinContent(ipfsHash: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.apiUrl}/pinning/unpin/${ipfsHash}`,
        {
          headers: this.getAuthHeaders()
        }
      );
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to unpin content: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}

export default IPFSService;
