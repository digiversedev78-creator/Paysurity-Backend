import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grand Tobacco Hub — Premium Cigars & Smoke Shop | PaySurity',
  description: 'Shop Grand Tobacco Hub — premium cigars, vapes, cigarettes and accessories. Age-verified ZKP checkout. Must be 21+. Powered by PaySurity RetailPro.',
  keywords: ['Grand Tobacco Hub', 'premium cigars', 'smoke shop online', 'age verified tobacco', 'PaySurity RetailPro'],
  openGraph: {
    title: 'Grand Tobacco Hub — Premium Tobacco & Smoke Shop',
    description: '50 live-seeded tobacco products. ZKP age-gate enforced at checkout. Must be 21+.',
    type: 'website',
    siteName: 'Grand Tobacco Hub · PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function TobaccoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
