import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import TaskPlatformABI from '../contracts/TaskPlatform.json';
import MockTokenABI from '../contracts/MockToken.json';

// Network configuration
const HARDHAT_CHAIN_ID = '0x7A69'; // 31337 in hex
const HARDHAT_NETWORK = {
  chainId: HARDHAT_CHAIN_ID,
  chainName: 'Hardhat',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
};

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  balance: string;
  isConnected: boolean;
  networkError: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  contract: null,
  tokenContract: null,
  balance: '0',
  isConnected: false,
  networkError: null,
  isLoading: false,
  connect: async () => {},
  disconnect: () => {},
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState('0');
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAndSwitchNetwork = async (provider: ethers.BrowserProvider) => {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    try {
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      if (chainId !== BigInt(parseInt(HARDHAT_CHAIN_ID, 16))) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: HARDHAT_CHAIN_ID }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [HARDHAT_NETWORK],
              });
            } catch (addError) {
              throw new Error('Failed to add Hardhat network to MetaMask');
            }
          } else {
            throw new Error('Failed to switch to Hardhat network');
          }
        }
      }
    } catch (error: any) {
      setNetworkError(error.message);
      throw error;
    }
  };

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setNetworkError('Please install MetaMask!');
      return;
    }

    try {
      setIsLoading(true);
      setNetworkError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      await checkAndSwitchNetwork(provider);
      
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
      }

      if (!process.env.NEXT_PUBLIC_TOKEN_ADDRESS) {
        throw new Error('Token address not configured');
      }

      // Initialize the task platform contract
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        TaskPlatformABI.abi,
        signer
      );

      // Initialize the token contract
      const tokenContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
        MockTokenABI.abi,
        signer
      );

      try {
        const balance = await tokenContract.balanceOf(accounts[0]);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      }
      
      setAccount(accounts[0]);
      setProvider(provider);
      setContract(contract);
      setTokenContract(tokenContract);

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
    setProvider(null);
    setContract(null);
    setTokenContract(null);
    setBalance('0');
    setNetworkError(null);

    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else if (account !== accounts[0]) {
      setAccount(accounts[0]);
      await updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = async () => {
    if (provider) {
      try {
        await checkAndSwitchNetwork(provider);
      } catch (error) {
        disconnect();
      }
    }
  };

  const updateBalance = async (address: string) => {
    if (tokenContract) {
      try {
        const balance = await tokenContract.balanceOf(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      }
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      connect();
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        contract,
        tokenContract,
        balance,
        isConnected: !!account,
        networkError,
        isLoading,
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