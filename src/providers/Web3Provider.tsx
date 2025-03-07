
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletProvider';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  error: null
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isConnected, address } = useWallet();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (!isConnected || !window.ethereum) {
        return;
      }

      try {
        setError(null);
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const signer = await provider.getSigner();
        setSigner(signer);
        
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }
        
        // Simple ABI for a token contract
        const abi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function transfer(address to, uint256 amount) returns (bool)"
        ];
        
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setContract(contract);
      } catch (err) {
        console.error('Error initializing Web3:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Web3');
      }
    };

    initializeWeb3();
  }, [isConnected, address]);

  return (
    <Web3Context.Provider value={{ provider, signer, contract, error }}>
      {children}
    </Web3Context.Provider>
  );
};
