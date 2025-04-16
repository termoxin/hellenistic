'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import GreekFlagLogo from './GreekFlagLogo';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="flex justify-between items-center mb-8">
      <Link href="/" className="flex items-center gap-3">
        <GreekFlagLogo width={80} height={48} className="hover:scale-110 transition-transform duration-300" />
        <div>
          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Hellenistic</span>
          <span className="block text-lg font-medium mt-1" style={{color: 'var(--accent-primary)'}}>Greek Learning Companion</span>
        </div>
      </Link>
      
      <nav className="hidden md:flex gap-4">
        <Link href="/about" className="px-4 py-2 hover:text-indigo-900 transition-colors" style={{color: 'var(--text-secondary)'}}>About</Link>
        <Link href="/support" className="px-4 py-2 hover:text-indigo-900 transition-colors" style={{color: 'var(--text-secondary)'}}>Support</Link>
        <Link href="/donate" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">Donate</Link>
      </nav>

      {/* Theme toggle button */}
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full transition-all"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(55, 48, 163, 0.9)' : 'rgba(238, 242, 255, 0.9)',
          color: theme === 'dark' ? 'rgb(199, 210, 254)' : 'rgb(67, 56, 202)'
        }}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
    </header>
  );
} 