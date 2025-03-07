
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileIcon, AlertCircle } from "lucide-react";
import { ipfsService } from '../services/ipfsService';
import { useContractWrite } from '@/hooks/useContractWrite';
import { TASK_MANAGER_ADDRESS, TASK_MANAGER_ABI } from '@/constants/contracts';

interface TaskSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (proofHash: string, taskId: string) => void;
  taskId: string;
}

export function TaskSubmitModal({ isOpen, onClose, onSuccess, taskId }: TaskSubmitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { write: submitProof, isLoading: isSubmitting } = useContractWrite({
    contract: {
      address: TASK_MANAGER_ADDRESS,
      abi: TASK_MANAGER_ABI,
    },
    method: 'submitProof',
    onSuccess: (receipt) => {
      // Handle transaction success
      const taskId = receipt.events?.find(e => e.event === 'ProofSubmitted')?.args?.taskId;
      if (onSuccess && proofHash) {
        onSuccess(proofHash, taskId.toString());
      }
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [proofHash, setProofHash] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      setIsUploading(true);
      setError(null);
      
      let fileHash = '';
      
      // Upload file if selected
      if (selectedFile) {
        const fileResult = await ipfsService.uploadFile(selectedFile);
        fileHash = fileResult.IpfsHash;
      }
      
      // Upload proof data with file reference
      const proofData = {
        taskId,
        title,
        description,
        fileHash,
        timestamp: Date.now()
      };
      
      const result = await ipfsService.uploadJson(proofData);
      setProofHash(result.IpfsHash);
      
      // Submit proof to smart contract
      await submitProof([taskId, result.IpfsHash]);
      
    } catch (error: any) {
      console.error('Error submitting task proof:', error);
      setError(error.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Submit Task Proof</DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your submission"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how you completed the task..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Attachment (optional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openFileDialog}
                  className="flex gap-2 items-center"
                >
                  <Upload size={16} />
                  Choose File
                </Button>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileIcon size={16} />
                    {selectedFile.name}
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
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
              disabled={isUploading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || !description || isUploading || isSubmitting}
            >
              {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskSubmitModal;
