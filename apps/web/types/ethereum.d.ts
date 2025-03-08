import { ExternalProvider } from "@ethersproject/providers";

type RequestArguments = {
  method: string;
  params?: unknown[] | object;
};

interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}

interface ProviderMessage {
  type: string;
  data: unknown;
}

interface ProviderInfo {
  chainId: string;
}

interface ProviderConnectInfo {
  chainId: string;
}

type EthereumEventMap = {
  connect: ProviderConnectInfo;
  disconnect: ProviderRpcError;
  accountsChanged: string[];
  chainChanged: string;
  message: ProviderMessage;
};

type EventHandler<T> = (args: T) => void;

interface MetaMaskEthereumProvider extends ExternalProvider {
  isMetaMask?: boolean;
  isConnected: () => boolean;
  request(args: RequestArguments): Promise<unknown>;
  // Specific event handlers
  on(event: 'accountsChanged', handler: EventHandler<string[]>): void;
  on(event: 'chainChanged', handler: EventHandler<string>): void;
  on(event: 'connect', handler: EventHandler<ProviderConnectInfo>): void;
  on(event: 'disconnect', handler: EventHandler<ProviderRpcError>): void;
  on(event: 'message', handler: EventHandler<ProviderMessage>): void;
  // Generic event handler
  on(event: string, handler: (...args: any[]) => void): void;
  
  // Specific event removers
  removeListener(event: 'accountsChanged', handler: EventHandler<string[]>): void;
  removeListener(event: 'chainChanged', handler: EventHandler<string>): void;
  removeListener(event: 'connect', handler: EventHandler<ProviderConnectInfo>): void;
  removeListener(event: 'disconnect', handler: EventHandler<ProviderRpcError>): void;
  removeListener(event: 'message', handler: EventHandler<ProviderMessage>): void;
  // Generic event remover
  removeListener(event: string, handler: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: MetaMaskEthereumProvider;
  }
} 