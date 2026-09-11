import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://paysurity.com'),
  title: {
    default: 'PaySurity — Payment Solutions for Every Business',
    template: '%s | PaySurity',
  },
  description:
    'PaySurity offers integrated payment processing, enterprise POS systems, loyalty programs, payroll, and digital ordering for corporate franchises, hospitality groups, and large-scale retail across the USA.',
  keywords: [
    'PaySurity', 'enterprise POS system', 'payment processing', 'merchant services',
    'retail operations', 'corporate supply', 'merchant account', 'online ordering',
    'loyalty program', 'payroll software', 'cash discount program',
  ],
  authors: [{ name: 'PaySurity', url: 'https://paysurity.com' }],
  creator: 'PaySurity',
  publisher: 'PaySurity',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://paysurity.com',
    siteName: 'PaySurity',
    title: 'PaySurity — The Complete Payment & Business Platform',
    description:
      'POS · Payments · Online Ordering · Payroll · Loyalty — all in one platform for enterprise operators, corporate franchises and large-scale retail. Trusted by 10,000+ US enterprises.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'PaySurity — Payment Solutions for Every Business',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PaySurity — Payment Solutions for Every Business',
    description: 'Integrated POS, payments, payroll and online ordering — all in one platform.',
    site: '@PaySurity',
    creator: '@PaySurity',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: 'https://paysurity.com',
  },
};

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1,
};

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PayBot from '../components/PayBot';
import { CartProvider } from '../context/CartContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <PayBot />
        </CartProvider>
      </body>
    </html>
  );
}
