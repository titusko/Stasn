
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const WalletConnector: React.FC = () => {
  const { address, isConnected } = useAccount();
  
  return (
    <div className="flex items-center space-x-4">
      {isConnected && (
        <span className="text-sm text-gray-600 hidden md:inline">
          {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </span>
      )}
      <ConnectButton 
        showBalance={false}
        chainStatus="icon"
        accountStatus="address"
      />
    </div>
  );
};

export default WalletConnector;
