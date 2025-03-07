
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
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof && files.length === 0) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      let fileHashes: string[] = [];
      
      // Upload files if any
      if (files.length > 0) {
        const totalFiles = files.length;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Use the actual implementation in ipfsService
          const result = await ipfsService.uploadFile(file);
          fileHashes.push(result.IpfsHash);
          
          // Update progress
          setUploadProgress(((i + 1) / totalFiles) * 100);
        }
      }
      
      // Upload proof data with file references
      const proofData = {
        taskId,
        proof,
        fileHashes,
        timestamp: Date.now()
      };
      
      const proofHash = await ipfsService.uploadJson(proofData);
      
      onSubmit(proofHash.IpfsHash);
      
      // Reset form
      setProof('');
      setFiles([]);
      setUploadProgress(0);
      onClose();
    } catch (error) {
      console.error('Error submitting task proof:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white p-6">
          <Dialog.Title className="text-xl font-medium text-gray-900 mb-4">
            Submit Task Proof
          </Dialog.Title>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">
                Proof Description
              </label>
              <textarea
                id="proof"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Describe how you completed the task..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attach Files (optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Choose Files
                </button>
                {files.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              {files.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {isUploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Uploading: {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || (!proof && files.length === 0)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
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
