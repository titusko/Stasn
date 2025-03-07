interface EthereumProvider {
  isMetaMask?: boolean;
  selectedAddress?: string | null;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, callback: (params: any) => void) => void;
  removeListener: (eventName: string, callback: (params: any) => void) => void;
  send: (method: string, params?: any[]) => Promise<any>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
} 