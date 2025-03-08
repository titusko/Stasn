import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  isLoading: boolean;
  networkError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  isLoading: false,
  networkError: null,
  connect: async () => {},
  disconnect: () => {},
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setNetworkError('Please install MetaMask!');
      return;
    }

    try {
      setIsLoading(true);
      setNetworkError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      setAccount(accounts[0]);

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      setNetworkError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setNetworkError(null);

    if (window?.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (account !== accounts[0]) {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  // Auto-connect if previously connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum?.selectedAddress) {
      connect();
    }
    // Cleanup listeners on unmount
    return () => {
      if (window?.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        isLoading,
        networkError,
        connect,
        disconnect,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}

// Add TypeScript type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
} 