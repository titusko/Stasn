import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TaskPlatformAddress, TaskPlatformABI } from '@/contracts/TaskPlatform';

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  address: string | null;
  chainId: number | null;
  error: string | null;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    contract: null,
    address: null,
    chainId: null,
    error: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('Please install MetaMask');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        const contract = new ethers.Contract(
          TaskPlatformAddress,
          TaskPlatformABI,
          signer
        );

        setState({
          provider,
          signer,
          contract,
          address,
          chainId,
          error: null,
        });

        const handleAccountsChanged = ((...args: unknown[]) => {
          const accounts = args[0] as string[];
          if (accounts.length === 0) {
            setState(prev => ({ ...prev, address: null, error: 'Please connect to MetaMask' }));
          } else {
            setState(prev => ({ ...prev, address: accounts[0], error: null }));
          }
        }) as (...args: unknown[]) => void;

        const handleChainChanged = ((...args: unknown[]) => {
          window.location.reload();
        }) as (...args: unknown[]) => void;

        if (window.ethereum?.on) {
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);

          return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
          };
        }

      } catch (error) {
        console.error('Web3 initialization error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize Web3',
        }));
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (Array.isArray(accounts) && accounts.length > 0) {
        const address = accounts[0] as string;
        setState(prev => ({ ...prev, address, error: null }));
      }
    } catch (error) {
      console.error('Connection error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  };

  return {
    ...state,
    connectWallet,
  };
} 