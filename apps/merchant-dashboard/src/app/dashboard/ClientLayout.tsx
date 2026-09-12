'use client';
import Sidebar from '../../components/layout/Sidebar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#050508',
        color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', fontFamily: 'system-ui, sans-serif',
      }}>
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050508]">
      <Sidebar />
      <main className="flex-1 transition-all duration-200 ease-in-out md:ml-64 p-4 md:p-8 pb-12 min-w-0">
        {children}
      </main>
    </div>
  );
}
