
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-cyber-dark-900 border-t border-cyber-primary/20 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-cyber text-white mb-4">MONNIVERSE</h3>
            <p className="text-gray-400 text-sm mb-4">
              A decentralized platform for managing and completing tasks in the MONNIVERSE ecosystem
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-heading text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tasks">
                  <a className="text-gray-400 hover:text-cyber-primary text-sm transition-colors">
                    Browse Tasks
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/create-task">
                  <a className="text-gray-400 hover:text-cyber-primary text-sm transition-colors">
                    Create Task
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard">
                  <a className="text-gray-400 hover:text-cyber-primary text-sm transition-colors">
                    Leaderboard
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-heading text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs">
                  <a className="text-gray-400 hover:text-cyber-primary text-sm transition-colors">
                    Documentation
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-cyber-primary text-sm transition-colors">
                    FAQ
                  </a>
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/your-repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyber-primary text-sm transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-heading text-white mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyber-primary text-sm transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyber-primary text-sm transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@example.com"
                  className="text-gray-400 hover:text-cyber-primary text-sm transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cyber-primary/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} MONNIVERSE. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms">
              <a className="text-gray-400 hover:text-cyber-primary text-xs transition-colors">
                Terms of Service
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-cyber-primary text-xs transition-colors">
                Privacy Policy
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
