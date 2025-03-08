import { ExternalProvider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: ExternalProvider & {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
      selectedAddress?: string;
      networkVersion?: string;
      chainId?: string;
    };
  }
} 