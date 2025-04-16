'use client';

import React from 'react';
import Header from '@/components/Header';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <Header />
      
      <div className="card p-8 mb-8 border-l-4 border-indigo-500 bg-indigo-900/20 rounded-lg">
        <h1 className="text-3xl font-bold text-indigo-300 mb-6">About Hellenistic</h1>
        
        <div className="space-y-6 text-gray-200">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-indigo-200 mb-3">Our Mission</h2>
            <p>
              Hellenistic is designed to make learning Greek more accessible and enjoyable. 
              Our goal is to provide a comprehensive learning platform that combines video 
              content, interactive tools, and spaced repetition to help you master the Greek 
              language at your own pace.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-indigo-200 mb-3">Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Watch videos with Greek subtitles and translations</li>
              <li>Interactive vocabulary building with one-click translations</li>
              <li>Spaced repetition study system for efficient learning</li>
              <li>Personalized vocabulary tracking and progress monitoring</li>
              <li>Support for both YouTube and local video content</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-indigo-200 mb-3">How It Works</h2>
            <p className="mb-4">
              Hellenistic uses a three-pronged approach to language learning:
            </p>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <strong className="text-indigo-200">Immersive Learning:</strong> 
                <p>Watch videos with Greek subtitles, clicking on words or phrases you don't understand for instant translations.</p>
              </li>
              <li>
                <strong className="text-indigo-200">Vocabulary Building:</strong> 
                <p>Save translations to your personal vocabulary list for future reference and study.</p>
              </li>
              <li>
                <strong className="text-indigo-200">Spaced Repetition:</strong> 
                <p>Review your vocabulary using our built-in spaced repetition system that optimizes the learning process based on recall difficulty.</p>
              </li>
            </ol>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-indigo-200 mb-3">Get in Touch</h2>
            <p>
              We're constantly improving Hellenistic and would love to hear your feedback.
              Visit our <a href="/support" className="text-indigo-400 hover:text-indigo-300 underline">Support page</a> to 
              share your thoughts or request new features.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 