import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { inter } from '../components/ui/fonts';
import { AuthProvider } from '@/lib/auth-context';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bookleaf | Personal Book Manager',
  description: 'Track your personal library catalog, reading status, and book tags',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className={`${inter.variable} min-h-full flex flex-col`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
