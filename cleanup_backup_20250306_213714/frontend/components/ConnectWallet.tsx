'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const HARDHAT_NETWORK_ID = '31337';
const HARDHAT_NETWORK_PARAMS = {
  chainId: '0x7A69', // 31337 in hex
  chainName: 'Hardhat Network',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545'],
};

export function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const checkAndSwitchNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== HARDHAT_NETWORK_ID) {
        try {
          await window.ethereum?.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(HARDHAT_NETWORK_ID).toString(16)}` }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum?.request({
              method: 'wallet_addEthereumChain',
              params: [HARDHAT_NETWORK_PARAMS],
            });
          } else {
            throw switchError;
          }
        }
      }
      setNetworkError(null);
    } catch (error) {
      console.error('Error switching network:', error);
      setNetworkError('Please connect to the Hardhat network');
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await checkAndSwitchNetwork(provider);
        
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(provider);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    if (provider) {
      window.ethereum?.on('chainChanged', () => {
        checkAndSwitchNetwork(provider);
      });
    }
  }, [provider]);

  return (
    <div className="flex flex-col items-start gap-4">
      {account ? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Connected:</span>
            <span className="text-sm font-medium">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
          {networkError && (
            <div className="text-red-500 text-sm">{networkError}</div>
          )}
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
} 