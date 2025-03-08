
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { TaskPlatformAbi } from 'contracts-sdk';

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  taskContract: ethers.Contract | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectNetwork: boolean;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  taskContract: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  isCorrectNetwork: false,
  switchNetwork: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [taskContract, setTaskContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Contract address - would come from environment in production
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x123...'; // Replace with actual contract address
  const requiredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || '80001'); // Polygon Mumbai by default

  useEffect(() => {
    // Check if we have a stored connection
    if (typeof window !== 'undefined') {
      const storedAccount = localStorage.getItem('connectedAccount');
      if (storedAccount) {
        connect();
      }
    }
  }, []);

  useEffect(() => {
    if (provider && account) {
      setUpEventListeners();
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [provider, account]);

  useEffect(() => {
    if (chainId) {
      setIsCorrectNetwork(chainId === requiredChainId);
    }
  }, [chainId, requiredChainId]);

  const setUpEventListeners = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        disconnect();
      });
    }
  };

  const connect = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethSigner = ethProvider.getSigner();
        const address = accounts[0];
        const network = await ethProvider.getNetwork();
        
        // Create contract instance
        const contract = new ethers.Contract(
          contractAddress,
          TaskPlatformAbi,
          ethSigner
        );
        
        setProvider(ethProvider);
        setSigner(ethSigner);
        setAccount(address);
        setChainId(network.chainId);
        setTaskContract(contract);
        setIsConnected(true);
        
        // Store connection
        localStorage.setItem('connectedAccount', address);
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      console.log('No Ethereum browser extension detected');
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setTaskContract(null);
    setIsConnected(false);
    localStorage.removeItem('connectedAccount');
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requiredChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain is not added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${requiredChainId.toString(16)}`,
                chainName: 'Polygon Mumbai',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding the network to MetaMask', addError);
        }
      } else {
        console.error('Error switching network', error);
      }
    }
  };

  const contextValue: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    taskContract,
    isConnected,
    connect,
    disconnect,
    isCorrectNetwork,
    switchNetwork,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};
