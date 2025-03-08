
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';

export default function Header() {
  const { isConnected, connect, disconnect, account } = useWeb3();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function shortenAddress(address: string) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-cyber-dark/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <span className="font-cyber text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary">
                MONNIVERSE
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-gray-300 hover:text-white transition-colors">Home</a>
            </Link>
            <Link href="/tasks">
              <a className="text-gray-300 hover:text-white transition-colors">Tasks</a>
            </Link>
            <Link href="/leaderboard">
              <a className="text-gray-300 hover:text-white transition-colors">Leaderboard</a>
            </Link>
            {isConnected && (
              <Link href="/profile">
                <a className="text-gray-300 hover:text-white transition-colors">Profile</a>
              </Link>
            )}
          </nav>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm bg-cyber-dark-800 text-white px-3 py-1 rounded-lg border border-cyber-primary/30">
                  {shortenAddress(account)}
                </span>
                <button
                  onClick={disconnect}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="bg-cyber-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-cyber-dark-800 border-t border-cyber-primary/20 px-4 py-4">
          <nav className="flex flex-col space-y-4">
            <Link href="/">
              <a className="text-gray-300 hover:text-white transition-colors">Home</a>
            </Link>
            <Link href="/tasks">
              <a className="text-gray-300 hover:text-white transition-colors">Tasks</a>
            </Link>
            <Link href="/leaderboard">
              <a className="text-gray-300 hover:text-white transition-colors">Leaderboard</a>
            </Link>
            {isConnected && (
              <Link href="/profile">
                <a className="text-gray-300 hover:text-white transition-colors">Profile</a>
              </Link>
            )}
            
            {/* Mobile Wallet Connection */}
            {isConnected ? (
              <div className="flex flex-col space-y-2 pt-2 border-t border-cyber-primary/20">
                <span className="text-sm bg-cyber-dark-900 text-white px-3 py-2 rounded-lg">
                  {shortenAddress(account)}
                </span>
                <button
                  onClick={disconnect}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="mt-2 bg-cyber-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
