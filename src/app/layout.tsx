import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import SEO from '@/components/SEO';
import CookieConsent from '@/pages/CookieConsent';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'SJHRC: SHREE JAGANNATH HOSPITAL & RESEARCH CENTRE',
    template: '%s | SJHRC - Leading Healthcare in Ranchi',
  },
  description:
    'SJHRC offers world-class healthcare services, cutting-edge medical research, and compassionate patient care in Ranchi. Experience excellence in cardiology, neurology, oncology, and more.',
  keywords: [
    'hospital',
    'healthcare',
    'medical research',
    'SJHRC',
    'Ranchi',
    'cardiology',
    'neurology',
    'oncology',
  ],
  authors: [{ name: 'SJHRC Team', url: 'https://sjhrc.in' }],
  creator: 'SJHRC',
  publisher: 'SJHRC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Healthcare',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <SEO />
      </head>
      <body>
        <CookieConsent />
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
