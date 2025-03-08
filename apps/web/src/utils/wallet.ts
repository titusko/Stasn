import { ethers } from 'ethers';

export async function connectWallet(): Promise<string | null> {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application!');
      return null;
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
    
    if (accounts && accounts.length > 0) {
      return accounts[0];
    }

    return null;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
}

export function getProvider(): ethers.BrowserProvider | null {
  if (!window.ethereum) {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  const provider = getProvider();
  if (!provider) {
    return null;
  }
  try {
    return await provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
}

export function listenToAccountChanges(callback: (accounts: string[]) => void): void {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.on('accountsChanged', (accounts: string[]) => callback(accounts));
}

export function listenToChainChanges(callback: (chainId: string) => void): void {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.on('chainChanged', (chainId: unknown) => callback(chainId as string));
}

export function removeAccountsListener(callback: (accounts: string[]) => void): void {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.removeListener('accountsChanged', callback);
}

export function removeChainListener(callback: (chainId: string) => void): void {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.removeListener('chainChanged', callback);
} 