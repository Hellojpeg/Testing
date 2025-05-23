
// Removed 'use client'; directive

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
// Removed useState, useEffect from 'react'
// Toaster itself is not directly imported, ClientToaster will handle it
import { Header } from '@/components/layout/header';
import { ClientToaster } from '@/components/client-toaster'; // Import the new component

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = { // This is now valid
  title: 'Hangout Helper',
  description: 'Get smart suggestions for your next hangout!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Removed isClient state and useEffect for Toaster

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Header /> {/* Header is a Client Component, which is fine */}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <ClientToaster /> {/* Use the client-side wrapper for Toaster */}
      </body>
    </html>
  );
}
