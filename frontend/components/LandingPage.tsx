
import React from 'react';
import { useWallet } from '../src/providers/WalletProvider';

const LandingPage: React.FC = () => {
  const { connect, isConnected } = useWallet();

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar is imported in the layout */}
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="flex justify-end items-center h-16 px-6 bg-gray-900 border-b border-gray-800">
          <button
            onClick={connect}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Connect Wallet
          </button>
        </header>
        
        {/* Main Content */}
        <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center text-white text-2xl">
            Please connect your wallet to continue
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
import React from 'react';
import { Button } from './ui/Button';

interface LandingPageProps {
  onConnectWallet: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onConnectWallet }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-dark-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Lagoon</h1>
        <p className="text-lg text-gray-300 max-w-md">
          A decentralized task platform that allows you to create, take on, and complete tasks with crypto rewards.
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center mt-8">
        <p className="text-xl mb-6">Please connect your wallet to continue</p>
        <Button 
          onClick={onConnectWallet} 
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-md flex items-center"
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
