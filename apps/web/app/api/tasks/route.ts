import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { TaskPlatform } from '@/contracts/TaskPlatform';

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const contract = new ethers.Contract(
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  TaskPlatform.abi,
  provider
);

export async function GET() {
  try {
    const taskCount = await contract.getTaskCount();
    const tasks = [];

    for (let i = 1; i <= taskCount; i++) {
      const task = await contract.getTask(i);
      tasks.push(task);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, reward, category, tags } = body;

    // Validate input
    if (!title || !description || !reward || !category || !tags) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({ message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 