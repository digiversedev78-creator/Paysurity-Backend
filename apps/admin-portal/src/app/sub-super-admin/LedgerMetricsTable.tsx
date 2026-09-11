'use client';

/**
 * LedgerMetricsTable.tsx — Sub-Super Admin Ledger Data Table
 *
 * Pulls live data via useLedgerMetrics (React Query) and renders
 * a structured, color-coded ledger table with the approved theme:
 *   Corporate headers  → #0A74DA (royal blue)
 *   Ledger data assets → #00C9A7 (teal/emerald)
 *
 * Approved spec references:
 *   - Admin UI Theme §1: tailwind.config.js extended palette
 *   - Live Wallet Telemetry §2: SWR / React Query
 *   - API Endpoint §3: /api/admin/v1/ledger/metrics
 */

import { useLedgerMetrics, LedgerMetrics } from './hooks/useLedgerMetrics';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatUSD = (cents: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

const formatCount = (n: number): string => n.toLocaleString();

const timeAgo = (iso: string | null): string => {
  if (!iso) return '—';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)   return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function MetricRow({
  label,
  value,
  isMonetary,
  variant = 'default',
}: {
  label:       string;
  value:       string | number;
  isMonetary?: boolean;
  variant?:    'default' | 'positive' | 'negative' | 'neutral' | 'warning';
}) {
  const variantStyles: Record<typeof variant, string> = {
    default:  'text-[#00C9A7]',
    positive: 'text-[#00C9A7]',
    negative: 'text-red-400',
    neutral:  'text-zinc-300',
    warning:  'text-amber-400',
  };

  const displayValue = isMonetary && typeof value === 'number'
    ? formatUSD(value)
    : typeof value === 'number'
    ? formatCount(value)
    : value;

  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4 text-[11px] font-mono text-zinc-500 uppercase tracking-[0.15em] w-64 group-hover:text-zinc-400 transition-colors">
        {label}
      </td>
      <td className={`px-6 py-4 text-sm font-mono font-bold tabular-nums ${variantStyles[variant]}`}>
        {displayValue}
      </td>
      <td className="px-6 py-4 text-[10px] font-mono text-zinc-700">
        {isMonetary ? 'USD' : '—'}
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="px-6 py-4">
        <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-8 bg-white/5 rounded animate-pulse" />
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface LedgerMetricsTableProps {
  locationId: string;
}

export default function LedgerMetricsTable({ locationId }: LedgerMetricsTableProps) {
  const { data, isLoading, isError, error, dataUpdatedAt, isFetching } =
    useLedgerMetrics(locationId);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
        hour:   'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0d0d12]">
      {/* ── Table Header ──────────────────────────────────────────────────── */}
      <div
        className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06]"
        style={{ background: 'linear-gradient(135deg, #0A74DA18 0%, #0d0d12 60%)' }}
      >
        <div className="flex items-center gap-3">
          {/* Corporate header accent — #0A74DA */}
          <div
            className="w-1 h-8 rounded-full"
            style={{ background: 'linear-gradient(180deg, #0A74DA, #0A74DA88)' }}
          />
          <div>
            <h2
              className="text-sm font-bold tracking-tight"
              style={{ color: '#0A74DA' }}
            >
              Live Ledger Snapshot
            </h2>
            <p className="text-[10px] font-mono text-zinc-600 mt-0.5 uppercase tracking-widest">
              Endpoint: /api/admin/v1/ledger/metrics · Location-Scoped
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live / fetching indicator */}
          {isFetching && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              REFRESHING
            </div>
          )}
          {lastUpdated && !isFetching && (
            <span className="text-[10px] font-mono text-zinc-600">
              Updated {lastUpdated}
            </span>
          )}
          <div
            className="text-[9px] font-mono font-bold px-2 py-1 rounded border"
            style={{ color: '#00C9A7', borderColor: '#00C9A720', background: '#00C9A710' }}
          >
            {locationId.slice(0, 8).toUpperCase()}…
          </div>
        </div>
      </div>

      {/* ── Error State ────────────────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-start gap-4 px-6 py-5 bg-red-950/20 border-b border-red-800/20">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1 animate-pulse" />
          <div>
            <p className="text-xs font-mono text-red-400 font-bold">LEDGER TELEMETRY UNAVAILABLE</p>
            <p className="text-[10px] font-mono text-red-600 mt-1">
              {error?.message ?? 'Could not reach /api/admin/v1/ledger/metrics'}
            </p>
            <p className="text-[10px] font-mono text-zinc-700 mt-2">
              Verify the NestJS API service is running and the location_id FK constraints are applied.
            </p>
          </div>
        </div>
      )}

      {/* ── Data Table ──────────────────────────────────────────────────────── */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.04]">
            <th
              className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: '#0A74DA' }}
            >
              Metric
            </th>
            <th
              className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: '#0A74DA' }}
            >
              Value
            </th>
            <th
              className="px-6 py-3 text-left text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: '#0A74DA' }}
            >
              Unit
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading || !data ? (
            <>
              {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}
            </>
          ) : (
            <>
              <MetricRow
                label="Escrow Balance"
                value={data.escrowBalanceCents}
                isMonetary
                variant="positive"
              />
              <MetricRow
                label="MTD Credit Volume"
                value={data.mtdCreditCents}
                isMonetary
                variant="positive"
              />
              <MetricRow
                label="MTD Debit Volume"
                value={data.mtdDebitCents}
                isMonetary
                variant="negative"
              />
              <MetricRow
                label="Net Position (MTD)"
                value={data.netPositionCents}
                isMonetary
                variant={data.netPositionCents >= 0 ? 'positive' : 'negative'}
              />
              <MetricRow
                label="Pending Transactions"
                value={data.pendingTransactionCount}
                variant={data.pendingTransactionCount > 50 ? 'warning' : 'neutral'}
              />
              <MetricRow
                label="Today's Affiliate Commissions"
                value={data.todayCommissionCents}
                isMonetary
                variant="default"
              />
              <MetricRow
                label="Last Ledger Entry"
                value={timeAgo(data.lastLedgerEntryAt)}
                variant="neutral"
              />
            </>
          )}
        </tbody>
      </table>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 border-t border-white/[0.04] flex items-center justify-between bg-black/20">
        <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">
          REACT-QUERY · STALE: 30s · POLL: 60s · SCOPE: LOCATION-ISOLATED
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-[9px] font-mono" style={{ color: '#00C9A7' }}>
            LEDGER-V2
          </span>
        </div>
      </div>
    </div>
  );
}
