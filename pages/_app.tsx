
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletProvider } from '../src/providers/WalletProvider';
import { Web3Provider } from '../src/providers/Web3Provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Web3Provider>
          <Component {...pageProps} />
        </Web3Provider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
