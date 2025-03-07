import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Web3Provider } from '@/contexts/Web3Context';
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </AuthProvider>
  );
} 