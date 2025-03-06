
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Web3Provider } from '../src/providers/Web3Provider';

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
