import { createIPFSService } from '@web3-task/ipfs';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Create IPFS service instance using the factory function
const ipfsClient = createIPFSService(PINATA_JWT, undefined, PINATA_GATEWAY);

/**
 * Upload a file to IPFS via Pinata
 */
const uploadFile = async (file: File) => {
  try {
    const response = await ipfsClient.uploadFile(file, {
      pinataMetadata: {
        name: file.name,
        keyvalues: {
          size: file.size.toString(),
          type: file.type,
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

/**
 * Upload JSON data to IPFS via Pinata
 */
const uploadJson = async (jsonData: any) => {
  try {
    const response = await ipfsClient.uploadJSON(jsonData, {
      pinataMetadata: {
        name: 'TaskProof',
        keyvalues: {
          timestamp: Date.now().toString(),
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

/**
 * Get content from IPFS via Pinata gateway
 */
const getFromIpfs = async (ipfsHash: string) => {
  try {
    const data = await ipfsClient.getContent(ipfsHash);
    return data;
  } catch (error) {
    console.error('Error getting content from IPFS:', error);
    throw error;
  }
};

export const ipfsService = {
  uploadFile,
  uploadJson,
  getFromIpfs,
};