
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletProvider } from '../src/contexts/WalletContext';
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
