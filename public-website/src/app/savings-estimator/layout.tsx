import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Savings Estimator — Calculate Your Savings | PaySurity',
  description: 'Use the PaySurity Savings Estimator to calculate how much you could save by switching from your current payment processor. Most merchants save 2–3% per transaction.',
  keywords: ['payment processing savings', 'credit card fee calculator', 'cash discount savings', 'PaySurity savings estimator'],
  openGraph: {
    title: 'Calculate Your Processing Savings — PaySurity',
    description: 'Enter your monthly volume and current processing fee. See exactly how much PaySurity saves you every month.',
    type: 'website',
    siteName: 'PaySurity',
  },
  robots: { index: true, follow: true },
};

export default function SavingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
