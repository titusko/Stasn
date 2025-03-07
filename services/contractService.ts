import { ethers } from 'ethers';

// Simple mockup for Task interface
export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  status: string;
  deadline: number;
  createdAt: number;
  creator: string;
  worker?: string;
}

// A simplified ABI with just the methods we need
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async init() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No Web3 provider detected');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Contract address not configured');
      }

      this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
      throw error;
    }
  }

  // Mock function to get tasks
  async getTasks(): Promise<Task[]> {
    // Return a mock task for demonstration
    return [
      {
        id: 1,
        title: 'Build a Web3 Demo',
        description: 'Create a simple web3 application with Next.js and ethers.js',
        reward: '0.1',
        status: 'open',
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
        creator: '0x1234567890123456789012345678901234567890',
      }
    ];
  }
}

export const contractService = new ContractService();