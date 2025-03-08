
import React from 'react';
import { Task } from '../services/contractService';

interface TaskActionButtonsProps {
  task: Task;
  userAddress?: string;
  mode: 'available' | 'created' | 'assigned';
  onAssign: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onDispute: () => void;
  onWithdraw: () => void;
  isLoading: boolean;
}

const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({ 
  task, 
  userAddress, 
  mode,
  onAssign,
  onSubmit,
  onApprove,
  onDispute,
  onWithdraw,
  isLoading 
}) => {
  const isCreator = userAddress?.toLowerCase() === task.creator.toLowerCase();
  const isAssignee = userAddress?.toLowerCase() === task.assignee.toLowerCase();
  const isAssigned = task.assignee !== '0x0000000000000000000000000000000000000000';
  const hasDeadlinePassed = task.deadline < Math.floor(Date.now() / 1000);
  
  if (mode === 'available' && !isAssigned && !isCreator) {
    return (
      <button
        onClick={onAssign}
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Accept Task'}
      </button>
    );
  }

  if (mode === 'assigned' && isAssignee) {
    return (
      <button
        onClick={onSubmit}
        disabled={isLoading || hasDeadlinePassed}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : hasDeadlinePassed ? 'Deadline Passed' : 'Submit Work'}
      </button>
    );
  }

  if (mode === 'created' && isCreator && isAssigned && task.proofSubmitted) {
    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Approve & Pay'}
        </button>
        <button
          onClick={onDispute}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Dispute Work'}
        </button>
      </div>
    );
  }

  if (mode === 'created' && isCreator && !isAssigned) {
    return (
      <button
        onClick={onWithdraw}
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Withdraw Task'}
      </button>
    );
  }

  if (mode === 'created' && isCreator && hasDeadlinePassed && isAssigned && !task.proofSubmitted) {
    return (
      <button
        onClick={onWithdraw}
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Recover Funds (Deadline Passed)'}
      </button>
    );
  }

  return null;
};

export default TaskActionButtons;
