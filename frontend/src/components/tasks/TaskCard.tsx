import { ethers } from 'ethers';
import { ClockIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  reward: {
    amount: string;
    token: string;
  };
  deadline: Date;
  applicants: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Open' | 'In Progress' | 'Completed';
}

const difficultyColors = {
  Easy: 'from-green-400 to-green-600',
  Medium: 'from-yellow-400 to-yellow-600',
  Hard: 'from-red-400 to-red-600',
} as const;

const statusColors = {
  Open: 'from-cyber-blue to-cyber-purple',
  'In Progress': 'from-yellow-400 to-orange-600',
  Completed: 'from-green-400 to-green-600',
} as const;

export default function TaskCard({
  title,
  description,
  reward,
  deadline,
  applicants,
  difficulty,
  status,
}: TaskCardProps) {
  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-500" />
      
      {/* Card content */}
      <div className="relative flex flex-col p-6 bg-cyber-dark/90 backdrop-blur-sm rounded-lg border border-cyber-blue/20">
        {/* Status badge */}
        <div className="absolute -top-3 right-4">
          <span className={`px-3 py-1 text-xs rounded-full bg-gradient-to-r ${statusColors[status]} shadow-neon-blue`}>
            {status}
          </span>
        </div>

        {/* Title and difficulty */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-display text-white">{title}</h3>
          <span className={`px-2 py-1 text-xs rounded-md bg-gradient-to-r ${difficultyColors[difficulty]} opacity-75`}>
            {difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-4 h-4 mr-1 text-cyber-blue" />
            <span>{ethers.formatEther(reward.amount)} {reward.token}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1 text-cyber-purple" />
            <span>{new Date(deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-1 text-cyber-blue" />
            <span>{applicants} applied</span>
          </div>
        </div>

        {/* Action button */}
        <button className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-md hover:shadow-neon-blue transition-all duration-300">
          View Details
        </button>
      </div>
    </div>
  );
} 