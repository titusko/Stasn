
import { useState, useCallback } from 'react';
import { ethers, ContractInterface } from 'ethers';
import { useWalletContext } from '../contexts/WalletContext';
import { toast } from 'react-hot-toast';

interface UseContractWriteProps {
  contract: {
    address: string;
    abi: ContractInterface;
  };
  method: string;
}

interface TransactionResponse {
  hash: string;
  wait: () => Promise<ethers.providers.TransactionReceipt>;
}

export function useContractWrite<T = any>({ contract, method }: UseContractWriteProps) {
  const { signer, isConnected } = useWalletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const write = useCallback(
    async (args: any[] = []): Promise<T | null> => {
      if (!signer || !isConnected) {
        const error = new Error('Wallet not connected');
        setError(error);
        toast.error('Please connect your wallet first');
        return null;
      }

      setIsLoading(true);
      setError(null);
      setData(null);
      setTxHash(null);

      try {
        const contractInstance = new ethers.Contract(
          contract.address,
          contract.abi,
          signer
        );

        const gasEstimate = await contractInstance.estimateGas[method](...args);
        const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer

        const tx: TransactionResponse = await contractInstance[method](...args, {
          gasLimit,
        });

        setTxHash(tx.hash);
        toast.loading(`Transaction submitted: ${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`);

        const receipt = await tx.wait();
        
        // Try to parse event logs for result data
        let resultData: any = null;
        try {
          const eventSignature = Object.keys(contractInstance.interface.events).find(
            (event) => event.startsWith(method)
          );
          
          if (eventSignature && receipt.logs.length > 0) {
            const event = receipt.logs
              .map((log) => {
                try {
                  return contractInstance.interface.parseLog(log);
                } catch (e) {
                  return null;
                }
              })
              .find((parsedLog) => parsedLog && parsedLog.name === eventSignature.split('(')[0]);
            
            if (event) {
              resultData = event.args;
            }
          }
        } catch (e) {
          console.error('Error parsing event logs:', e);
        }

        setData(resultData as T);
        toast.success('Transaction successful!');
        return resultData as T;
      } catch (err: any) {
        console.error('Contract write error:', err);
        let errorMessage = 'Transaction failed';
        
        // Parse error message from blockchain
        if (err.reason) {
          errorMessage = err.reason;
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        } else if (err.message) {
          // Clean up common ethers error messages
          errorMessage = err.message.replace(/execution reverted: /i, '');
          if (errorMessage.includes('user rejected transaction')) {
            errorMessage = 'Transaction rejected by user';
          }
        }
        
        const error = new Error(errorMessage);
        setError(error);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, method, signer, isConnected]
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setTxHash(null);
  }, []);

  return {
    write,
    isLoading,
    error,
    data,
    txHash,
    reset,
  };
}

export default useContractWrite;
