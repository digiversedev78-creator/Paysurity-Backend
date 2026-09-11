import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features — POS, Payments, Payroll & Loyalty | PaySurity',
  description: "Explore PaySurity's full feature set: Smart POS, 0% markup processing, branded online ordering, automated payroll, loyalty engine, and real-time analytics — all in one platform.",
  keywords: ['PaySurity features', 'enterprise POS', 'payment processing', 'merchant services software', 'retail operations', 'payroll software', 'loyalty program'],
  openGraph: {
    title: 'PaySurity Features — The Complete Business Platform',
    description: 'POS · Payments · Online Ordering · Payroll · Loyalty — built for enterprise operators, corporate franchises and large-scale retail.',
    type: 'website',
    siteName: 'PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
