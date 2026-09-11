import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ashiana Collections — Fashion Boutique | PaySurity RetailPro',
  description: 'Shop Ashiana Collections — bridal wear, day wear and accessories. Live catalog with size & colour selection, fabric filters, and secure checkout. Powered by PaySurity RetailPro.',
  keywords: ['Ashiana Collections', 'bridal wear', 'Pakistani fashion', 'South Asian boutique', 'RetailPro', 'PaySurity'],
  openGraph: {
    title: 'Ashiana Collections — Bridal · Day Wear · Accessories',
    description: '50 curated styles, 543 size×colour variants. Live DB catalog — shop online with PaySurity.',
    type: 'website',
    siteName: 'Ashiana Collections · PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function AshianaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
