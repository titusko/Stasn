
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { TASK_PLATFORM_ADDRESS, TASK_TOKEN_ADDRESS, TaskPlatformABI, TaskTokenABI } from 'contracts-sdk';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  taskContract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  loading: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  taskContract: null,
  tokenContract: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  isCorrectNetwork: false,
  switchNetwork: async () => {},
  loading: false,
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [taskContract, setTaskContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Expected network ID (Hardhat = 31337, Mumbai = 80001, etc.)
  const expectedChainId = 31337;

  const initializeEthers = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        setChainId(chainId);
        setIsCorrectNetwork(chainId === expectedChainId);
        setProvider(provider);
        
        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          setSigner(signer);
          setAccount(await signer.getAddress());
          
          // Initialize contracts
          const taskContract = new ethers.Contract(
            TASK_PLATFORM_ADDRESS,
            TaskPlatformABI,
            signer
          );
          
          const tokenContract = new ethers.Contract(
            TASK_TOKEN_ADDRESS,
            TaskTokenABI,
            signer
          );
          
          setTaskContract(taskContract);
          setTokenContract(tokenContract);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to initialize ethers:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeEthers();
    
    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
        } else {
          // Account changed
          initializeEthers();
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        // Chain changed, refresh
        window.location.reload();
      });
    }
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connect = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      setSigner(signer);
      
      const address = await signer.getAddress();
      setAccount(address);
      
      // Initialize contracts with signer
      const taskContract = new ethers.Contract(
        TASK_PLATFORM_ADDRESS,
        TaskPlatformABI,
        signer
      );
      
      const tokenContract = new ethers.Contract(
        TASK_TOKEN_ADDRESS,
        TaskTokenABI,
        signer
      );
      
      setTaskContract(taskContract);
      setTokenContract(tokenContract);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setSigner(null);
    setAccount(null);
    setTaskContract(null);
    setTokenContract(null);
    setIsConnected(false);
  };

  const switchNetwork = async () => {
    if (!provider) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // This error code means the chain has not been added to MetaMask
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${expectedChainId.toString(16)}`,
              chainName: 'Local Hardhat Network',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
            },
          ],
        });
      } else {
        console.error("Failed to switch network:", error);
      }
    }
  };

  const value = {
    provider,
    signer,
    account,
    chainId,
    taskContract,
    tokenContract,
    isConnected,
    connect,
    disconnect,
    isCorrectNetwork,
    switchNetwork,
    loading,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
