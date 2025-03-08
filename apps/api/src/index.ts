
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { TaskPlatform } from 'contracts-sdk';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Initialize provider
const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL || 'https://rpc.ankr.com/eth_sepolia'
);

// Initialize contract
const taskPlatformContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS || '',
  TaskPlatform.abi,
  provider
);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Web3 Task Platform API is running' });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const count = await taskPlatformContract.getTaskCount();
    
    // Convert to number (safe because we're unlikely to have 2^53 - 1 tasks)
    const taskCount = parseInt(count.toString());
    
    const tasks = [];
    
    // Fetch tasks in reverse order (newest first)
    for (let i = taskCount; i >= 1; i--) {
      try {
        const task = await taskPlatformContract.getTask(i);
        tasks.push({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          creator: task.creator,
          worker: task.assignee,
          reward: ethers.formatEther(task.reward),
          category: task.category,
          tags: task.tags,
          ipfsHash: task.ipfsHash,
          status: task.status,
          createdAt: new Date(Number(task.createdAt) * 1000).toISOString(),
          completedAt: task.completedAt.toString() !== '0'
            ? new Date(Number(task.completedAt) * 1000).toISOString()
            : null,
        });
      } catch (err) {
        console.error(`Error fetching task ${i}:`, err);
        // Continue to next task
      }
    }
    
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await taskPlatformContract.getTask(taskId);
    
    res.json({
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      creator: task.creator,
      worker: task.assignee,
      reward: ethers.formatEther(task.reward),
      category: task.category,
      tags: task.tags,
      ipfsHash: task.ipfsHash,
      status: task.status,
      createdAt: new Date(Number(task.createdAt) * 1000).toISOString(),
      completedAt: task.completedAt.toString() !== '0'
        ? new Date(Number(task.completedAt) * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Get tasks by creator
app.get('/api/users/:address/created', async (req, res) => {
  try {
    const address = req.params.address;
    const taskIds = await taskPlatformContract.getCreatorTasks(address);
    
    const tasks = [];
    
    for (const taskId of taskIds) {
      try {
        const task = await taskPlatformContract.getTask(taskId);
        tasks.push({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          creator: task.creator,
          worker: task.assignee,
          reward: ethers.formatEther(task.reward),
          category: task.category,
          tags: task.tags,
          ipfsHash: task.ipfsHash,
          status: task.status,
          createdAt: new Date(Number(task.createdAt) * 1000).toISOString(),
          completedAt: task.completedAt.toString() !== '0'
            ? new Date(Number(task.completedAt) * 1000).toISOString()
            : null,
        });
      } catch (err) {
        console.error(`Error fetching task ${taskId}:`, err);
        // Continue to next task
      }
    }
    
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching created tasks:', err);
    res.status(500).json({ error: 'Failed to fetch created tasks' });
  }
});

// Get tasks by assignee
app.get('/api/users/:address/assigned', async (req, res) => {
  try {
    const address = req.params.address;
    const taskIds = await taskPlatformContract.getAssigneeTasks(address);
    
    const tasks = [];
    
    for (const taskId of taskIds) {
      try {
        const task = await taskPlatformContract.getTask(taskId);
        tasks.push({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          creator: task.creator,
          worker: task.assignee,
          reward: ethers.formatEther(task.reward),
          category: task.category,
          tags: task.tags,
          ipfsHash: task.ipfsHash,
          status: task.status,
          createdAt: new Date(Number(task.createdAt) * 1000).toISOString(),
          completedAt: task.completedAt.toString() !== '0'
            ? new Date(Number(task.completedAt) * 1000).toISOString()
            : null,
        });
      } catch (err) {
        console.error(`Error fetching task ${taskId}:`, err);
        // Continue to next task
      }
    }
    
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching assigned tasks:', err);
    res.status(500).json({ error: 'Failed to fetch assigned tasks' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
