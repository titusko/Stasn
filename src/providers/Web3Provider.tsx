
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletProvider';

// ABI should be minimal for now - we'll expand it with actual contract methods
const CONTRACT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

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
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const { address, isConnected } = useWallet();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window === 'undefined' || !window.ethereum) {
        setError('No Ethereum browser extension detected');
        return;
      }

      try {
        setError(null);
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        // Only get signer if connected
        if (isConnected && address) {
          const ethSigner = await browserProvider.getSigner();
          setSigner(ethSigner);

          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
          if (contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000') {
            const tokenContract = new ethers.Contract(
              contractAddress,
              CONTRACT_ABI,
              ethSigner
            );
            setContract(tokenContract);
          } else {
            setError('Invalid contract address');
            setContract(null);
          }
        } else {
          setSigner(null);
          setContract(null);
        }
      } catch (err) {
        console.error('Failed to initialize provider:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Web3');
        setProvider(null);
        setSigner(null);
        setContract(null);
      }
    };

    initProvider();
  }, [address, isConnected]);

  return (
    <Web3Context.Provider value={{ provider, signer, contract, error }}>
      {children}
    </Web3Context.Provider>
  );
};
