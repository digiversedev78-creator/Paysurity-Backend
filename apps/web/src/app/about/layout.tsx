import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About PaySurity — Our Mission & Team | PaySurity',
  description: 'Learn about PaySurity — founded in Chicago in 2024, we are building enterprise-grade payment solutions for 10,000+ US merchants across restaurants, retail and grocery.',
  keywords: ['about PaySurity', 'PaySurity company', 'fintech Chicago', 'payment platform team'],
  openGraph: {
    title: 'About PaySurity — Revolutionizing Payments',
    description: 'Founded 2024 in Chicago. Trusted by 10,000+ merchants. Enterprise payments, made simple and accessible.',
    type: 'website',
    siteName: 'PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
