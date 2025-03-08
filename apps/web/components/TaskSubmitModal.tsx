
import React, { useState, useCallback } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { uploadFileToIPFS, uploadJSONToIPFS } from 'ipfs';
import { AlertCircle, Upload, FileIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { contract, address } = useWeb3();

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
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!title || !description || !reward) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!contract) {
      setError('Contract not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
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
        creator: address,
      };
      
      // Upload metadata to IPFS
      const metadataResult = await uploadJSONToIPFS(
        taskMetadata,
        `Task: ${title}`,
        { type: 'task-metadata' }
      );
      
      // Convert reward from ETH to wei
      const rewardInWei = ethers.parseEther(reward);
      
      // Create task on blockchain
      const tx = await contract.createTask(
        title,
        description,
        rewardInWei,
        category || 'Uncategorized',
        parseTagsArray(),
        metadataResult.IpfsHash
      );
      
      const receipt = await tx.wait();
      console.log('Task created:', receipt);
      
      // Find the TaskCreated event to get the task ID
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event: any) => event && event.name === 'TaskCreated');
      
      const taskId = event ? event.args.taskId.toString() : '0';
      
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
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 flex h-24 w-full rounded-md border px-3 py-2 text-sm"
                required
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="reward" className="text-right text-sm font-medium">
                Reward (ETH) *
              </label>
              <input
                id="reward"
                type="number"
                step="0.001"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium">
                Category
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tags" className="text-right text-sm font-medium">
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={handleTagsChange}
                className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. design, frontend, urgent"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Attachment
              </label>
              <div className="col-span-3">
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file')?.click()}
                  className="flex gap-2 items-center"
                >
                  <Upload size={16} />
                  Choose File
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <FileIcon size={16} />
                    {selectedFile.name}
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="col-span-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskSubmitModal;
