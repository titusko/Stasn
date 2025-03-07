
import { ethers } from 'ethers';
import { ipfsService } from './ipfsService';

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: ethers.BigNumber;
  deadline: number;
  creator: string;
  assignee: string;
  status: TaskStatus;
  proofSubmitted: boolean;
  proofHash: string;
  createdAt: number;
}

export enum TaskStatus {
  Open = 0,
  Assigned = 1,
  Completed = 2,
  Cancelled = 3,
  Disputed = 4
}

class ContractService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  init(contract: ethers.Contract, signer: ethers.Signer) {
    this.contract = contract;
    this.signer = signer;
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
    
    // Upload metadata to IPFS
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

  async getTask(taskId: number): Promise<Task> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const taskData = await this.contract.getTask(taskId);
    const metadataHash = taskData.metadataHash;
    
    // Fetch metadata from IPFS
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
