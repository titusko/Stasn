
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import LandingPage from '../components/LandingPage';
import Sidebar from '../components/Sidebar';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  const handleConnectWallet = async () => {
    try {
      // This is where you would implement your wallet connection logic
      // For now, we'll just simulate a successful connection
      console.log('Connecting wallet...');
      
      // Simulate connection success
      setTimeout(() => {
        setIsConnected(true);
        // router.push('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="flex h-screen bg-dark-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-end p-4 border-b border-gray-700">
          <button 
            onClick={handleConnectWallet}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
          >
            Connect Wallet
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          {!isConnected ? (
            <div className="text-center text-white">
              <h1 className="text-2xl mb-4">Please connect your wallet to continue</h1>
            </div>
          ) : (
            <div className="text-center text-white">
              <h1 className="text-2xl mb-4">Wallet connected!</h1>
              <p>You can now access the platform features.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
