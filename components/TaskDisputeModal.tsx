
import React, { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { useContractWrite } from '../hooks/useContractWrite';
import { getContractForChain } from '../constants/contracts';
import { uploadJSONToIPFS } from '../services/ipfsService';
import { toast } from 'react-hot-toast';

interface TaskDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onSuccess?: (disputeId: string, ipfsHash: string) => void;
}

export function TaskDisputeModal({ isOpen, onClose, taskId, onSuccess }: TaskDisputeModalProps) {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { account, chainId } = useWalletContext();
  
  const taskManagerContract = getContractForChain('TaskManager', chainId || undefined);
  
  const { write, isLoading: isSubmitting, error } = useContractWrite({
    contract: taskManagerContract,
    method: 'disputeTask',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setReason('');
    setEvidence('');
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!reason) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    
    if (!taskId) {
      toast.error('No task selected');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload file to IPFS if selected
      let evidenceIpfsHash = '';
      
      if (selectedFile) {
        const fileBuffer = await selectedFile.arrayBuffer().then(buffer => Buffer.from(buffer));
        const uploadResult = await uploadJSONToIPFS(
          fileBuffer,
          selectedFile.name,
          { type: 'dispute-evidence' }
        );
        evidenceIpfsHash = uploadResult.IpfsHash;
      }
      
      // Create dispute metadata
      const disputeMetadata = {
        taskId,
        reason,
        evidence: evidence || '',
        evidenceFile: evidenceIpfsHash,
        timestamp: new Date().toISOString(),
        disputedBy: account,
      };
      
      // Upload metadata to IPFS
      const metadataResult = await uploadJSONToIPFS(
        disputeMetadata,
        `Dispute for Task #${taskId}`,
        { type: 'dispute-metadata' }
      );
      
      // Create dispute on blockchain
      const result = await write([
        BigInt(taskId),
        reason,
        metadataResult.IpfsHash,
      ]);
      
      toast.success('Dispute submitted successfully!');
      
      // Call success callback
      if (onSuccess && result) {
        onSuccess(
          result.disputeId ? result.disputeId.toString() : '0',
          metadataResult.IpfsHash
        );
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      toast.error(error.message || 'Failed to create dispute');
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
        
        <h2 className="text-xl font-bold mb-4">Dispute Task #{taskId}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Dispute *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                required
                placeholder="Please explain why you are disputing this task..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Evidence
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Provide any additional context or evidence..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evidence File (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload screenshots, documents, or other evidence supporting your dispute
              </p>
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md disabled:bg-red-400"
              >
                {isUploading || isSubmitting ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskDisputeModal;
