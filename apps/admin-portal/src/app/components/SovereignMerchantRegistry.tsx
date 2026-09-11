'use client';

import { useState, useEffect, useCallback } from 'react';

import { API_URL as API, ADMIN_HEADERS } from '../../lib/constants';

interface RegistryEntry {
  id: string;
  merchantName: string;
  status: string;
  signature: string;
  updatedAt: string;
}

export default function SovereignMerchantRegistry() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistry = useCallback(async () => {
    try {
      const res = await fetch(`${API}/merchant-onboarding/registry`, {
        headers: ADMIN_HEADERS,
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch Sovereign Registry', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistry();
    const intervalId = setInterval(fetchRegistry, 5000); // 5 sec live refresh
    return () => clearInterval(intervalId);
  }, [fetchRegistry]);
  return (
    <div className="admin-card overflow-hidden mt-8 animate-fade-up border-emerald-500/20">
      {/* Table Header Section */}
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-emerald-500/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <h2 className="text-xs font-mono font-black uppercase tracking-[0.2em] text-emerald-400">
            Sovereign Merchant Registry <span className="text-emerald-700 ml-1">FIPS-204 // PQC</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-900" />
            Live Sync: Active
          </div>
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] text-[9px] uppercase font-mono tracking-[0.15em] text-zinc-500 bg-white/[0.01]">
              <th className="px-6 py-4 font-black">Merchant Entity</th>
              <th className="px-6 py-4 font-black">Auth Status</th>
              <th className="px-6 py-4 font-black">PQC MLDSA-Signature (Chain)</th>
              <th className="px-6 py-4 font-black text-right">Escrow Handshake</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono divide-y divide-white/[0.03]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
                    </div>
                    <p className="text-[10px] text-zinc-600 animate-pulse tracking-widest font-bold">AWAITING SOVEREIGN HANDSHAKE...</p>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <p className="text-zinc-700 text-[10px] tracking-widest uppercase font-bold">Registry currently empty</p>
                  <p className="text-zinc-800 text-[9px] mt-1 italic">No merchants have completed Sovereign Onboarding in the current epoch.</p>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-emerald-500/[0.02] transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
                      <span className="text-zinc-200 font-black tracking-tight uppercase group-hover:text-emerald-400 transition-colors">{entry.merchantName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-[10px] bg-black/20 px-1.5 py-0.5 rounded border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                        0x...{entry.signature.slice(-28)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-500 text-[10px] text-right font-bold tabular-nums">
                    {new Date(entry.updatedAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: false 
                    })} <span className="text-zinc-700 ml-1">UTC</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
