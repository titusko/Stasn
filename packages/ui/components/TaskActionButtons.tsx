import React from 'react';

interface TaskActionButtonsProps {
  taskId: string;
  taskStatus: string;
  isCreator: boolean;
  isAssignee: boolean;
  onTake: () => void;
  onComplete: () => void;
  onVerify: () => void;
  onDispute: () => void;
}

export function TaskActionButtons({
  taskId,
  taskStatus,
  isCreator,
  isAssignee,
  onTake,
  onComplete,
  onVerify,
  onDispute
}: TaskActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {taskStatus === 'OPEN' && !isCreator && (
        <button
          onClick={onTake}
          className="btn-cyber-primary text-sm px-4 py-2 rounded-lg"
        >
          Take Task
        </button>
      )}

      {taskStatus === 'IN_PROGRESS' && isAssignee && (
        <button
          onClick={onComplete}
          className="btn-cyber-success text-sm px-4 py-2 rounded-lg"
        >
          Submit Completion
        </button>
      )}

      {taskStatus === 'SUBMITTED' && isCreator && (
        <>
          <button
            onClick={onVerify}
            className="btn-cyber-success text-sm px-4 py-2 rounded-lg"
          >
            Verify & Pay
          </button>
          <button
            onClick={onDispute}
            className="btn-cyber-danger text-sm px-4 py-2 rounded-lg"
          >
            Dispute
          </button>
        </>
      )}
    </div>
  );
}