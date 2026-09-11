'use client';

/**
 * QueryProvider.tsx — React Query client provider
 *
 * Wraps the sub-super-admin subtree so all ledger metric hooks
 * can use useQuery without bootstrapping their own client.
 *
 * Configuration (per approved spec):
 *   staleTime:      30 000 ms  (30 s)
 *   refetchInterval: 60 000 ms  (60 s)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:       30_000, // data considered fresh for 30s
            refetchInterval: 60_000, // background poll every 60s
            retry:           2,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
