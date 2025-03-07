import { ethers } from 'ethers';
import { ipfsService } from './ipfsService';

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: string;
  status: number; // 0: Open, 1: Assigned, 2: Completed, 3: Disputed, 4: Resolved
  client: string;
  worker: string;
  deadline: number;
  createdAt: number;
  completedAt: number;
  proofHash: string;
}

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string | undefined;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  }

  async init() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No ethereum provider found');
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Replace with your actual ABI
      const abi = [
        "function getTaskCount() view returns (uint256)",
        "function createTask(string memory metadataHash, uint256 rewardWei, uint256 deadline) payable returns (uint256)",
        "function getTask(uint256 taskId) view returns (string memory metadataHash, uint256 reward, uint256 deadline, address creator, address assignee, uint8 status, bool proofSubmitted, string memory proofHash)",
        "function assignTask(uint256 taskId) returns (bool)",
        "function submitProof(uint256 taskId, string memory proofHash) returns (bool)",
        "function approveTask(uint256 taskId) returns (bool)",
        "function disputeTask(uint256 taskId, string memory disputeHash) returns (bool)",
        "function withdrawTask(uint256 taskId) returns (bool)"
      ];

      if (!this.contractAddress) {
        throw new Error('Contract address not found in environment variables');
      }
      this.contract = new ethers.Contract(
        this.contractAddress,
        abi,
        this.signer
      );
    } catch (error) {
      console.error('Error initializing contract service:', error);
      throw error;
    }
  }

  async getTaskCount(): Promise<number> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');
    const count = await this.contract.getTaskCount();
    return count.toNumber();
  }

  async createTask(
    title: string,
    description: string,
    reward: string,
    deadline: number
  ): Promise<number> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const metadata = {
        title,
        description,
        createdAt: Math.floor(Date.now() / 1000)
      };

      const metadataHash = await ipfsService.uploadJson(metadata);
      const rewardWei = ethers.utils.parseEther(reward);

      const tx = await this.contract.createTask(
        metadataHash,
        rewardWei,
        deadline,
        { value: rewardWei }
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'TaskCreated');

      if (!event) throw new Error('Task creation event not found');
      return event.args.taskId.toNumber();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTask(taskId: number): Promise<Task | null> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');

    const taskData = await this.contract.getTask(taskId);
    const metadataHash = taskData.metadataHash;

    const metadataUrl = ipfsService.getIpfsUrl(metadataHash);
    const response = await fetch(metadataUrl);
    const metadata = await response.json();

    return {
      id: taskId,
      title: metadata.title,
      description: metadata.description,
      reward: taskData.reward,
      deadline: taskData.deadline.toNumber(),
      client: taskData.creator, // Assuming creator is the client
      worker: taskData.assignee,
      status: taskData.status,
      proofSubmitted: taskData.proofSubmitted,
      proofHash: taskData.proofHash,
      createdAt: metadata.createdAt || 0,
      completedAt: 0 // Placeholder
    };
  }

  async assignTask(taskId: number): Promise<void> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.assignTask(taskId);
    await tx.wait();
  }

  async submitProof(taskId: number, proofHash: string): Promise<void> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.submitProof(taskId, proofHash);
    await tx.wait();
  }

  async approveTask(taskId: number): Promise<void> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.approveTask(taskId);
    await tx.wait();
  }

  async disputeTask(taskId: number, disputeHash: string): Promise<void> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.disputeTask(taskId, disputeHash);
    await tx.wait();
  }

  async withdrawTask(taskId: number): Promise<void> {
    if (!this.contract) await this.init();
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.withdrawTask(taskId);
    await tx.wait();
  }
}

export const contractService = new ContractService();