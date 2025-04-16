'use client';

import { useEffect } from 'react';

export default function PWAComponent() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(function(error) {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
} 