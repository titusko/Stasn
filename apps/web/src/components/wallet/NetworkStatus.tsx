import { useEffect, useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

export function NetworkStatus() {
  const { provider } = useWeb3();
  const [networkName, setNetworkName] = useState<string>('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          const chainId = network.chainId;
          setIsCorrectNetwork(chainId === BigInt(31337)); // Hardhat chainId
          setNetworkName(network.name === 'unknown' ? 'Hardhat' : network.name);
        } catch (error) {
          console.error('Error checking network:', error);
          setNetworkName('Unknown');
          setIsCorrectNetwork(false);
        }
      }
    };

    checkNetwork();
  }, [provider]);

  if (!provider) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        {networkName}
      </span>
    </div>
  );
} 