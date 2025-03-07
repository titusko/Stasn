import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';
import { usePublicClient } from 'wagmi';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConnected } = useWallet();
  const publicClient = usePublicClient();

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (!isConnected || !window.ethereum) {
          return;
        }

        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const newSigner = await newProvider.getSigner();
        setSigner(newSigner);

        // Initialize contract if you have ABI and address
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (contractAddress) {
          try {
            // You would need to import your ABI here.  Placeholder for now.
            const contractABI = []; // Replace with your actual ABI
            const newContract = new ethers.Contract(contractAddress, contractABI, newSigner);
            setContract(newContract);
          } catch (contractError) {
            console.error('Contract initialization error:', contractError);
            setError('Failed to initialize contract');
          }
        }
      } catch (err) {
        console.error('Web3 initialization error:', err);
        setError('Failed to initialize Web3');
      }
    };

    initializeWeb3();
  }, [isConnected, publicClient]);

  return (
    <Web3Context.Provider value={{ provider, signer, contract, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};