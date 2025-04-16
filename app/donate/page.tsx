'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

export default function Donate() {
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  
  // Sample cryptocurrency wallets - replace with your actual wallet addresses
  const wallets = [
    {
      name: 'Bitcoin (BTC)',
      address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      icon: '₿',
      color: 'bg-amber-600'
    },
    {
      name: 'Ethereum (ETH)',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      icon: 'Ξ',
      color: 'bg-blue-600'
    },
    {
      name: 'Dogecoin (DOGE)',
      address: 'D8vFz4p1L37jdg9cL4PxwvVpP2xczDQus7',
      icon: 'Ð',
      color: 'bg-yellow-500'
    },
    {
      name: 'Litecoin (LTC)',
      address: 'LRB7FkngeygGZvpwNj3wJbD1kKStZwcx1Z',
      icon: 'Ł',
      color: 'bg-gray-400'
    }
  ];
  
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedWallet(address);
        setTimeout(() => setCopiedWallet(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy address:', err);
      });
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header />
      
      <div className="card p-8 mb-8 border-l-4 border-indigo-500 bg-indigo-900/20 rounded-lg">
        <h1 className="text-3xl font-bold text-indigo-300 mb-6">Support Hellenistic</h1>
        
        <div className="space-y-6 text-gray-200">
          <p className="text-lg">
            Hellenistic is provided as a free tool to help language learners. If you find it useful and would like to support 
            its continued development, please consider making a cryptocurrency donation.
          </p>
          
          <div className="bg-indigo-800/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-indigo-200 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Cryptocurrency Donations
            </h2>
            
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div key={wallet.name} className="bg-indigo-950/70 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className={`${wallet.color} h-8 w-8 flex items-center justify-center text-white font-bold rounded-full mr-3`}>
                      {wallet.icon}
                    </div>
                    <h3 className="text-lg font-medium text-indigo-200">{wallet.name}</h3>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative flex-grow">
                      <input 
                        type="text" 
                        value={wallet.address}
                        readOnly
                        className="w-full bg-indigo-900/40 border border-indigo-700/50 rounded-lg py-2 px-3 text-sm text-gray-300 font-mono"
                      />
                    </div>
                    <button 
                      onClick={() => copyToClipboard(wallet.address)}
                      className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                      {copiedWallet === wallet.address ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copied
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                          </svg>
                          Copy
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-indigo-200">What Your Donation Supports</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Server costs and ongoing maintenance</li>
              <li>Development of new features and improvements</li>
              <li>Expanded vocabulary database and learning resources</li>
              <li>Support for additional language pairs</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center p-6 bg-indigo-800/20 rounded-lg">
            <p className="text-indigo-200 mb-2">Thank you for supporting Hellenistic!</p>
            <p className="text-gray-400 text-sm">
              Every donation, no matter how small, helps keep this project alive and growing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 