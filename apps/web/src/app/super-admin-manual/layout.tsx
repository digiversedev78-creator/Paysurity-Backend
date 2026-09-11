import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Onboarding Manual — PaySurity',
  description: 'Complete technical walkthrough for provisioning, seeding and activating a new PaySurity tenant environment.',
};

export default function ManualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
