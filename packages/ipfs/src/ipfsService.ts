
import axios from 'axios';

export interface IPFSUploadOptions {
  name?: string;
  pinataMetadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  };
  pinataOptions?: {
    cidVersion?: 0 | 1;
  };
}

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

class IPFSService {
  private apiUrl: string;
  private jwt: string;
  private gateway: string;

  constructor(jwt: string, apiUrl = 'https://api.pinata.cloud', gateway = 'https://gateway.pinata.cloud') {
    this.jwt = jwt;
    this.apiUrl = apiUrl;
    this.gateway = gateway;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.jwt}`
    };
  }

  /**
   * Upload a file to IPFS
   * @param file File object (browser) or path/buffer (Node.js)
   * @param options Upload options
   * @returns Upload response with IPFS hash
   */
  async uploadFile(
    file: File | string | Buffer | any,
    options: IPFSUploadOptions = {}
  ): Promise<IPFSUploadResponse> {
    try {
      const formData = new FormData();
      
      // Add file to form data
      if (typeof File !== 'undefined' && file instanceof File) {
        // Browser File object
        formData.append('file', file);
      } else if (typeof file === 'string') {
        // In browser context, this won't work - but kept for Node.js compatibility
        throw new Error('String file paths are only supported in Node.js environment');
      } else {
        // Buffer or other
        formData.append('file', file, { filename: options.name || 'file' });
      }

      // Add metadata if provided
      if (options.pinataMetadata) {
        formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata));
      } else if (file instanceof File) {
        // Add default metadata for browser File objects
        const metadata = {
          name: file.name,
          keyvalues: {
            size: file.size.toString(),
            type: file.type,
          }
        };
        formData.append('pinataMetadata', JSON.stringify(metadata));
      }

      // Add options if provided
      if (options.pinataOptions) {
        formData.append('pinataOptions', JSON.stringify(options.pinataOptions));
      } else {
        // Default to CIDv1
        formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
      }

      // Make the request to Pinata
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
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
          pinataMetadata: options.pinataMetadata || {
            name: 'JSON Data',
            keyvalues: {
              timestamp: Date.now().toString(),
            }
          },
          pinataOptions: options.pinataOptions || { cidVersion: 1 }
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
      const response = await axios.get(`${this.gateway}/ipfs/${ipfsHash}`);
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
