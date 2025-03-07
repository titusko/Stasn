'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TaskPlatform } from '@/contracts/TaskPlatform';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: bigint;
  creator: string;
  assignee: string;
  completed: boolean;
  paid: boolean;
  category: string;
  tags: string[];
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          TaskPlatform.abi,
          provider
        );

        const taskCount = await contract.getTaskCount();
        const loadedTasks = [];

        for (let i = 1; i <= taskCount; i++) {
          const task = await contract.getTask(i);
          loadedTasks.push(task);
        }

        setTasks(loadedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (taskId: number) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          TaskPlatform.abi,
          signer
        );

        const tx = await contract.assignTask(taskId);
        await tx.wait();
        await loadTasks();
      }
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-gray-600 mt-1">{task.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Reward: {ethers.formatEther(task.reward)} ETH
            </span>
            <span className="text-sm text-gray-500">
              Category: {task.category}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          {!task.assignee && (
            <button
              onClick={() => handleAssignTask(task.id)}
              className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Assign Task
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 