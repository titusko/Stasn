
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ipfsService } from '../services/ipfsService';
import { useContractWrite } from '@/hooks/useContractWrite';
import { TASK_MANAGER_ADDRESS, TASK_MANAGER_ABI } from '@/constants/contracts';

interface TaskDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (disputeHash: string, taskId: string) => void;
  taskId: string;
}

export function TaskDisputeModal({ isOpen, onClose, onSuccess, taskId }: TaskDisputeModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { write: submitDispute, isLoading: isSubmitting } = useContractWrite({
    contract: {
      address: TASK_MANAGER_ADDRESS,
      abi: TASK_MANAGER_ABI,
    },
    method: 'disputeTask',
    onSuccess: (receipt) => {
      // Handle transaction success
      if (onSuccess && disputeHash) {
        onSuccess(disputeHash, taskId);
      }
      onClose();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [disputeHash, setDisputeHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please provide a reason for disputing');
      return;
    }

    try {
      setError(null);
      
      // Upload dispute data
      const disputeData = {
        taskId,
        reason,
        timestamp: Date.now()
      };
      
      const result = await ipfsService.uploadJson(disputeData);
      setDisputeHash(result.IpfsHash);
      
      // Submit dispute to smart contract
      await submitDispute([taskId, result.IpfsHash]);
      
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      setError(error.message || 'Failed to submit dispute');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Dispute Task</DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for Dispute
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why you are disputing this task..."
                rows={4}
                required
              />
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!reason || isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskDisputeModal;
