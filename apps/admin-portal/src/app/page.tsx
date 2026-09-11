'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SystemHeartbeat from './components/SystemHeartbeat';
import SovereignMerchantRegistry from './components/SovereignMerchantRegistry';

import { API_URL as API, ADMIN_HEADERS } from '../lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuditEvent {
  id: string;
  action?: string;
  userId?: string;
  user_id?: string;
  tenantId?: string;
  tenant_id?: string;
  amountCents?: number | null;
  amount_cents?: number | null;
  details?: Record<string, any> | null;
  context?: Record<string, any> | null;
  traceId?: string | null;
  trace_id?: string | null;
  createdAt?: string;
  created_at?: string;
}

interface LiveMetrics {
  activeTenants: number;
  gpvFormatted: string;
  gpvCents: number;
  kybQueue: number;
  securityAlerts: number;
  webhookErrors: number;
  apiUptime: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const elapsed = (iso?: string) => {
  if (!iso) return '—';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

const getAction  = (e: AuditEvent) => e.action ?? 'UNKNOWN';
const getUserId  = (e: AuditEvent) => e.userId  ?? e.user_id   ?? 'system';
const getTId     = (e: AuditEvent) => e.tenantId ?? e.tenant_id ?? '—';
const getTs      = (e: AuditEvent) => e.createdAt ?? e.created_at;

// Classify action → severity
const severity = (action: string): { level: 'critical' | 'warning' | 'info' | 'success'; cls: string; dot: string } => {
  const a = action.toUpperCase();
  if (a.includes('FAILED') || a.includes('BLOCKED') || a.includes('BYPASS') || a.includes('RATE_LIMIT') || a.includes('ERROR') || a.includes('FAIL'))
    return { level: 'critical', cls: 'bg-red-500/10 border-red-500/30 text-red-300', dot: 'bg-red-500 shadow-[0_0_6px_#ef4444]' };
  if (a.includes('WARN') || a.includes('ATTEMPT') || a.includes('PENDING') || a.includes('SUBMITTED'))
    return { level: 'warning',  cls: 'bg-amber-500/8 border-amber-500/25 text-amber-300', dot: 'bg-amber-500 shadow-[0_0_6px_#f59e0b]' };
  if (a.includes('APPROVED') || a.includes('FUNDED') || a.includes('SUCCESS') || a.includes('CAPTURED') || a.includes('VERIFIED') || a.includes('COMPLETE'))
    return { level: 'success',  cls: 'bg-emerald-500/8 border-emerald-500/25 text-emerald-300', dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]' };
  return { level: 'info',     cls: 'bg-white/3 border-white/10 text-zinc-300', dot: 'bg-blue-400' };
};

// ─── Admin request headers imported from constants ────────────────────────────

// ─── Event Feed Row ───────────────────────────────────────────────────────────
function EventRow({ event, tick }: { event: AuditEvent; tick: number }) {
  const sev = severity(getAction(event));
  const amt = event.amountCents ?? event.amount_cents;
  const pqcSig = event.context?.pqcSignature ?? event.details?.pqcSignature;
  
  return (
    <div className={`flex items-start gap-4 px-5 py-4 border rounded-2xl transition-all duration-300 hover:scale-[1.005] hover:bg-white/[0.03] ${sev.cls}`}>
      <div className="mt-2 shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${sev.dot}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-black tracking-widest uppercase">{getAction(event)}</span>
          {amt && amt > 0 && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20">
              USD ${(amt / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-1.5 text-[10px] font-mono text-zinc-500 flex-wrap">
          <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded border border-white/5">
            <span className="text-zinc-700">USER:</span>
            <span className="text-zinc-300">{getUserId(event).slice(0, 12)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-700">TENANT:</span>
            <span className="text-zinc-400">{getTId(event)}</span>
          </div>
          {(event.details?.ip ?? event.context?.ip) && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-700">IP:</span>
              <span className="text-zinc-500">{event.details?.ip ?? event.context?.ip}</span>
            </div>
          )}
        </div>

        {pqcSig && (
          <div className="flex items-center gap-2 mt-2 bg-black/40 border border-white/[0.03] px-2 py-1 rounded-lg w-fit group/sig cursor-help">
            <span className="text-[8px] font-mono text-blue-500/60 uppercase tracking-widest font-bold">PQC-SIGNATURE</span>
            <span className="text-[9px] font-mono text-blue-400/80 select-all tracking-tighter truncate max-w-[280px]">
              {pqcSig}
            </span>
          </div>
        )}
      </div>
      
      <div className="shrink-0 text-[10px] font-mono text-zinc-600 bg-black/20 px-2 py-1 rounded border border-white/5 mt-1">
        {elapsed(getTs(event))}
      </div>
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, color, isLoading, isError,
}: {
  label: string; value: string | number; sub: string;
  color: string; isLoading: boolean; isError: boolean;
}) {
  // Determine glow color based on the text color class
  const glowClass = color.includes('emerald') ? 'bg-emerald-500/10' : 
                    color.includes('red') ? 'bg-red-500/10' : 
                    color.includes('amber') ? 'bg-amber-500/10' : 
                    color.includes('blue') ? 'bg-blue-500/10' : 'bg-white/5';

  return (
    <div className="admin-card-hover p-5 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl -mr-8 -mt-8 transition-opacity duration-500 group-hover:opacity-100 opacity-50 ${glowClass}`} />
      
      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-3">{label}</p>
      
      {isLoading ? (
        <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
      ) : isError ? (
        <p className="text-2xl font-mono text-zinc-700 font-black">SYSTEM_ERR</p>
      ) : (
        <div className="flex items-baseline gap-1">
          <p className={`text-2xl font-black font-mono tracking-tight ${color}`}>{value}</p>
          <div className={`w-1 h-1 rounded-full mb-1 animate-pulse ${glowClass.replace('/10', '/60')}`} />
        </div>
      )}
      
      <p className="text-[10px] text-zinc-600 mt-2 font-medium leading-relaxed">{sub}</p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function GodViewPage() {
  const [events, setEvents]         = useState<AuditEvent[]>([]);
  const [metrics, setMetrics]       = useState<LiveMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError]     = useState(false);
  const [eventsLoading, setEventsLoading]   = useState(true);
  const [eventsError, setEventsError]       = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'critical' | 'warning' | 'success' | 'info'>('ALL');
  const [search, setSearch] = useState('');
  const [tick, setTick]     = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'audit' | 'performance'>('audit');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick every 5s to refresh elapsed times
  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ── Fetch live metrics from /admin/metrics ─────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/metrics`, { headers: ADMIN_HEADERS, credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveMetrics = await res.json();
      setMetrics(data);
      setMetricsError(false);
    } catch {
      setMetricsError(true);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // ── Fetch live audit log events from /admin/log-aggregation/logs ───────────
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/log-aggregation/logs?pageSize=50&sortOrder=desc`, {
        headers: ADMIN_HEADERS,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Service returns { data: [], total, page, pageSize, totalPages }
      const list: AuditEvent[] = Array.isArray(json) ? json : json.data ?? [];
      setEvents(list);
      setEventsError(false);
    } catch {
      setEventsError(true);
    } finally {
      setEventsLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchEvents();
    const metricInterval = setInterval(fetchMetrics, 60000); // metrics every 60s
    const eventInterval  = setInterval(fetchEvents, 20000);  // events every 20s
    return () => { clearInterval(metricInterval); clearInterval(eventInterval); };
  }, [fetchMetrics, fetchEvents]);

  // Filtered events
  const visible = events.filter(e => {
    const action = getAction(e);
    const sev = severity(action);
    const matchFilter = filter === 'ALL' || sev.level === filter;
    const matchSearch = !search || action.toLowerCase().includes(search.toLowerCase()) || getUserId(e).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Security alert count from live events
  const criticalCount = events.filter(e => severity(getAction(e)).level === 'critical').length;
  const warningCount  = events.filter(e => severity(getAction(e)).level === 'warning').length;

  // ── KPI cards from live metrics ────────────────────────────────────────────
  const kpiCards = metrics ? [
    { label: 'Active Tenants',   value: metrics.activeTenants.toString(), sub: 'registered in the platform',   color: 'text-blue-400'    },
    { label: 'MTD GPV',         value: metrics.gpvFormatted,             sub: 'gross payment volume (COMPLETED)', color: 'text-emerald-400' },
    { label: 'KYB Queue',       value: metrics.kybQueue.toString(),       sub: 'pending review',                color: 'text-amber-400'   },
    { label: 'Security Alerts', value: metrics.securityAlerts.toString(), sub: 'from recent audit window',      color: 'text-red-400'     },
    { label: 'API Uptime',      value: metrics.apiUptime ?? 'Live',       sub: 'health status',                 color: 'text-emerald-400' },
    { label: 'Webhook Errors',  value: metrics.webhookErrors.toString(),  sub: 'failed deliveries (recent)',    color: 'text-orange-400'  },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-red-500">God-View Active · Live Data Feed</p>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Security Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time system event feed · Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            id="onboard-new-merchant-btn"
            href="/onboard-merchant"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
          >
            <span className="text-emerald-500">＋</span> Onboard New Merchant
          </a>
          <button
            id="refresh-audit-btn"
            onClick={() => { fetchEvents(); fetchMetrics(); }}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#1e1e22] hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 text-xs font-mono rounded-lg transition-colors"
          >
            ↻ Refresh Feed
          </button>
        </div>
      </div>

      {/* ── Platform Metrics (Live) ─────────────────────────────────────────── */}
      {metricsError ? (
        <div className="flex items-center gap-3 bg-red-950/20 border border-red-800/20 rounded-xl px-5 py-4">
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="text-xs font-mono text-red-400">
            METRICS UNAVAILABLE · API endpoint /admin/metrics did not respond. Verify the API service is running and the database connection is healthy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {metricsLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#111114] border border-[#1e1e22] rounded-xl p-4 space-y-2">
                  <div className="h-2 w-20 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-7 w-14 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-2 w-24 bg-zinc-800 rounded animate-pulse" />
                </div>
              ))
            : kpiCards.map(m => (
                <MetricCard key={m.label} {...m} isLoading={false} isError={false} />
              ))
          }
        </div>
      )}

      {/* ── Security Alert Bar (derived from live events) ────────────────────── */}
      {!eventsLoading && !eventsError && (criticalCount > 0 || warningCount > 0) && (
        <div className="flex items-center gap-4 bg-red-950/30 border border-red-800/30 rounded-xl px-5 py-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div className="flex-1 text-sm">
            <span className="text-red-300 font-semibold">{criticalCount} critical</span>
            <span className="text-zinc-500">, </span>
            <span className="text-amber-400 font-semibold">{warningCount} warning</span>
            <span className="text-zinc-500 ml-2">events detected in this feed. Review immediately.</span>
          </div>
          <a href="/security" className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors border border-red-700/40 px-3 py-1 rounded-md hover:border-red-600/60">
            View All →
          </a>
        </div>
      )}

      {/* ── Sovereign Merchant Registry ──────────────────────────────────────── */}
      <SovereignMerchantRegistry />

      {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-[#1e1e22] mt-6">
        {(['audit', 'performance'] as const).map(tab => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === tab
                ? tab === 'performance'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-red-500 text-red-400'
                : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {tab === 'audit' ? '⬡ Live Audit Feed' : '♡ System Performance'}
          </button>
        ))}
      </div>

      {/* ── System Performance Tab ───────────────────────────────────────────── */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 mb-3">CONNECTIVITY MONITOR · PINGS /health/sovereign EVERY 30s</p>
            <SystemHeartbeat />
          </div>
        </div>
      )}

      {/* ── Live Event Feed ───────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="bg-[#111114] border border-[#1e1e22] rounded-2xl overflow-hidden">
          {/* Feed Header + Filter */}
          <div className="border-b border-white/[0.05] px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${eventsError ? 'bg-red-500' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <h2 className="text-xs font-mono font-black uppercase tracking-[0.25em] text-zinc-300">Live Audit Stream</h2>
              <span className="text-[10px] text-zinc-600 font-mono bg-white/5 px-2 py-0.5 rounded">
                {eventsError ? 'OFFLINE' : `${visible.length} NODES`}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH TRAIL…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-black/40 border border-white/10 focus:border-red-500/50 rounded-lg px-3 py-2 text-[10px] text-zinc-300 placeholder-zinc-700 outline-none transition-all font-mono w-48 tracking-widest focus:ring-1 focus:ring-red-500/20"
                />
              </div>
              
              <div className="h-4 w-px bg-white/10 mx-1" />

              {/* Severity filter */}
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                {(['ALL', 'critical', 'warning', 'success', 'info'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider rounded-md transition-all ${
                      filter === f
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="p-3 space-y-2 max-h-[520px] overflow-y-auto">
            {eventsLoading ? (
              <div className="flex items-center justify-center h-32 text-zinc-600 text-xs font-mono animate-pulse">
                CONNECTING TO AUDIT STREAM…
              </div>
            ) : eventsError ? (
              <div className="flex flex-col items-center justify-center h-32 gap-3">
                <p className="text-red-500 text-xs font-mono">⚠ AUDIT STREAM UNAVAILABLE</p>
                <p className="text-zinc-700 text-[10px] font-mono text-center max-w-xs">
                  Could not reach {API}/admin/log-aggregation/logs<br />
                  Verify API service and database connectivity.
                </p>
                <button
                  onClick={fetchEvents}
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 border border-[#1e1e22] hover:border-zinc-600 px-3 py-1 rounded transition-colors"
                >
                  ↻ Retry Connection
                </button>
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <p className="text-zinc-700 text-xs font-mono">NO AUDIT EVENTS IN DATABASE</p>
                <p className="text-zinc-800 text-[10px] font-mono">The audit_logs table is empty. Events are written as the system processes transactions.</p>
              </div>
            ) : (
              visible.map(event => (
                <EventRow key={event.id + tick} event={event} tick={tick} />
              ))
            )}
          </div>

          {/* Feed Footer */}
          <div className="border-t border-[#1e1e22] px-5 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-700">AUDIT TRAIL · SOC2-TYPE-II COMPLIANT · IMMUTABLE · LIVE DB SOURCE</span>
            <span className="text-[10px] font-mono text-zinc-700">AUTO-REFRESH 20s · METRICS 60s</span>
          </div>
        </div>
      )}
    </div>
  );
}
