
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { TASK_PLATFORM_ADDRESS, TaskPlatformABI } from 'contracts-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Setup blockchain provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
const taskPlatform = new ethers.Contract(TASK_PLATFORM_ADDRESS, TaskPlatformABI, provider);

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    // Get all tasks (this is a mock implementation)
    // In a real app, you would query tasks from the blockchain or a database
    const taskIds = Array.from({ length: 10 }, (_, i) => i + 1);
    const tasks = await Promise.all(
      taskIds.map(async (id) => {
        try {
          return await taskPlatform.getTask(id);
        } catch (error) {
          return null;
        }
      })
    );
    
    // Filter out null values (non-existent tasks)
    const validTasks = tasks.filter(task => task !== null);
    
    res.json(validTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await taskPlatform.getTask(taskId);
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`API server running on port ${port}`);
});
