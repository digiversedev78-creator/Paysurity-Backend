import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Merchant Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
