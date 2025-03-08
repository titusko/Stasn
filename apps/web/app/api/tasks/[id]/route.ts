import { NextResponse } from 'next/server';
import { ethers, BaseContract } from 'ethers';
import { TaskPlatformAddress, TaskPlatformABI, Task } from '@/contracts/TaskPlatform';

interface TaskPlatformContract extends BaseContract {
  getTask(taskId: number): Promise<Task>;
  assignTask(taskId: number): Promise<ethers.ContractTransactionResponse>;
  completeTask(taskId: number): Promise<ethers.ContractTransactionResponse>;
  payTask(taskId: number): Promise<ethers.ContractTransactionResponse>;
}

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const contract = new ethers.Contract(
  TaskPlatformAddress,
  TaskPlatformABI,
  provider
) as unknown as TaskPlatformContract;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const task = await contract.getTask(taskId);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const body = await request.json();
    const { action } = body;

    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer) as unknown as TaskPlatformContract;

    switch (action) {
      case 'assign':
        await contractWithSigner.assignTask(taskId);
        return NextResponse.json({ message: 'Task assigned successfully' });
      case 'complete':
        await contractWithSigner.completeTask(taskId);
        return NextResponse.json({ message: 'Task completed successfully' });
      case 'pay':
        await contractWithSigner.payTask(taskId);
        return NextResponse.json({ message: 'Task paid successfully' });
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 