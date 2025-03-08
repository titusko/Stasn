
import axios from 'axios';

export interface IPFSService {
  uploadFile: (file: File) => Promise<string>;
  uploadJSON: (data: any) => Promise<string>;
  getFromIPFS: (hash: string) => Promise<any>;
}

export class PinataIPFSService implements IPFSService {
  private readonly jwt: string;
  private readonly gateway: string;
  
  constructor(jwt: string, gateway: string) {
    this.jwt = jwt;
    this.gateway = gateway;
  }
  
  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }
  
  async uploadJSON(data: any): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }
  
  async getFromIPFS(hash: string): Promise<any> {
    try {
      const response = await axios.get(`${this.gateway}/ipfs/${hash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error('Failed to fetch data from IPFS');
    }
  }
}

// Factory function to create an IPFS service
export const createIPFSService = (
  jwt: string = process.env.NEXT_PUBLIC_PINATA_JWT || '',
  gateway: string = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
): IPFSService => {
  return new PinataIPFSService(jwt, gateway);
};
