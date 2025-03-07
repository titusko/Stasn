
import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string>;
}

interface PinataOptions {
  cidVersion?: 0 | 1;
}

interface IPFSResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

const getAuthHeaders = () => {
  return {
    Authorization: `Bearer ${PINATA_JWT}`,
  };
};

/**
 * Upload a file to IPFS via Pinata
 */
const uploadFile = async (file: File): Promise<IPFSResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata: PinataMetadata = {
      name: file.name,
      keyvalues: {
        size: file.size.toString(),
        type: file.type,
      },
    };

    formData.append('pinataMetadata', JSON.stringify(metadata));
    
    const options: PinataOptions = {
      cidVersion: 1,
    };
    
    formData.append('pinataOptions', JSON.stringify(options));

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error(axios.isAxiosError(error) 
      ? error.response?.data?.error || error.message 
      : 'Failed to upload file to IPFS');
  }
};

/**
 * Upload JSON data to IPFS via Pinata
 */
const uploadJson = async (jsonData: any): Promise<IPFSResponse> => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: 'TaskProof',
          keyvalues: {
            timestamp: Date.now().toString(),
          },
        },
      },
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error(axios.isAxiosError(error)
      ? error.response?.data?.error || error.message
      : 'Failed to upload JSON to IPFS');
  }
};

/**
 * Get content from IPFS via Pinata gateway
 */
const getFromIpfs = async (ipfsHash: string) => {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}/ipfs/${ipfsHash}`);
    return response.data;
  } catch (error) {
    console.error('Error getting content from IPFS:', error);
    throw new Error('Failed to get content from IPFS');
  }
};

export const ipfsService = {
  uploadFile,
  uploadJson,
  getFromIpfs,
};
