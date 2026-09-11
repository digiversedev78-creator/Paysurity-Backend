import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merchant Application — Start Free Trial | PaySurity',
  description: 'Apply for your free PaySurity merchant account. Business info, bank verification and underwriting wizard — takes under 5 minutes. No credit card required.',
  keywords: ['PaySurity merchant application', 'POS signup', 'restaurant payment system', 'merchant account', 'free trial'],
  openGraph: {
    title: 'Apply for Your Free PaySurity Merchant Account',
    description: 'Integrated POS, payments, payroll and online ordering — get started free in minutes.',
    type: 'website',
    siteName: 'PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
