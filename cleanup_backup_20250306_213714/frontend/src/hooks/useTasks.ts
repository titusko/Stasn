import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import { Task } from '../types/task';

export function useTasks() {
  const { contract, account } = useWeb3();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError(null);

      const taskCount = await contract.getTaskCount();
      const loadedTasks = [];

      for (let i = 1; i <= taskCount; i++) {
        const task = await contract.getTask(i);
        loadedTasks.push({
          id: task.id.toString(),
          title: task.title,
          description: task.description,
          reward: task.reward.toString(),
          creator: task.creator,
          assignee: task.assignee,
          status: task.status,
          deadline: task.deadline.toString(),
          category: task.category,
          tags: task.tags,
          createdAt: task.createdAt.toString()
        });
      }

      setTasks(loadedTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    title: string,
    description: string,
    reward: string,
    deadline: number,
    category: string,
    tags: string[]
  ) => {
    if (!contract || !account) throw new Error('Not connected');

    try {
      const tx = await contract.createTask(
        title,
        description,
        ethers.parseEther(reward),
        deadline,
        category,
        tags
      );
      await tx.wait();
      await loadTasks(); // Reload tasks after creation
      return tx.hash;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const assignTask = async (taskId: string) => {
    if (!contract || !account) throw new Error('Not connected');

    try {
      const tx = await contract.assignTask(taskId);
      await tx.wait();
      await loadTasks(); // Reload tasks after assignment
      return tx.hash;
    } catch (err) {
      console.error('Error assigning task:', err);
      throw err;
    }
  };

  const completeTask = async (taskId: string, submissionURI: string) => {
    if (!contract || !account) throw new Error('Not connected');

    try {
      const tx = await contract.completeTask(taskId, submissionURI);
      await tx.wait();
      await loadTasks(); // Reload tasks after completion
      return tx.hash;
    } catch (err) {
      console.error('Error completing task:', err);
      throw err;
    }
  };

  // Load tasks on mount and when contract/account changes
  useEffect(() => {
    if (contract) {
      loadTasks();
    }
  }, [contract, account]);

  return {
    tasks,
    loading,
    error,
    createTask,
    assignTask,
    completeTask,
    refreshTasks: loadTasks
  };
} 