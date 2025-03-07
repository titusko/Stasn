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

      // For demo purposes, we'll return a mock hash
      console.log('Uploading data to IPFS:', data);
      return 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';

      /* Uncomment for actual implementation
      const response = await axios.post(
        PINATA_API_URL,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`
          }
        }
      );

      return response.data.IpfsHash;
      */
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  getIpfsUrl(hash: string): string {
    return `${PINATA_GATEWAY}${hash}`;
  }

  async getJson(hash: string): Promise<any> {
    try {
      const url = this.getIpfsUrl(hash);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw error;
    }
  }
}

export const ipfsService = new IPFSService();