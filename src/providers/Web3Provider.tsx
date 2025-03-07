
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
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';
import TaskManagerABI from '../artifacts/contracts/TaskManager.sol/TaskManager.json';

interface Web3ContextType {
  contract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  contract: null,
  provider: null,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!isConnected || !window.ethereum) {
          return;
        }

        setError(null);
        
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);
        
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }
        
        const signer = web3Provider.getSigner();
        const tokenContract = new ethers.Contract(
          contractAddress,
          TaskManagerABI.abi,
          signer
        );
        
        setContract(tokenContract);
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Web3');
      }
    };

    initializeContract();
  }, [isConnected]);

  return (
    <Web3Context.Provider value={{ contract, provider, error }}>
      {children}
    </Web3Context.Provider>
  );
};
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers, Contract } from 'ethers';
import { useWallet } from './WalletProvider';

// Mock ABI for testing - replace with your actual ABI
const mockAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

interface Web3ContextType {
  contract: Contract | null;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  contract: null,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const { provider, isConnected } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (!provider || !isConnected) {
        setContract(null);
        return;
      }

      try {
        setError(null);
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        
        if (!contractAddress) {
          throw new Error('Contract address not found in environment variables');
        }

        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, mockAbi, signer);
        
        setContract(tokenContract);
      } catch (err) {
        console.error('Error initializing contract:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize contract');
        setContract(null);
      }
    };

    initializeContract();
  }, [provider, isConnected]);

  return (
    <Web3Context.Provider
      value={{
        contract,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
