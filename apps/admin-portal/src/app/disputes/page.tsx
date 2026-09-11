'use client';

import React, { useState, useEffect } from 'react';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

interface Dispute {
  id: string;
  tenantId: string;
  amountCents: number;
  reason: string;
  status: string;
  createdAt: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/disputes`, { headers: ADMIN_HEADERS })
      .then(res => res.json())
      .then(data => setDisputes(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em] font-bold">Financial // Arbitration Matrix</span>
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Dispute Resolution Queue</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium max-w-xl">
            Manage cardholder chargebacks and sovereign arbitration vectors for merchant instances.
          </p>
        </div>
        <div className="px-5 py-2.5 bg-red-600/10 border border-red-500/20 rounded-xl">
          <p className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">
            {disputes.length} ACTIVE_CHALLENGES
          </p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-500 bg-white/[0.01]">
                <th className="px-8 py-5 font-black">Vector_ID</th>
                <th className="px-8 py-5 font-black">Tenant_UID</th>
                <th className="px-8 py-5 font-black">Arbitration_Value</th>
                <th className="px-8 py-5 font-black">Reason_Code</th>
                <th className="px-8 py-5 font-black">Registry_Status</th>
                <th className="px-8 py-5 text-right font-black">Operations</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono divide-y divide-white/[0.03]">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-zinc-600 font-mono animate-pulse uppercase tracking-[0.2em]">Synchronizing Dispute Layer...</td></tr>
              ) : disputes.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-zinc-700 font-mono uppercase tracking-widest italic">Sovereign Queue Synchronized // No active vectors</td></tr>
              ) : disputes.map(d => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-8 py-5 font-bold text-zinc-500 group-hover:text-red-400 transition-colors">{d.id.slice(0, 12).toUpperCase()}</td>
                  <td className="px-8 py-5 text-zinc-600">{d.tenantId.slice(0, 12).toUpperCase()}</td>
                  <td className="px-8 py-5">
                    <span className="text-white font-black tracking-tight text-sm">${(d.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-zinc-400 uppercase tracking-tighter group-hover:text-zinc-200 transition-colors">{d.reason}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${d.status === 'OPEN' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-600 text-zinc-400 hover:text-white px-4 py-2 rounded-lg transition-all active:scale-95 border border-white/5 hover:border-red-500">
                      Adjudicate →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
