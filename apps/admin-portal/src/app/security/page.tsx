'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_URL as API, ADMIN_HEADERS } from '../../lib/constants';

interface SecurityEvent {
  id: string;
  action?: string;
  type?: string;
  severity?: string;
  userId?: string;
  tenantId?: string;
  details?: any;
  context?: any;
  createdAt?: string;
  created_at?: string;
}

const severityLevel = (action: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' => {
  const a = action.toUpperCase();
  if (a.includes('FAILED') || a.includes('BLOCKED') || a.includes('BYPASS') || a.includes('RATE_LIMIT')) return 'CRITICAL';
  if (a.includes('ERROR') || a.includes('FAIL')) return 'HIGH';
  if (a.includes('WARN') || a.includes('ATTEMPT')) return 'MEDIUM';
  return 'LOW';
};

const SEV: Record<string, { cls: string; dot: string; badge: string }> = {
  CRITICAL: { cls: 'border-red-500/20 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.05)]', dot: 'bg-red-500 shadow-[0_0_10px_#ef4444]',   badge: 'bg-red-500 text-white' },
  HIGH:     { cls: 'border-orange-500/20 bg-orange-950/10', dot: 'bg-orange-500 shadow-[0_0_8px_#f97316]', badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  MEDIUM:   { cls: 'border-amber-500/20 bg-amber-950/10',   dot: 'bg-amber-500 shadow-[0_0_6px_#f59e0b]',  badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  LOW:      { cls: 'border-white/5 bg-white/[0.01]',         dot: 'bg-blue-500 shadow-[0_0_4px_#3b82f6]',   badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
};

const elapsed = (iso: string) => {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/log-aggregation/logs?pageSize=100`, { headers: ADMIN_HEADERS });
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data ?? [];
      setEvents(list);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const active = events.filter(e => !dismissed.has(e.id));
  const critCount = active.filter(e => severityLevel(e.action || '') === 'CRITICAL').length;
  const highCount = active.filter(e => severityLevel(e.action || '') === 'HIGH').length;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-bold">Network // Security Audit</span>
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Security Event Matrix</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">
            {critCount > 0 && <span className="text-red-500 font-black tracking-tighter mr-2">! {critCount} CRITICAL THREATS </span>}
            {highCount > 0 && <span className="text-orange-500 font-black tracking-tighter mr-2">▲ {highCount} ELEVATED </span>}
            <span className="text-zinc-600 font-mono tracking-widest">{active.length} ACTIVE_VECTORS</span>
          </p>
        </div>
        <button
          onClick={fetchEvents}
          className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/30 transition-all active:scale-95"
        >
          Sync Audit Stream
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
          <div className="w-8 h-8 border-2 border-white/5 border-t-red-600 rounded-full animate-spin" />
          <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em]">Streaming Real-time Audit Trail…</p>
        </div>
      ) : active.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-800 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -m-10" />
          <p className="text-4xl mb-4 relative z-10 opacity-40">🛡</p>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] relative z-10">System Integrity: 100% Secure</p>
          <p className="text-[9px] text-zinc-700 font-mono mt-2 relative z-10 uppercase tracking-widest italic">All threat vectors neutralized or dismissed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map(evt => {
            const action = evt.action || 'UNKNOWN_ACTION';
            const sev = severityLevel(action);
            const s = SEV[sev] ?? SEV.LOW;
            const ts = evt.createdAt || evt.created_at || new Date().toISOString();
            const detail = evt.details?.reason || evt.context?.reason || action;

            return (
              <div key={evt.id} className={`admin-card border group hover:border-white/10 transition-all px-7 py-5 flex items-start gap-6 ${s.cls}`}>
                <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm ${s.badge}`}>{sev}</span>
                    <span className="font-mono text-[11px] font-black text-zinc-200 tracking-tight uppercase group-hover:text-red-400 transition-colors">{action}</span>
                    <div className="h-4 w-px bg-white/5 mx-1" />
                    <span className="text-[9px] text-zinc-500 font-mono tracking-widest bg-black/40 border border-white/5 px-2 py-0.5 rounded uppercase">{evt.tenantId || 'SYSTEM_CORE'}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3 leading-relaxed font-medium">{detail}</p>
                  <div className="flex gap-6 text-[10px] text-zinc-600 font-mono uppercase tracking-tighter flex-wrap">
                    {(evt.context?.ip || evt.details?.ip) && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-zinc-800">IP:</span>
                        <span className="text-zinc-500 font-bold">{evt.context?.ip || evt.details?.ip}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <span className="text-zinc-800">UID:</span>
                      <span className="text-zinc-500">{(evt.userId || 'system').slice(0, 12)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-zinc-800">TIMESTAMP:</span>
                      <span className="text-zinc-400 font-black tracking-widest">{elapsed(ts)}</span>
                    </span>
                    <span className="ml-auto text-[8px] opacity-40 group-hover:opacity-100 transition-opacity">ID_{evt.id.slice(0, 8)}</span>
                  </div>
                </div>
                <button
                  id={`dismiss-${evt.id}`}
                  onClick={() => setDismissed(p => new Set([...p, evt.id]))}
                  className="shrink-0 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white border border-white/5 hover:border-red-500 hover:bg-red-500 transition-all rounded-xl mt-1 active:scale-95 shadow-inner"
                >
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
