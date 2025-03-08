
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { TaskPlatform } from 'contracts-sdk';

// Define environment variables with fallbacks
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TASK_PLATFORM_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';

// Define types
type Web3ContextType = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
  error: string | null;
};

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  isCorrectNetwork: false,
  switchNetwork: async () => {},
  error: null,
});

// Provider component
export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Network configuration
  const requiredChainId = 11155111; // Sepolia testnet
  const isCorrectNetwork = chainId === requiredChainId;

  // Initialize provider from window.ethereum
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Create ethers provider from window.ethereum
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Get chain ID
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));

          // Check if user is already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setSigner(signer);
            setAddress(accounts[0].address);
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Error initializing web3:', err);
          setError('Failed to initialize web3 provider');
        }
      } else {
        setError('No Ethereum wallet detected. Please install MetaMask.');
      }
    };

    initProvider();
  }, []);

  // Initialize contract when signer is available
  useEffect(() => {
    const initContract = async () => {
      if (signer && CONTRACT_ADDRESS) {
        try {
          const taskPlatform = new ethers.Contract(
            CONTRACT_ADDRESS,
            TaskPlatform.abi,
            signer
          );
          setContract(taskPlatform);
          setError(null);
        } catch (err) {
          console.error('Error initializing contract:', err);
          setError('Failed to initialize contract');
        }
      }
    };

    initContract();
  }, [signer]);

  // Setup event listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
        } else {
          // User switched accounts
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        // Chain changed, reload the page
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Connect wallet
  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setError(null);
        
        // Request accounts
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Reinitialize provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const signer = await provider.getSigner();
        setSigner(signer);
        setAddress(await signer.getAddress());
        
        // Get chain ID
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
        
        setIsConnected(true);
      } catch (err) {
        console.error('Error connecting wallet:', err);
        setError('Failed to connect wallet');
      }
    } else {
      setError('No Ethereum wallet detected. Please install MetaMask.');
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
    setContract(null);
  };

  // Switch network
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      setError(null);
      
      // Try to switch to the required network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
      });
    } catch (err: any) {
      // If the error code is 4902, the chain hasn't been added
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${requiredChainId.toString(16)}`,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          setError('Failed to add network');
        }
      } else {
        console.error('Error switching network:', err);
        setError('Failed to switch network');
      }
    }
  };

  const value = {
    provider,
    signer,
    contract,
    address,
    chainId,
    connect,
    disconnect,
    isConnected,
    isCorrectNetwork,
    switchNetwork,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Hook for using Web3 context
export const useWeb3 = () => useContext(Web3Context);

export default Web3Context;
