
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
    if (!proof && files.length === 0) return;

    try {
      setIsUploading(true);
      
      let fileHashes: string[] = [];
      
      // Upload files if any
      if (files.length > 0) {
        // In a real implementation, you would upload each file to IPFS
        // For now, we'll just log the files
        console.log('Files to upload:', files);
        
        // This would be implemented in ipfsService in a real app
        // fileHashes = await Promise.all(files.map(file => ipfsService.uploadFile(file)));
      }
      
      // Upload proof data with file references if any
      const proofHash = await ipfsService.uploadJson({ 
        taskId,
        proof,
        fileHashes,
        timestamp: Date.now() 
      });
      
      onSubmit(proofHash);
      setProof('');
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error submitting task proof:', error);
    } finally {
      setIsUploading(false);
    }
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Choose Files
              </button>
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{files.length} files selected</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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
