import { Buffer } from 'buffer';
import process from 'process';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.process = window.process || process;

  // Add any other polyfills needed for web3 libraries
  if (!window.global) {
    window.global = window;
  }
}

export default function initWeb3Polyfills() {
  // This function is just a marker to ensure the imports above are executed
  console.log('Web3 polyfills initialized');
}

import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia, polygonMumbai, hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';

// Get Alchemy API key from environment variables
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';

// Configure chains with fallbacks
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    process.env.NEXT_PUBLIC_NETWORK_ENV === 'production' ? mainnet :
    process.env.NEXT_PUBLIC_NETWORK_ENV === 'mumbai' ? polygonMumbai :
    process.env.NEXT_PUBLIC_NETWORK_ENV === 'sepolia' ? sepolia :
    hardhat
  ],
  [
    alchemyProvider({ apiKey: alchemyApiKey }),
    publicProvider(),
  ],
);

// Create configuration
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export { chains };

// Add ethereum type to window
declare global {
  interface Window {
    ethereum?: any;
  }
}

export {};