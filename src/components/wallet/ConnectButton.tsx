
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import Button from '../common/Button';

const ConnectButton: React.FC = () => {
  const { connectWallet, disconnectWallet, isConnected, address } = useWallet();

  return (
    <div>
      {isConnected ? (
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          variant="primary" 
          onClick={connectWallet}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default ConnectButton;
