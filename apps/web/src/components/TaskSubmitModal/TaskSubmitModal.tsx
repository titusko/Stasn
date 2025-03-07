
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIpfsUpload } from '@/hooks/useIpfsUpload';
import { useContractWrite } from '@/hooks/useContractWrite';
import { TaskContract } from 'contracts-sdk';
import { AlertCircle, Upload, FileIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaskSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (taskId: string, ipfsHash: string) => void;
}

export function TaskSubmitModal({ isOpen, onClose, onSuccess }: TaskSubmitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadFile, isUploading, error: uploadError, uploadResult } = useIpfsUpload();
  
  const { write, isLoading: isSubmitting, error: contractError } = useContractWrite({
    contract: TaskContract,
    method: 'submitTask',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      return;
    }
    
    try {
      // Step 1: Upload file to IPFS if selected
      let ipfsHash = '';
      
      if (selectedFile) {
        const result = await uploadFile(selectedFile, {
          name: title,
          metadata: {
            description,
          },
        });
        ipfsHash = result.IpfsHash;
      }
      
      // Step 2: Create metadata for task
      const taskMetadata = {
        title,
        description,
        attachment: ipfsHash || '',
        timestamp: new Date().toISOString(),
      };
      
      // Step 3: Submit to blockchain
      const result = await write([title, JSON.stringify(taskMetadata)]);
      
      // Step 4: Handle success
      if (result && onSuccess) {
        onSuccess(result.taskId.toString(), ipfsHash);
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const error = uploadError || contractError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="attachment">Attachment (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('attachment')?.click()}
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
