'use client';

import { Inter, Space_Grotesk, Orbitron } from 'next/font/google';
import { Web3Provider } from '@/contexts/Web3Context';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
});

const orbitron = Orbitron({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron'
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable}`}>
      <head>
        <title>Task Platform - Decentralized Task Management</title>
        <meta name="description" content="A decentralized platform for managing and completing tasks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-cyber-dark min-h-screen text-white font-cyber antialiased">
        <div className="fixed inset-0 bg-gradient-cyber opacity-50 pointer-events-none" />
        <Web3Provider>
          <div className="relative z-10">
            {children}
          </div>
        </Web3Provider>
      </body>
    </html>
  );
} 