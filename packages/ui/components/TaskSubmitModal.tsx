import React, { useState } from 'react';

interface TaskSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { submissionUrl: string; comments: string }) => void;
  isLoading: boolean;
}

export function TaskSubmitModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: TaskSubmitModalProps) {
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [comments, setComments] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ submissionUrl, comments });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-cyber-dark-800 border border-cyber-primary p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-cyber text-cyber-primary mb-4">Submit Task Completion</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Submission URL</label>
            <input
              type="text"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              className="w-full bg-cyber-dark-900 border border-cyber-primary-400 rounded p-2 text-white"
              placeholder="https://github.com/your-repo"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Additional Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-cyber-dark-900 border border-cyber-primary-400 rounded p-2 text-white h-32"
              placeholder="Describe your implementation and how it fulfills the task requirements..."
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
              className="btn-cyber-primary text-sm px-4 py-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}