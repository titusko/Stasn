
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import TaskPlatformABI from '../src/contracts/TaskPlatform.json';
import MockTokenABI from '../src/contracts/MockToken.json';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  taskPlatformContract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  taskPlatformContract: null,
  tokenContract: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  isConnecting: false,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [taskPlatformContract, setTaskPlatformContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const TASK_PLATFORM_ADDRESS = process.env.NEXT_PUBLIC_TASK_PLATFORM_ADDRESS;
  const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;

  useEffect(() => {
    // Check if MetaMask is available
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connect();
          }
        } catch (err) {
          console.error("Failed to check existing connection:", err);
        }
      }
    };

    checkConnection();
  }, []);

  const setupContracts = async (signer: ethers.Signer) => {
    try {
      if (!TASK_PLATFORM_ADDRESS || !TOKEN_ADDRESS) {
        setError("Contract addresses not configured");
        return;
      }

      // Initialize contracts
      const taskPlatform = new ethers.Contract(
        TASK_PLATFORM_ADDRESS,
        TaskPlatformABI.abi,
        signer
      );
      
      const token = new ethers.Contract(
        TOKEN_ADDRESS,
        MockTokenABI.abi,
        signer
      );

      setTaskPlatformContract(taskPlatform);
      setTokenContract(token);
    } catch (err) {
      console.error("Failed to setup contracts:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize contracts");
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      
      const signer = await provider.getSigner();
      setSigner(signer);
      
      // Get connected address
      const address = await signer.getAddress();
      setAddress(address);
      
      // Get chain ID
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      
      // Setup contracts
      await setupContracts(signer);
      
      setIsConnected(true);
      
      // Setup event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    } catch (err) {
      console.error("Failed to connect:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
    
    setProvider(null);
    setSigner(null);
    setTaskPlatformContract(null);
    setTokenContract(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect();
    } else {
      // Account changed, update state
      setAddress(accounts[0]);
      connect(); // Reconnect with new account
    }
  };

  const handleChainChanged = () => {
    // Chain changed, reload the page
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        taskPlatformContract,
        tokenContract,
        address,
        chainId,
        connect,
        disconnect,
        isConnected,
        isConnecting,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
