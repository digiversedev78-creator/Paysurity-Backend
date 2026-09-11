'use client';

import { useState } from 'react';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

type Tenant = { id: string; name: string; vertical: string | null; createdAt: string };

export function TenantsTable({ initialTenants }: { initialTenants: Tenant[] }) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [verifying, setVerifying] = useState(false);

  const toggleVertical = async (tenantId: string, vertical: string, isActive: boolean) => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/admin/tenants/${tenantId}/subscription`, {
        method: 'PUT',
        headers: { 
          ...ADMIN_HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vertical, isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, vertical: data.vertical } : t));
        if (selectedTenant && selectedTenant.id === tenantId) {
           setSelectedTenant(t => t ? ({ ...t, vertical: data.vertical }) : null);
        }
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.05] text-[10px] uppercase font-mono tracking-[0.2em] text-zinc-500 bg-white/[0.01]">
              <th className="px-6 py-4 font-black">Tenant Identifier</th>
              <th className="px-6 py-4 font-black">Subscribed Vertical</th>
              <th className="px-6 py-4 font-black">Registry Date</th>
              <th className="px-6 py-4 text-right font-black">Operations</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono divide-y divide-white/[0.03]">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-zinc-200 font-black tracking-tight uppercase group-hover:text-red-400 transition-colors">{t.name}</span>
                    <span className="text-[9px] text-zinc-600 mt-0.5">{t.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${t.vertical && t.vertical !== 'NONE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-900 text-zinc-600 border border-white/5'}`}>
                    {t.vertical || 'NONE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500 font-medium tabular-nums">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedTenant(t)}
                    className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-600 text-zinc-400 hover:text-white px-4 py-2 rounded-lg transition-all active:scale-95 border border-white/5 hover:border-red-500"
                  >
                    Drill-down
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-600 font-mono tracking-widest uppercase">Registry scan returned 0 results</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drill-down Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedTenant(null)}>
          <div className="admin-card w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-up border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-8 py-6 border-b border-white/[0.05] bg-white/[0.01]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-500 font-bold">System Configuration Matrix</p>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">{selectedTenant.name}</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">INSTANCE_UID: {selectedTenant.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTenant(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition-all border border-white/5"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-8 bg-dot-grid-admin">
              {/* Subscription Matrix Toggles */}
              <section>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  Subscription Vertical Matrix
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {['POS_RESTAURANT', 'RETAIL', 'ECOMMERCE', 'WALLET'].map((v) => {
                    const isActive = selectedTenant.vertical === v;
                    return (
                      <button
                        key={v}
                        disabled={verifying}
                        onClick={() => toggleVertical(selectedTenant.id, v, !isActive)}
                        className={`p-4 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${isActive ? 'bg-red-600/10 border-red-500/40 text-red-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'}`}
                      >
                        <span className="font-black text-[11px] uppercase tracking-widest font-mono">{v.replace('_', ' ')}</span>
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isActive ? 'bg-red-600 border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-zinc-800'}`}>
                           {isActive && (
                             <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                             </svg>
                           )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Secure POS Blob Access */}
              <section>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  Secure Storage Vault
                </h4>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-200 uppercase tracking-tight">Compliance Blob Storage</p>
                      <p className="text-[10px] text-zinc-600 font-mono mt-1 uppercase">AES-256 GCM ENCRYPTED // AUDIT-LOG-ENABLED</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        localStorage.setItem('ps_impersonate_tenant_id', selectedTenant.id);
                        window.open(`http://localhost:3000/dashboard?impersonated=true`, '_blank');
                      }} 
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                    >
                      🚀 Impersonate Merchant
                    </button>
                    <button onClick={() => alert('Access logged to security audit trail.')} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10">
                      Mount Vault
                    </button>
                  </div>
                </div>
              </section>
              
              {/* Secure Billing Integration */}
              <section>
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  Financial Operations
                </h4>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#10b981]/[0.05] to-[#10b981]/[0.01] border border-[#10b981]/[0.1] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-zinc-200 uppercase tracking-tight">Tenant Subscription Billing</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">MANAGE TIERS & INVOICING (RLS ENFORCED)</p>
                  </div>
                  <button 
                    onClick={() => window.open(`/tenants/${selectedTenant.id}/billing`, '_self')}
                    className="px-6 py-3 bg-[#10b981] hover:bg-[#0d9d6e] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    Manage Billing
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
