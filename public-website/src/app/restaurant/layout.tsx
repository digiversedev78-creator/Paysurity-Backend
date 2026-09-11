import type { Metadata } from 'next';

// Tenant storefront route segment layout.
// This REPLACES the root layout's Navbar + Footer + PayBot for all /restaurant/* pages.
// Tenant microsites are STANDALONE branded experiences.
// The only connection back to PaySurity is the "Powered by PaySurity" link
// embedded inside TenantStorefrontLayout's footer.
export const metadata: Metadata = {
  title: { default: 'Restaurant Ordering — PaySurity', template: '%s | PaySurity' },
  description: 'Order online from your favourite PaySurity-powered restaurant. Fresh menus, easy checkout, halal options.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'PaySurity',
    locale: 'en_US',
  },
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
