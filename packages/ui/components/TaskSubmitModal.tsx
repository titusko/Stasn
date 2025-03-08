
import React, { useState, useCallback } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { useContractWrite } from '../hooks/useContractWrite';
import { getContractForChain } from '../constants/contracts';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../services/ipfsService';
import { toast } from 'react-hot-toast';

interface TaskSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (taskId: string, ipfsHash: string) => void;
}

export function TaskSubmitModal({ isOpen, onClose, onSuccess }: TaskSubmitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { account, chainId } = useWalletContext();
  
  const taskManagerContract = getContractForChain('TaskManager', chainId || undefined);
  
  const { write, isLoading: isSubmitting, error } = useContractWrite({
    contract: taskManagerContract,
    method: 'createTask',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const parseTagsArray = (): string[] => {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setReward('');
    setCategory('');
    setTags('');
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!title || !description || !reward) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload file to IPFS if selected
      let attachmentIpfsHash = '';
      
      if (selectedFile) {
        const fileBuffer = await selectedFile.arrayBuffer().then(buffer => Buffer.from(buffer));
        const uploadResult = await uploadFileToIPFS(
          fileBuffer,
          selectedFile.name,
          { description, category }
        );
        attachmentIpfsHash = uploadResult.IpfsHash;
      }
      
      // Create task metadata
      const taskMetadata = {
        title,
        description,
        category: category || 'Uncategorized',
        tags: parseTagsArray(),
        attachment: attachmentIpfsHash,
        timestamp: new Date().toISOString(),
        creator: account,
      };
      
      // Upload metadata to IPFS
      const metadataResult = await uploadJSONToIPFS(
        taskMetadata,
        `Task: ${title}`,
        { type: 'task-metadata' }
      );
      
      // Convert reward from ETH to wei
      const rewardInWei = BigInt(parseFloat(reward) * 1e18);
      
      // Create task on blockchain
      const result = await write([
        title,
        description,
        rewardInWei,
        category || 'Uncategorized',
        parseTagsArray(),
        metadataResult.IpfsHash, // Add IPFS hash as additional parameter
      ]);
      
      toast.success('Task created successfully!');
      
      // Call success callback
      if (onSuccess && result) {
        onSuccess(
          result.taskId ? result.taskId.toString() : '0',
          metadataResult.IpfsHash
        );
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward (ETH) *
              </label>
              <input
                type="number"
                step="0.001"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={handleTagsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. urgent, design, frontend"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachment
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error.message}</div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-blue-400"
              >
                {isUploading || isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskSubmitModal;
