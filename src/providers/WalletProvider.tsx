
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  chainId: null,
  isConnected: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const connect = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();
        const signer = provider.getSigner();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(network.chainId);
      } else {
        console.error("No Ethereum provider found");
        throw new Error("No Ethereum provider found");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnect();
        }
      });

      window.ethereum.on('chainChanged', (_chainId: string) => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        connect,
        disconnect,
        chainId,
        isConnected: !!account,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { InjectedConnector } from '@wagmi/core';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  loading: boolean;
  error: Error | null;
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
  loading: false,
  error: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect, isPending: connectPending, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect, isPending: disconnectPending, error: disconnectError } = useDisconnect();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (connectError || disconnectError) {
      setError(connectError || disconnectError);
    } else {
      setError(null);
    }
  }, [connectError, disconnectError]);

  useEffect(() => {
    setLoading(connectPending || disconnectPending);
  }, [connectPending, disconnectPending]);

  const connect = () => {
    try {
      wagmiConnect({ connector: new InjectedConnector() });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(error instanceof Error ? error : new Error('Failed to connect wallet'));
    }
  };

  const disconnect = () => {
    try {
      wagmiDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError(error instanceof Error ? error : new Error('Failed to disconnect wallet'));
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect,
        loading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  provider: null,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeEthers = async () => {
    // Check if window is defined (browser environment)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        return provider;
      } catch (error) {
        console.error('Failed to initialize ethers:', error);
        return null;
      }
    }
    return null;
  };

  const connect = async () => {
    try {
      const ethersProvider = provider || await initializeEthers();
      if (!ethersProvider) throw new Error('No ethereum provider found');
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = ethersProvider.getSigner();
      const currentAddress = await signer.getAddress();
      
      setAddress(currentAddress);
      setIsConnected(true);
      
      // Set up account change listener
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return currentAddress;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    
    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect();
    } else if (accounts[0] !== address) {
      // User switched accounts
      setAddress(accounts[0]);
    }
  };

  useEffect(() => {
    // Initialize on mount
    initializeEthers();
    
    // Check if already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        })
        .catch(console.error);
    }
    
    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
        isConnected,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
