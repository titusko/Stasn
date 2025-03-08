
import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

if (!PINATA_JWT) {
  console.warn('PINATA_JWT is not set. IPFS uploads will not work.');
}

interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

interface PinataOptions {
  cidVersion?: number;
  customPinPolicy?: {
    regions: [{ id: string; desiredReplicationCount: number }];
  };
}

interface UploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  url: string;
}

/**
 * Uploads a file to IPFS via Pinata
 */
export async function uploadFileToIPFS(
  file: Buffer | File,
  name?: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    
    // Add the file to the form data
    if (file instanceof Buffer) {
      const blob = new Blob([file]);
      formData.append('file', blob, name || 'file');
    } else {
      formData.append('file', file);
    }
    
    // Add metadata if provided
    if (name || metadata) {
      const pinataMetadata: PinataMetadata = {
        name: name || undefined,
        keyvalues: metadata || undefined,
      };
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    }
    
    // Set default options
    const pinataOptions: PinataOptions = {
      cidVersion: 1,
    };
    
    formData.append('pinataOptions', JSON.stringify(pinataOptions));
    
    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
      }
    );
    
    return {
      ...response.data,
      url: `${PINATA_GATEWAY}/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Uploads JSON to IPFS via Pinata
 */
export async function uploadJSONToIPFS(
  json: Record<string, any>,
  name?: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  try {
    const data = {
      pinataMetadata: {
        name: name || 'JSON Data',
        keyvalues: metadata || {},
      },
      pinataContent: json,
      pinataOptions: {
        cidVersion: 1,
      },
    };
    
    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`,
        },
      }
    );
    
    return {
      ...response.data,
      url: `${PINATA_GATEWAY}/ipfs/${response.data.IpfsHash}`,
    };
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
}

/**
 * Retrieves content from IPFS via Pinata gateway
 */
export async function getFromIPFS(cid: string): Promise<any> {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}/ipfs/${cid}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch from IPFS');
  }
}

export default {
  uploadFileToIPFS,
  uploadJSONToIPFS,
  getFromIPFS,
};
