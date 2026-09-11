'use client';

import React, { useState, useEffect } from 'react';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  tenantId: string;
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We use v1/feature-flag but as admin we expect a broad list if the backend supports it, 
    // or we hit a dedicated admin/flags endpoint.
    fetch(`${API_URL}/admin/flags`, { headers: ADMIN_HEADERS })
      .then(res => res.json())
      .then(json => {
         const list = json.data || json;
         setFlags(Array.isArray(list) ? list : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em] font-bold">Registry // Logic Overrides</span>
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Feature Circuit Matrix</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium max-w-xl">
            Manage global feature rollouts, experimental platform logic, and sovereign bypass vectors.
          </p>
        </div>
        <button className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95">
          Initialize Global Override
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem]">
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em] animate-pulse">Synchronizing Feature Matrix...</p>
          </div>
        ) : flags.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem]">
            <div className="text-4xl mb-4 opacity-20">⬡</div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">No active overrides registered</p>
            <p className="text-[9px] font-mono text-zinc-800 mt-2 uppercase tracking-widest italic">All circuits in default operational state.</p>
          </div>
        ) : flags.map(f => (
          <div key={f.id} className="admin-card p-6 flex flex-col group hover:border-white/10 transition-all border-white/[0.03]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-mono text-[11px] font-black text-zinc-300 uppercase tracking-tight group-hover:text-red-400 transition-colors">{f.name}</h3>
                <p className="text-[8px] font-mono text-zinc-600 mt-1 uppercase tracking-widest">ID_{f.id.slice(0, 8)}</p>
              </div>
              <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${f.isEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${f.isEnabled ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed h-10 line-clamp-2 mb-6 group-hover:text-zinc-400 transition-colors">
              {f.description || 'System-level feature control vector with no documentation.'}
            </p>
            <div className="flex justify-between items-center pt-5 border-t border-white/[0.03] mt-auto">
              <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-[0.2em] group-hover:text-zinc-500 transition-colors">
                Scope: <span className="text-zinc-800 font-bold">{f.tenantId ? f.tenantId.slice(0,12) : 'SYSTEM_GLOBAL'}</span>
              </span>
              <button className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-red-400 transition-all active:scale-95">
                Configure →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
