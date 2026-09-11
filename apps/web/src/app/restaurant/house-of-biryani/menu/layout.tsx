import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'House of Biryani — Full Menu | PaySurity',
  description: 'Explore the complete House of Biryani menu: Biryani, Grills, Chinese, Catering, Paan & more. Live DB-seeded menu. Add to cart & checkout online.',
  keywords: ['House of Biryani', 'biryani menu', 'halal restaurant Chicago', 'online food ordering', 'PaySurity'],
  openGraph: {
    title: 'House of Biryani — Full Online Menu',
    description: 'Authentic South Asian cuisine — 73 real menu items across 13 categories. Order online with PaySurity.',
    type: 'website',
    siteName: 'House of Biryani · PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function HobMenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
