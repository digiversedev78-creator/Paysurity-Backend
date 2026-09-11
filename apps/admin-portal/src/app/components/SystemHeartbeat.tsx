'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type SubStatus = 'OK' | 'STUB' | 'DEGRADED' | 'OFFLINE' | 'CHECKING';

interface SubSystem {
  status: SubStatus;
  label: string;
  detail: string;
  latency_ms?: number;
  queries_passed?: number;
  queries_total?: number;
  count?: number;
  algorithm?: string;
  fips?: string;
  audit_commit?: string;
}

interface SovereignPayload {
  status: string;
  timestamp: string;
  uptime_s: number;
  subsystems: Record<string, SubSystem>;
  meta: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Cloud-first: health routes are excluded from the /api global prefix.
// So /health/sovereign is reachable directly at the base URL.
import { API_BASE } from '../../lib/constants';
const SOVEREIGN_URL = `${API_BASE.replace(/\/api$/, '')}/health/sovereign`;
const POLL_INTERVAL_MS = 30_000; // 30s

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SubStatus }) {
  const map: Record<SubStatus, { bg: string; text: string; dot: string; label: string }> = {
    OK:       { bg: 'rgba(16,185,129,0.12)', text: '#34d399', dot: '#10b981', label: 'OK'       },
    STUB:     { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', dot: '#f59e0b', label: 'STUB'     },
    DEGRADED: { bg: 'rgba(239,68,68,0.10)',  text: '#f87171', dot: '#ef4444', label: 'DEGRADED' },
    OFFLINE:  { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', dot: '#dc2626', label: 'OFFLINE'  },
    CHECKING: { bg: 'rgba(99,102,241,0.12)', text: '#a5b4fc', dot: '#6366f1', label: '…'        },
  };
  const s = map[status] ?? map.CHECKING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.text,
      fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 100,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: s.dot,
        boxShadow: status === 'OK' ? `0 0 6px ${s.dot}` : undefined,
        animation: status === 'CHECKING' ? 'pulse 1s infinite' : undefined,
      }} />
      {s.label}
    </span>
  );
}

