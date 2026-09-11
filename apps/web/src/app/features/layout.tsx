import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features — POS, Payments, Payroll & Loyalty | PaySurity',
  description: "Explore PaySurity's full feature set: Smart POS, 0% markup processing, branded online ordering, automated payroll, loyalty engine, and real-time analytics — all in one platform.",
  keywords: ['PaySurity features', 'POS system', 'payment processing', 'restaurant software', 'retail POS', 'payroll software', 'loyalty program'],
  openGraph: {
    title: 'PaySurity Features — The Complete Business Platform',
    description: 'POS · Payments · Online Ordering · Payroll · Loyalty — built for restaurants, retail and grocery.',
    type: 'website',
    siteName: 'PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
