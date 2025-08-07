// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuthProvider from '@/components/AuthProvider'; // <-- Import AuthProvider
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NEXID Dashboard',
  description: 'Modern Financial Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <GoogleAnalytics />
      <body className={`${inter.variable} font-sans`}>
        {/* We are wrapping the entire app structure with the AuthProvider */}
        <AuthProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-grow p-4 sm:p-6 md:p-8">
                  {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}