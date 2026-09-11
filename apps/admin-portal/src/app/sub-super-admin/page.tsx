'use client';

/**
 * /sub-super-admin/page.tsx — Sub-Super Admin Operator Console
 *
 * Approved spec:
 *   - Reads x-location-id from session cookie payload
 *   - Tier 1 UUID v4 guard via locationGuard.ts (called client-side pre-render)
 *   - Corporate headers: #0A74DA
 *   - Ledger data assets: #00C9A7
 *   - React Query: staleTime 30s, refetchInterval 60s
 *   - Endpoint: /api/admin/v1/ledger/metrics
 */

import { useEffect, useState } from 'react';
import { locationGuard } from './locationGuard';
import LedgerMetricsTable from './LedgerMetricsTable';

// ─── Location resolver ────────────────────────────────────────────────────────
/**
 * Extracts the location ID from the x-location-id cookie set by the
 * session cookie middleware. This mirrors what the Edge locationGuard
 * does on the server side before forwarding the request.
 */
function resolveLocationId(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = Object.fromEntries(
    document.cookie.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k.trim(), decodeURIComponent(v.join('='))];
    }),
  );

  return (
    cookies['x-location-id'] ??
    cookies['locationId'] ??
    // Dev fallback: read from sessionStorage if set by auth layer
    sessionStorage.getItem('x-location-id') ??
    null
  );
}

// UUID v4 regex — same pattern used in the Edge guard
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubSuperAdminPage() {
  const [locationId, setLocationId]   = useState<string | null>(null);
  const [guardError, setGuardError]   = useState<string | null>(null);
  const [ready, setReady]             = useState(false);

  useEffect(() => {
    const raw = resolveLocationId();

    if (!raw) {
      setGuardError('Missing x-location-id. Session cookie not present or expired.');
      setReady(true);
      return;
    }

    if (!UUID_V4.test(raw.trim())) {
      setGuardError(
        `Invalid location context: '${raw}' does not conform to UUID v4 format.`,
      );
      setReady(true);
      return;
    }

    setLocationId(raw.trim());
    setReady(true);
  }, []);

  // ── Render helpers ─────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-zinc-600 font-mono text-xs animate-pulse">
          <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
          AUTHENTICATING OPERATOR CONTEXT…
        </div>
      </div>
    );
  }

  if (guardError) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex items-start gap-4 bg-red-950/30 border border-red-700/30 rounded-2xl px-6 py-5">
          <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-700/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-red-400">403 — LOCATION CONTEXT REJECTED</p>
            <p className="text-xs font-mono text-red-600 mt-1">{guardError}</p>
            <p className="text-[10px] font-mono text-zinc-700 mt-2">
              The x-location-id header must be a valid UUID v4 set by the session middleware.
              Contact your system administrator if this persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {/* Corporate blue accent — #0A74DA */}
            <div
              className="flex items-center gap-2 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border"
              style={{
                color:       '#0A74DA',
                borderColor: '#0A74DA30',
                background:  '#0A74DA12',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#0A74DA' }}
              />
              SUB-SUPER ADMIN CONSOLE · LIVE
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Operator Ledger Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Location-scoped financial telemetry · Real-time ledger snapshot
          </p>
        </div>

        {/* Location badge */}
        <div
          className="flex items-center gap-2 text-[10px] font-mono px-3 py-2 rounded-xl border shrink-0"
          style={{
            color:       '#00C9A7',
            borderColor: '#00C9A720',
            background:  '#00C9A710',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-zinc-600">LOC:</span>
          <span className="font-bold">{locationId?.slice(0, 8).toUpperCase()}…</span>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Auth Layer',    value: 'UUID v4 GUARD', icon: '🔒', color: '#0A74DA' },
          { label: 'Cache Policy', value: 'SWR 30s / POLL 60s', icon: '⚡', color: '#00C9A7' },
          { label: 'Endpoint',     value: 'v1/ledger/metrics', icon: '🌐', color: '#0A74DA' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 border border-white/[0.05] bg-[#0d0d12] flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
            >
              {kpi.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">{kpi.label}</p>
              <p className="text-xs font-mono font-bold text-zinc-200 mt-0.5 truncate">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Live Ledger Metrics Table ─────────────────────────────────────────── */}
      <LedgerMetricsTable locationId={locationId!} />

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <p className="text-[9px] font-mono text-zinc-800 text-center uppercase tracking-widest">
        Data is location-scoped via x-location-id · Tier 2 DB validation enforced by LocationService ·
        All mutations require USD currency guard
      </p>
    </div>
  );
}
