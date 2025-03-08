
import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { createIPFSService } from 'ipfs';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { 
  AlertCircle, 
  FileIcon, 
  Upload 
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface TaskSubmitModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskSubmitModal: React.FC<TaskSubmitModalProps> = ({
  taskId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { taskContract } = useWeb3();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ipfsService = createIPFSService();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskContract) {
      setError('Wallet not connected');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setError(null);
      setIsUploading(true);
      
      // Upload file to IPFS
      const fileHash = await ipfsService.uploadFile(selectedFile);
      
      // Upload metadata with file hash and comments
      const metadataHash = await ipfsService.uploadJSON({
        fileHash,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        comments,
        timestamp: new Date().toISOString(),
      });
      
      setIsUploading(false);
      setIsSubmitting(true);
      
      // Submit the task with the metadata hash
      const tx = await taskContract.completeTask(taskId, metadataHash);
      await tx.wait();
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting task:', error);
      setError(error.message || 'Failed to submit task');
    } finally {
      setIsUploading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Task Completion</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <textarea 
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Add any additional information about your submission..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Submission File</label>
              <div className="flex flex-col gap-2">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
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
              disabled={isUploading || isSubmitting || !selectedFile}
            >
              {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
