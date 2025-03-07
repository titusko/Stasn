
import axios from 'axios';

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

export class IPFSService {
  async uploadJson(data: any): Promise<string> {
    try {
      if (!PINATA_JWT) {
        throw new Error('Pinata JWT not configured');
      }
      
      const response = await axios.post(
        PINATA_API_URL,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`
          }
        }
      );
      
      if (response.data && response.data.IpfsHash) {
        return response.data.IpfsHash;
      } else {
        throw new Error('Failed to get IPFS hash from Pinata');
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }
  
  async uploadFile(file: File): Promise<string> {
    try {
      if (!PINATA_JWT) {
        throw new Error('Pinata JWT not configured');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${PINATA_JWT}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data && response.data.IpfsHash) {
        return response.data.IpfsHash;
      } else {
        throw new Error('Failed to get IPFS hash from Pinata');
      }
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }
  
  getIpfsUrl(hash: string): string {
    return `${PINATA_GATEWAY}${hash}`;
  }
}

export const ipfsService = new IPFSService();
