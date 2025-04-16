import type { Metadata } from 'next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { IndexedDBProvider } from '@/components/IndexedDBProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Greek-English Learning App',
  description: 'Learn Greek with videos and translations',
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
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          <IndexedDBProvider>
            {children}
          </IndexedDBProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 