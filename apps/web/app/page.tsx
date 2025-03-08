'use client';

import { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import Sidebar from '@/components/layout/Sidebar';
import TaskCard from '@/components/tasks/TaskCard';
import AuthModal from '@/components/auth/AuthModal';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Mock data for demonstration
const mockTasks = [
  {
    id: '1',
    title: 'Create Smart Contract for NFT Marketplace',
    description: 'Develop a secure and efficient smart contract for an NFT marketplace with support for ERC-721 and ERC-1155 tokens.',
    reward: {
      amount: '1000000000000000000', // 1 ETH
      token: 'ETH'
    },
    deadline: new Date('2024-04-01'),
    applicants: 5,
    difficulty: 'Hard' as const,
    status: 'Open' as const
  },
  {
    id: '2',
    title: 'Design UI Components',
    description: 'Create modern and responsive UI components for the platform dashboard using React and Tailwind CSS.',
    reward: {
      amount: '500000000000000000', // 0.5 ETH
      token: 'ETH'
    },
    deadline: new Date('2024-03-25'),
    applicants: 3,
    difficulty: 'Medium' as const,
    status: 'Open' as const
  },
  // Add more mock tasks as needed
] as const;

export default function Home() {
  const { account, isLoading, networkError } = useWeb3();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);

  if (networkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-dark">
        <div className="text-center p-8 bg-cyber-dark/50 backdrop-blur-sm rounded-lg border border-pink-500/20">
          <h2 className="text-2xl font-display text-red-500 mb-4">Connection Error</h2>
          <p className="text-gray-400 mb-4">{networkError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-cyber-dark">
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Available Tasks
            </h1>
            <p className="mt-2 text-gray-400">
              Discover and complete tasks to earn rewards
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-cyber-dark/50 border border-pink-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <button className="px-4 py-2 flex items-center gap-2 bg-cyber-dark/50 border border-pink-500/20 rounded-lg hover:bg-pink-500/10 transition-all">
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Task grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-pulse text-pink-500">Loading tasks...</div>
              </div>
            ) : mockTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                id={task.id}
                title={task.title}
                description={task.description}
                reward={task.reward}
                difficulty={task.difficulty}
                category={task.category}
                deadline={task.deadline}
                status={task.status}
              />
            ))}
          </div>
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
} 