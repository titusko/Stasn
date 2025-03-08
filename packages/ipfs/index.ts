
import axios from 'axios';

interface IPFSConfig {
  pinataJwt?: string;
  pinataGateway?: string;
}

export class IPFSService {
  private pinataJwt: string;
  private pinataGateway: string;

  constructor(config: IPFSConfig = {}) {
    this.pinataJwt = config.pinataJwt || process.env.NEXT_PUBLIC_PINATA_JWT || '';
    this.pinataGateway = config.pinataGateway || process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      if (!this.pinataJwt) {
        throw new Error('Pinata JWT not configured');
      }

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.pinataJwt}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      if (!this.pinataJwt) {
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
            Authorization: `Bearer ${this.pinataJwt}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  getIPFSUrl(ipfsHash: string): string {
    return `${this.pinataGateway}${ipfsHash}`;
  }
}

export default IPFSService;
