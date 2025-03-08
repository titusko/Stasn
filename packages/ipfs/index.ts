
import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

interface IPFSMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

interface IPFSUploadResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

/**
 * Uploads a file to IPFS via Pinata
 */
export async function uploadFileToIPFS(
  file: File | Buffer,
  fileName: string,
  metadata?: Record<string, string>
): Promise<IPFSUploadResult> {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured');
  }

  const formData = new FormData();
  
  // Add file to form data
  if (isBrowser && file instanceof File) {
    formData.append('file', file);
  } else if (!isBrowser && Buffer.isBuffer(file)) {
    // For Node.js environment
    formData.append('file', new Blob([file]), fileName);
  } else {
    throw new Error('Invalid file format');
  }
  
  // Prepare metadata
  const pinataMetadata: IPFSMetadata = {
    name: fileName
  };
  
  if (metadata) {
    pinataMetadata.keyvalues = metadata;
  }
  
  formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
  
  // Configure options for faster uploads
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
    wrapWithDirectory: false
  });
  
  formData.append('pinataOptions', pinataOptions);
  
  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return res.data;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`IPFS upload failed: ${error.response.data.message || error.message}`);
    }
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Uploads JSON data to IPFS via Pinata
 */
export async function uploadJSONToIPFS(
  jsonData: any,
  name: string,
  metadata?: Record<string, string>
): Promise<IPFSUploadResult> {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured');
  }
  
  // Prepare metadata
  const pinataMetadata: IPFSMetadata = {
    name
  };
  
  if (metadata) {
    pinataMetadata.keyvalues = metadata;
  }
  
  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataMetadata,
        pinataContent: jsonData,
        pinataOptions: {
          cidVersion: 1
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return res.data;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`IPFS JSON upload failed: ${error.response.data.message || error.message}`);
    }
    throw new Error('Failed to upload JSON to IPFS');
  }
}

/**
 * Gets the gateway URL for an IPFS hash
 */
export function getIPFSGatewayURL(ipfsHash: string): string {
  if (!ipfsHash) return '';
  
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');
  
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
}

/**
 * Retrieve data from IPFS
 */
export async function getFromIPFS(ipfsHash: string): Promise<any> {
  try {
    const url = getIPFSGatewayURL(ipfsHash);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch data from IPFS');
  }
}
