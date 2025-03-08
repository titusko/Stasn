import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'MONNIVERSE - Web3 Task Platform',
    template: '%s | MONNIVERSE'
  },
  description: 'A decentralized platform for managing and completing tasks in the MONNIVERSE ecosystem',
  keywords: ['blockchain', 'tasks', 'decentralized', 'ethereum', 'web3', 'monniverse'],
  authors: [{ name: 'MONNIVERSE Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
  themeColor: '#ec4899', // Pink-500 color
  manifest: '/manifest.json',
}; 