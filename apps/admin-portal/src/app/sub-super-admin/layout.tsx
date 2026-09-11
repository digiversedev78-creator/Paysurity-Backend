import type { Metadata } from 'next';
import QueryProvider from './QueryProvider';

export const metadata: Metadata = {
  title: 'Sub-Super Admin | PaySurity Operator Console',
  description:
    'Location-scoped operator dashboard for sub-super administrators. Internal use only — SOC2-compliant.',
};

/**
 * Sub-Super Admin Layout
 *
 * Injects the React Query provider into this route segment.
 * The root RootLayout (../layout.tsx) handles the sidebar and shell —
 * this layout only wraps children in the QueryProvider so that
 * all pages and components in /sub-super-admin can use useQuery.
 */
export default function SubSuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
