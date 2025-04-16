import type { Metadata } from 'next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { IndexedDBProvider } from '@/components/IndexedDBProvider';
import './globals.css';
import PWAComponent from './PWAComponent';

export const metadata: Metadata = {
  title: 'Greek-English Learning App',
  description: 'Learn Greek with videos and translations',
  manifest: '/manifest.json',
  themeColor: '#3F51B5',
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Greek-English App',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <IndexedDBProvider>
            <PWAComponent />
            {children}
          </IndexedDBProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 