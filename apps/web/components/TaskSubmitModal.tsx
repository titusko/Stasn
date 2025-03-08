
import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../../packages/ipfs';
import { ethers } from 'ethers';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, taskPlatformContract, tokenContract } = useWeb3();

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
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!taskPlatformContract || !tokenContract) {
      setError('Contracts not initialized');
      return;
    }
    
    if (!title || !description || !reward) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Upload file to IPFS if selected
      let attachmentIpfsHash = '';
      
      if (selectedFile) {
        const fileResult = await uploadFileToIPFS(
          selectedFile,
          selectedFile.name,
          { description, category }
        );
        attachmentIpfsHash = fileResult.IpfsHash;
      }
      
      // Create task metadata
      const taskMetadata = {
        title,
        description,
        category: category || 'Uncategorized',
        tags: parseTagsArray(),
        attachment: attachmentIpfsHash,
        timestamp: new Date().toISOString(),
        creator: address,
      };
      
      // Upload metadata to IPFS
      const metadataResult = await uploadJSONToIPFS(
        taskMetadata,
        `Task: ${title}`,
        { type: 'task-metadata' }
      );
      
      setIsUploading(false);
      setIsSubmitting(true);
      
      // Convert reward from ETH to wei
      const rewardInWei = ethers.parseEther(reward);
      
      // Approve token transfer
      const approveTx = await tokenContract.approve(
        await taskPlatformContract.getAddress(),
        rewardInWei
      );
      await approveTx.wait();
      
      // Create task on blockchain
      const createTaskTx = await taskPlatformContract.createTask(
        title,
        description,
        rewardInWei,
        category || 'Uncategorized',
        parseTagsArray(),
        metadataResult.IpfsHash
      );
      
      const receipt = await createTaskTx.wait();
      
      // Extract task ID from event logs
      const taskCreatedEvent = receipt.logs.find(
        (log: any) => log.eventName === 'TaskCreated'
      );
      
      const taskId = taskCreatedEvent ? taskCreatedEvent.args.taskId.toString() : '0';
      
      console.log(`Task created with ID: ${taskId}`);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(taskId, metadataResult.IpfsHash);
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
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
              {selectedFile && (
                <div className="text-sm mt-1 text-gray-500">
                  Selected file: {selectedFile.name}
                </div>
              )}
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md mr-2"
                disabled={isUploading || isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-blue-400"
              >
                {isUploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskSubmitModal;
