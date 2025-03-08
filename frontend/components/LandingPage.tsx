
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
