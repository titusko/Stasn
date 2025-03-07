
import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { ipfsService } from '../services/ipfsService';

interface TaskSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proofHash: string) => void;
  taskId: number;
}

const TaskSubmitModal: React.FC<TaskSubmitModalProps> = ({ isOpen, onClose, onSubmit, taskId }) => {
  const [proof, setProof] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof && files.length === 0) {
      alert('Please provide proof or upload files');
      return;
    }

    try {
      setIsUploading(true);
      let proofHash = '';

      if (files.length > 0) {
        // Upload files to IPFS
        const fileHash = await ipfsService.uploadFile(files[0]);
        proofHash = fileHash;
      } else {
        // Upload text proof to IPFS
        const jsonData = { text: proof, taskId };
        proofHash = await ipfsService.uploadJson(jsonData);
      }

      onSubmit(proofHash);
      onClose();
    } catch (error) {
      console.error('Error submitting proof:', error);
      alert('Failed to submit proof. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-medium text-gray-900">Submit Task Proof</Dialog.Title>
          
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proof of Completion
              </label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describe how you completed the task..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Files (Optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              {files.length > 0 && (
                <ul className="mt-2 text-sm text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Submit Proof'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TaskSubmitModal;
