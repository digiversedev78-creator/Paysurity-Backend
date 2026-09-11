import AuthLayout from '@/components/AuthLayout';

export default function DemoWalletLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  );
}
