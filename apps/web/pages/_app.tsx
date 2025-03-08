
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Web3Provider } from '@/contexts/Web3Context';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </Web3Provider>
  );
}

export default MyApp;