// ─── Subsystem Row ────────────────────────────────────────────────────────────
function SubRow({ name, sub }: { name: string; sub: SubSystem }) {
  const icons: Record<string, string> = {
    api: '⚡', pqc: '🔐', rls: '🛡', sentry: '🔔', tenants: '🏢', database: '🗄',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 16, width: 22, flexShrink: 0, marginTop: 1 }}>{icons[name] ?? '●'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{sub.label}</span>
          <StatusBadge status={sub.status} />
          {sub.latency_ms !== undefined && (
            <span style={{ fontSize: 11, color: '#4b5563', fontFamily: 'monospace' }}>{sub.latency_ms}ms</span>
          )}
          {sub.queries_passed !== undefined && (
            <span style={{ fontSize: 11, color: '#059669', fontFamily: 'monospace' }}>
              {sub.queries_passed}/{sub.queries_total} tests
            </span>
          )}
          {sub.count !== undefined && (
            <span style={{ fontSize: 11, color: '#6366f1', fontFamily: 'monospace' }}>{sub.count} active</span>
          )}
        </div>
        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#4b5563', lineHeight: 1.5 }}>{sub.detail}</p>
        {sub.algorithm && (
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a855f7', fontFamily: 'monospace' }}>
            {sub.algorithm} · FIPS {sub.fips}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemHeartbeat() {
  const [payload, setPayload]         = useState<SovereignPayload | null>(null);
  const [pingMs, setPingMs]           = useState<number | null>(null);
  const [lastPingAt, setLastPingAt]   = useState<Date | null>(null);
  const [overallStatus, setOverall]   = useState<'CHECKING' | 'SOVEREIGN_OK' | 'DEGRADED' | 'OFFLINE'>('CHECKING');
  const [nextPingIn, setNextPingIn]   = useState(POLL_INTERVAL_MS / 1000);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = useCallback(async () => {
    setOverall('CHECKING');
    const t0 = performance.now();
    try {
      const res = await fetch(SOVEREIGN_URL, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      const ms = Math.round(performance.now() - t0);
      setPingMs(ms);
      setLastPingAt(new Date());

      if (!res.ok) {
        setOverall('DEGRADED');
        return;
      }
      const data: SovereignPayload = await res.json();
      setPayload(data);
      setOverall(data.status === 'SOVEREIGN_OK' ? 'SOVEREIGN_OK' : 'DEGRADED');
    } catch {
      setPingMs(null);
      setLastPingAt(new Date());
      setOverall('OFFLINE');
      // Populate a degraded offline placeholder so UI doesn't go blank
      setPayload({
        status: 'OFFLINE',
        timestamp: new Date().toISOString(),
        uptime_s: 0,
        subsystems: {
          api:      { status: 'OFFLINE', label: 'NestJS API',        detail: 'Connection refused — is the API running?' },
          pqc:      { status: 'OFFLINE', label: 'ML-DSA FIPS 204',   detail: 'Cannot reach PQC layer'                  },
          rls:      { status: 'OFFLINE', label: 'Tenant RLS Layer',   detail: 'Cannot reach RLS layer'                  },
          sentry:   { status: 'OFFLINE', label: 'Inventory Sentry',   detail: 'Cannot reach Sentry service'             },
          tenants:  { status: 'OFFLINE', label: 'Active Tenants',     detail: 'Cannot reach tenant registry', count: 0  },
          database: { status: 'OFFLINE', label: 'PostgreSQL 15',      detail: 'Cannot reach database'                   },
        },
        meta: { platform: 'PaySurity ERP', classification: 'UNREACHABLE' },
      });
    }
    // Reset countdown
    setNextPingIn(POLL_INTERVAL_MS / 1000);
  }, []);

  // Initial ping + polling
  useEffect(() => {
    ping();
    const pollTimer = setInterval(ping, POLL_INTERVAL_MS);
    return () => clearInterval(pollTimer);
  }, [ping]);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setNextPingIn(n => Math.max(0, n - 1));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // Global status → color
  const masterColor = {
    CHECKING:     '#6366f1',
    SOVEREIGN_OK: '#10b981',
    DEGRADED:     '#f59e0b',
    OFFLINE:      '#ef4444',
  }[overallStatus];

  const uptime = payload?.uptime_s ?? 0;
  const uptimeStr = uptime > 3600
    ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
    : `${Math.floor(uptime / 60)}m ${uptime % 60}s`;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0d0d10, #111116)',
      border: `1px solid ${overallStatus === 'SOVEREIGN_OK' ? 'rgba(16,185,129,0.18)' : overallStatus === 'OFFLINE' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.18)'}`,
      borderRadius: 18, padding: 24, fontFamily: 'Inter, sans-serif',
      boxShadow: `0 0 40px ${masterColor}18`,
      transition: 'border-color 0.4s, box-shadow 0.4s',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pulsing orb */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: masterColor,
            boxShadow: `0 0 ${overallStatus === 'SOVEREIGN_OK' ? '10px' : '6px'} ${masterColor}`,
            animation: overallStatus === 'CHECKING' ? 'pulse 1s infinite' : overallStatus === 'SOVEREIGN_OK' ? 'hbeat 2s ease-in-out infinite' : undefined,
          }} />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
            System Heartbeat
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em',
            padding: '2px 8px', borderRadius: 100,
            background: `${masterColor}18`, color: masterColor,
          }}>
            {overallStatus === 'CHECKING' ? '…' : overallStatus.replace('_', ' ')}
          </span>
        </div>
        <button
          id="heartbeat-manual-ping"
          onClick={ping}
          style={{
            fontSize: 11, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.06em',
            padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#6b7280',
          }}
        >
          ↻ Ping
        </button>
      </div>

      {/* ── Overview Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'API Latency',  value: pingMs !== null ? `${pingMs}ms` : '—',        color: pingMs !== null && pingMs < 100 ? '#10b981' : '#f59e0b' },
          { label: 'Uptime',       value: payload ? uptimeStr : '—',                    color: '#6366f1' },
          { label: 'Next Ping',    value: `${nextPingIn}s`,                             color: '#4b5563' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.025)', borderRadius: 10, padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Last ping time ── */}
      {lastPingAt && (
        <p style={{ margin: '0 0 14px', fontSize: 11, color: '#374151', fontFamily: 'monospace' }}>
          Last ping: {lastPingAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          {payload?.timestamp && (
            <span style={{ marginLeft: 8, color: '#1f2937' }}>
              · Server time: {new Date(payload.timestamp).toLocaleTimeString()}
            </span>
          )}
        </p>
      )}

      {/* ── Subsystem Matrix ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase' }}>
          Sub-system Matrix
        </p>
        {payload
          ? Object.entries(payload.subsystems).map(([name, sub]) => (
              <SubRow key={name} name={name} sub={sub} />
            ))
          : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#374151', fontSize: 12, fontFamily: 'monospace', animation: 'pulse 1s infinite' }}>
              PINGING SOVEREIGN ENDPOINT…
            </div>
          )
        }
      </div>

      {/* ── Meta footer ── */}
      {payload?.meta && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Object.entries(payload.meta).map(([k, v]) => (
            <span key={k} style={{ fontSize: 10, fontFamily: 'monospace', color: '#1f2937' }}>
              <span style={{ color: '#374151' }}>{k}:</span> {v}
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes hbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }
      `}</style>
    </div>
  );
}
