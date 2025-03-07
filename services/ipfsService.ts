
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
            Authorization: `Bearer ${PINATA_JWT}`
          }
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload data to IPFS');
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
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${PINATA_JWT}`
          }
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  getUrl(hash: string): string {
    return `${PINATA_GATEWAY}${hash}`;
  }
}

export const ipfsService = new IPFSService();
