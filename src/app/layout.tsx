import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { DirectionProvider } from '@/components/layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-ar',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mamsa — SuperAdmin',
  description: 'Mamsa platform administration console',
  icons: {
    icon: '/Mamsa_logo.ico',
    shortcut: '/Mamsa_logo.ico',
    apple: '/Mamsa_logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${plexArabic.variable}`}>
      <body className="font-sans">
        <DirectionProvider>{children}</DirectionProvider>
      </body>
    </html>
  );
}
