
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';
import axios from 'axios';
import { TaskStatus } from 'contracts-sdk';
import Link from 'next/link';

export default function Home() {
  const { isConnected, account, connect, taskContract, isCorrectNetwork, switchNetwork } = useWeb3();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && taskContract && isCorrectNetwork) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, taskContract, isCorrectNetwork]);

  async function fetchTasks() {
    setIsLoading(true);
    try {
      // Fetch task count from contract
      const count = await taskContract.taskCount();
      const taskPromises = [];

      // Fetch each task
      for (let i = 1; i <= count.toNumber(); i++) {
        taskPromises.push(fetchTaskDetails(i));
      }

      const fetchedTasks = await Promise.all(taskPromises);
      setTasks(fetchedTasks.filter(Boolean)); // Filter out null values
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTaskDetails(id) {
    try {
      const taskData = await taskContract.getTask(id);
      
      // Fetch metadata from IPFS
      let metadata = {};
      try {
        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${taskData.metadataURI}`);
        metadata = response.data;
      } catch (error) {
        console.error(`Error fetching metadata for task ${id}:`, error);
        metadata = { title: 'Unknown Task', description: 'Metadata unavailable' };
      }

      return {
        id,
        creator: taskData.creator,
        assignee: taskData.assignee,
        metadataURI: taskData.metadataURI,
        reward: taskData.reward,
        status: taskData.status,
        title: metadata.title || 'Unknown Task',
        description: metadata.description || 'No description',
        skills: metadata.skills || [],
        timeEstimate: metadata.timeEstimate || 'Unknown',
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      return null;
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case TaskStatus.OPEN:
        return 'bg-cyber-primary text-white';
      case TaskStatus.IN_PROGRESS:
        return 'bg-cyber-warning text-white';
      case TaskStatus.SUBMITTED:
        return 'bg-cyber-accent text-white';
      case TaskStatus.COMPLETED:
        return 'bg-cyber-success text-white';
      case TaskStatus.DISPUTED:
        return 'bg-cyber-danger text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case TaskStatus.OPEN:
        return 'Open';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.SUBMITTED:
        return 'Submitted';
      case TaskStatus.COMPLETED:
        return 'Completed';
      case TaskStatus.DISPUTED:
        return 'Disputed';
      default:
        return 'Unknown';
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-accent mb-4">
          Web3 Task Platform
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Complete tasks, earn rewards, and build your reputation in the decentralized world
        </p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-cyber-dark-800 border border-cyber-primary/30 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-cyber mb-6">Connect Your Wallet</h2>
            <p className="mb-6 text-gray-300">
              Connect your wallet to view available tasks and start earning rewards.
            </p>
            <button
              onClick={connect}
              className="btn-cyber-primary py-2 px-8 rounded-lg font-medium text-white"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-cyber-dark-800 border border-cyber-warning/30 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-cyber mb-6">Wrong Network</h2>
            <p className="mb-6 text-gray-300">
              Please switch to the correct network to use this application.
            </p>
            <button
              onClick={switchNetwork}
              className="btn-cyber-warning py-2 px-8 rounded-lg font-medium text-white"
            >
              Switch Network
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-cyber">Available Tasks</h2>
            <Link href="/create-task">
              <a className="btn-cyber-primary py-2 px-6 rounded-lg">Create New Task</a>
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16 bg-cyber-dark-800 rounded-lg">
              <h3 className="text-xl font-heading mb-4">No tasks available</h3>
              <p className="text-gray-400">Be the first to create a task!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <a className="bg-cyber-dark-800 border border-cyber-primary/20 hover:border-cyber-primary/50 transition-all duration-300 rounded-lg p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-heading">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeClass(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4 flex-grow line-clamp-3">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {task.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-cyber-dark-900 text-gray-300 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-cyber-primary/10">
                      <div className="text-cyber-accent">
                        {ethers.utils.formatEther(task.reward)} ETH
                      </div>
                      <div className="text-sm text-gray-400">Est: {task.timeEstimate}</div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 bg-cyber-dark-800 border border-cyber-primary/30 p-6 rounded-lg">
            <h3 className="text-xl font-cyber mb-4">Your Account</h3>
            <p className="mb-2 text-gray-300 break-all">
              <span className="font-semibold">Address:</span> {account}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
