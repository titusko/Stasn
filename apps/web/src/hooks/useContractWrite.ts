
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWalletContext } from '@/contexts/WalletContext';

interface ContractWriteOptions {
  contract: {
    address: string;
    abi: any[];
  };
  method: string;
  onSuccess?: (receipt: ethers.TransactionReceipt) => void;
  onError?: (error: Error) => void;
}

export function useContractWrite({
  contract,
  method,
  onSuccess,
  onError,
}: ContractWriteOptions) {
  const { signer } = useWalletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ethers.TransactionReceipt | null>(null);

  const write = useCallback(
    async (args: any[] = []) => {
      if (!signer) {
        const walletError = new Error('Wallet not connected');
        setError('Wallet not connected');
        onError?.(walletError);
        throw walletError;
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setReceipt(null);

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          signer
        );

        // Execute the contract method
        const tx = await contractInstance[method](...args);
        setTxHash(tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        setReceipt(receipt);
        onSuccess?.(receipt);
        
        return {
          tx,
          receipt,
          taskId: receipt.events?.find(e => e.event === 'TaskSubmitted')?.args?.taskId
        };
      } catch (err: any) {
        const errorMessage = err.reason || err.message || 'Transaction failed';
        setError(errorMessage);
        onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [signer, contract, method, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setTxHash(null);
    setReceipt(null);
  }, []);

  return {
    write,
    isLoading,
    error,
    txHash,
    receipt,
    reset,
  };
}
