import { ethers } from 'ethers';
import { ipfsService } from './ipfsService';

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: ethers.BigNumber;
  creator: string;
  assignee: string;
  deadline: number;
  status: number;
  proofHash: string;
  createdAt: number;
}

class ContractService {
  private provider: ethers.providers.Provider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  async init(provider: ethers.providers.Web3Provider) {
    this.provider = provider;
    this.signer = provider.getSigner();

    // Initialize contract with address and ABI
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error('Contract address not found in environment variables');
    }

    // Replace with your actual ABI
    const abi = [
      // Add your contract ABI here.  This is crucial and needs to be filled in.
      "function getTaskCount() view returns (uint256)",
      "function createTask(string memory metadataHash, uint256 rewardWei, uint256 deadline) payable returns (uint256)",
      "function getTask(uint256 taskId) view returns (string memory metadataHash, uint256 reward, uint256 deadline, address creator, address assignee, uint8 status, bool proofSubmitted, string memory proofHash)",
      "function assignTask(uint256 taskId) returns (bool)",
      "function submitProof(uint256 taskId, string memory proofHash) returns (bool)",
      "function approveTask(uint256 taskId) returns (bool)",
      "function disputeTask(uint256 taskId, string memory disputeHash) returns (bool)",
      "function withdrawTask(uint256 taskId) returns (bool)"

    ];


    this.contract = new ethers.Contract(
      contractAddress,
      abi,
      this.signer
    );
  }

  async getTaskCount(): Promise<number> {
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
    if (!this.contract) throw new Error('Contract not initialized');

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
  }

  async getTask(taskId: number): Promise<Task | null> {
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
      creator: taskData.creator,
      assignee: taskData.assignee,
      status: taskData.status,
      proofSubmitted: taskData.proofSubmitted,
      proofHash: taskData.proofHash,
      createdAt: metadata.createdAt || 0
    };
  }

  async assignTask(taskId: number): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.assignTask(taskId);
    await tx.wait();
  }

  async submitProof(taskId: number, proofHash: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.submitProof(taskId, proofHash);
    await tx.wait();
  }

  async approveTask(taskId: number): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.approveTask(taskId);
    await tx.wait();
  }

  async disputeTask(taskId: number, disputeHash: string): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.disputeTask(taskId, disputeHash);
    await tx.wait();
  }

  async withdrawTask(taskId: number): Promise<void> {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.withdrawTask(taskId);
    await tx.wait();
  }
}

export const contractService = new ContractService();