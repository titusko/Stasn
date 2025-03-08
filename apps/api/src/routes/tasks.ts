
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';
import { ethers } from 'ethers';

const router = express.Router();
const prisma = new PrismaClient();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        creator: {
          select: {
            address: true,
            username: true,
            profileImage: true,
          },
        },
        assignee: {
          select: {
            address: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            address: true,
            username: true,
            profileImage: true,
          },
        },
        assignee: {
          select: {
            address: true,
            username: true,
            profileImage: true,
          },
        },
        submissions: true,
        disputes: true,
      },
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Sync task from blockchain
router.post('/sync/:chainTaskId', verifyToken, async (req, res) => {
  const { chainTaskId } = req.params;
  
  try {
    // Logic to sync task data from blockchain
    // This would typically involve:
    // 1. Fetching task data from the blockchain
    // 2. Updating or creating the task in the database
    
    // Mock implementation
    const updatedTask = await prisma.task.update({
      where: { chainTaskId },
      data: {
        lastSyncedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            address: true,
            username: true,
          },
        },
        assignee: {
          select: {
            address: true,
            username: true,
          },
        },
      },
    });
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error syncing task:', error);
    res.status(500).json({ error: 'Failed to sync task' });
  }
});

// Create a submission for a task
router.post('/:id/submissions', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { submissionUrl, comments } = req.body;
  const userAddress = req.user.address;
  
  try {
    // Check if the task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if the user is the assignee
    if (task.assigneeAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Only the assignee can submit for this task' });
    }
    
    // Create submission
    const submission = await prisma.submission.create({
      data: {
        taskId: id,
        submitterAddress: userAddress,
        submissionUrl,
        comments,
      },
    });
    
    res.status(201).json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Create a dispute for a task
router.post('/:id/disputes', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userAddress = req.user.address;
  
  try {
    // Check if the task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if the user is the creator
    if (task.creatorAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Only the creator can dispute this task' });
    }
    
    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        taskId: id,
        initiatorAddress: userAddress,
        reason,
      },
    });
    
    res.status(201).json(dispute);
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

export default router;
