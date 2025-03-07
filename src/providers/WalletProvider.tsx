import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: Error | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect, isLoading: isConnecting, error: connectError } = useConnect({ connector: new InjectedConnector() });
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (connectError) {
      setError(connectError);
    }
  }, [connectError]);

  const handleConnect = async () => {
    try {
      setError(null);
      await connect();
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    }
  };

  const handleDisconnect = () => {
    try {
      wagmiDisconnect();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!isConnected,
        connect: handleConnect,
        disconnect: handleDisconnect,
        isConnecting,
        error
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};