
import { IPFSService } from 'ipfs';

// Get Pinata JWT from environment variable
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Create a singleton instance of the IPFS service
const ipfsService = new IPFSService(PINATA_JWT);

/**
 * Uploads a file to IPFS
 * @param file File data (Buffer or ReadableStream)
 * @param name Filename
 * @param metadata Additional metadata for the file
 * @returns IPFS upload response with hash
 */
export async function uploadFileToIPFS(
  file: Buffer | NodeJS.ReadableStream,
  name?: string,
  metadata?: Record<string, string>
) {
  return ipfsService.uploadFile(file, {
    name,
    pinataMetadata: {
      name,
      keyvalues: metadata
    }
  });
}

/**
 * Uploads JSON data to IPFS
 * @param data JSON data to upload
 * @param name Name for the content
 * @param metadata Additional metadata for the content
 * @returns IPFS upload response with hash
 */
export async function uploadJSONToIPFS(
  data: Record<string, any>,
  name?: string,
  metadata?: Record<string, string>
) {
  return ipfsService.uploadJSON(data, {
    pinataMetadata: {
      name,
      keyvalues: metadata
    }
  });
}

/**
 * Gets the content from IPFS by hash
 * @param ipfsHash IPFS hash
 * @returns Content data
 */
export async function getIPFSContent(ipfsHash: string) {
  return ipfsService.getContent(ipfsHash);
}

/**
 * Gets a link to the content on IPFS gateway
 * @param ipfsHash IPFS hash
 * @returns Gateway URL
 */
export function getIPFSLink(ipfsHash: string): string {
  if (!ipfsHash) return '';
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
}

/**
 * Unpins content from IPFS
 * @param ipfsHash IPFS hash
 * @returns Success status
 */
export async function unpinIPFSContent(ipfsHash: string): Promise<boolean> {
  return ipfsService.unpinContent(ipfsHash);
}

export default {
  uploadFile: uploadFileToIPFS,
  uploadJSON: uploadJSONToIPFS,
  getContent: getIPFSContent,
  getLink: getIPFSLink,
  unpinContent: unpinIPFSContent,
};
