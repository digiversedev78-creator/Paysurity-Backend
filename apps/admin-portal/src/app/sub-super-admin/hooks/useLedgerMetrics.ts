/**
 * useLedgerMetrics.ts — React Query hook
 *
 * Fetches live ledger telemetry from:
 *   GET /api/admin/v1/ledger/metrics
 *
 * Requires x-location-id header for location-scoped isolation.
 * Passed through the Edge locationGuard before reaching this hook's fetch.
 *
 * Cache behaviour (approved spec §4):
 *   staleTime:       30 000 ms (inherited from QueryClient defaults)
 *   refetchInterval: 60 000 ms (inherited from QueryClient defaults)
 */

import { useQuery } from '@tanstack/react-query';
import { API_URL, ADMIN_HEADERS } from '../../../lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LedgerMetrics {
  /** Total funds currently held in escrow (cents) */
  escrowBalanceCents:       number;
  /** Total ledger credit volume in the current calendar month (cents) */
  mtdCreditCents:           number;
  /** Total ledger debit volume in the current calendar month (cents) */
  mtdDebitCents:            number;
  /** Count of open wallet_ledger entries with status = PENDING */
  pendingTransactionCount:  number;
  /** Sum of affiliate commissions processed today (cents) */
  todayCommissionCents:     number;
  /** Net position: mtdCredit − mtdDebit (cents) */
  netPositionCents:         number;
  /** ISO timestamp of the last ledger write */
  lastLedgerEntryAt:        string | null;
  /** Location UUID this snapshot is scoped to */
  locationId:               string;
}

const LEDGER_METRICS_ENDPOINT = `${API_URL}/admin/v1/ledger/metrics`;

/**
 * useLedgerMetrics
 *
 * @param locationId  Validated UUID v4 from the Edge guard cookie/header.
 *                    Pass undefined to skip the query (enabled: false).
 */
export function useLedgerMetrics(locationId: string | undefined) {
  return useQuery<LedgerMetrics, Error>({
    queryKey:  ['ledger-metrics', locationId],
    enabled:   !!locationId,
    queryFn:   async (): Promise<LedgerMetrics> => {
      const res = await fetch(LEDGER_METRICS_ENDPOINT, {
        method:  'GET',
        headers: {
          ...ADMIN_HEADERS,
          'x-location-id': locationId!,
          'Content-Type':  'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message ?? `Ledger metrics API returned ${res.status}`,
        );
      }

      return res.json() as Promise<LedgerMetrics>;
    },
  });
}
