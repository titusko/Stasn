
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';

// Import your contract ABIs
// These will need to be updated with the correct paths to your contract ABIs
const TaskManagerABI = require('../../blockchain/artifacts/contracts/TaskManager.sol/TaskManager.json').abi;
const TaskTokenABI = require('../../blockchain/artifacts/contracts/TaskToken.sol/TaskToken.json').abi;

interface Web3ContextType {
  taskManager: ethers.Contract | null;
  taskToken: ethers.Contract | null;
  loadingContracts: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  taskManager: null,
  taskToken: null,
  loadingContracts: true,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { provider, signer, isConnected } = useWallet();
  const [taskManager, setTaskManager] = useState<ethers.Contract | null>(null);
  const [taskToken, setTaskToken] = useState<ethers.Contract | null>(null);
  const [loadingContracts, setLoadingContracts] = useState(true);

  useEffect(() => {
    const initContracts = async () => {
      if (isConnected && provider && signer) {
        try {
          setLoadingContracts(true);
          
          const taskManagerAddress = process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS;
          const taskTokenAddress = process.env.NEXT_PUBLIC_TASK_TOKEN_ADDRESS;
          
          if (!taskManagerAddress || !taskTokenAddress) {
            console.error("Contract addresses not found in environment variables");
            return;
          }
          
          const taskManager = new ethers.Contract(
            taskManagerAddress,
            TaskManagerABI,
            signer
          );
          
          const taskToken = new ethers.Contract(
            taskTokenAddress,
            TaskTokenABI,
            signer
          );
          
          setTaskManager(taskManager);
          setTaskToken(taskToken);
        } catch (error) {
          console.error("Error initializing contracts:", error);
        } finally {
          setLoadingContracts(false);
        }
      } else {
        setTaskManager(null);
        setTaskToken(null);
        setLoadingContracts(false);
      }
    };

    initContracts();
  }, [isConnected, provider, signer]);

  return (
    <Web3Context.Provider
      value={{
        taskManager,
        taskToken,
        loadingContracts,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
