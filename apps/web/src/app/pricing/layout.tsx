import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Simple & Transparent Plans | PaySurity',
  description: 'PaySurity pricing: free Starter plan, Growth at $49/month, and Enterprise (custom). 0% processing markup available. No hidden fees. Cancel anytime.',
  keywords: ['PaySurity pricing', 'POS pricing', 'payment processing cost', 'merchant account fees', '0% markup'],
  openGraph: {
    title: 'PaySurity Pricing — No Hidden Fees',
    description: 'Starter free · Growth $49/mo · Enterprise custom. 0% markup payment processing for most merchants.',
    type: 'website',
    siteName: 'PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
