'use client';

import { Web3Provider } from '@/contexts/Web3Context';
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { NetworkStatus } from "@/components/wallet/NetworkStatus";
import { TaskList } from "@/components/tasks/TaskList";
import { CreateTask } from "@/components/tasks/CreateTask";
import { useWeb3 } from '@/contexts/Web3Context';

function Dashboard() {
  const { isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Monniverse Lagoon
          </h2>
          <p className="text-gray-600">
            Connect your wallet to start exploring and completing quests
          </p>
        </div>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Create New Quest</h2>
        <CreateTask />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Quests</h2>
        <TaskList />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Web3Provider>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900">
              Monniverse Lagoon
            </h1>
            <div className="flex items-center gap-4">
              <NetworkStatus />
              <ConnectWallet />
            </div>
          </div>
          <p className="text-lg text-gray-600">
            Explore and complete quests in the Monniverse ecosystem
          </p>
        </header>

        <main>
          <Dashboard />
        </main>
      </div>
    </Web3Provider>
  );
} 