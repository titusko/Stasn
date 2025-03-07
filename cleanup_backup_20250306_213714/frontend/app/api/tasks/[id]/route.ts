import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { TaskPlatform } from '@/contracts/TaskPlatform';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  TaskPlatform.abi,
  provider
);

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

    switch (action) {
      case 'assign':
        // Handle task assignment
        return NextResponse.json({ message: 'Task assigned successfully' });
      case 'complete':
        // Handle task completion
        return NextResponse.json({ message: 'Task completed successfully' });
      case 'pay':
        // Handle task payment
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