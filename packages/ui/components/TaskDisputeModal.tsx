import React, { useState } from 'react';

interface TaskDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispute: (data: { reason: string }) => void;
  isLoading: boolean;
}

export function TaskDisputeModal({
  isOpen,
  onClose,
  onDispute,
  isLoading
}: TaskDisputeModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispute({ reason });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-cyber-dark-800 border border-cyber-danger p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-cyber text-cyber-danger mb-4">Dispute Task Submission</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Reason for Dispute</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-cyber-dark-900 border border-cyber-danger-400 rounded p-2 text-white h-32"
              placeholder="Explain why you are disputing this submission..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-cyber-secondary text-sm px-4 py-2 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-cyber-danger text-sm px-4 py-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}