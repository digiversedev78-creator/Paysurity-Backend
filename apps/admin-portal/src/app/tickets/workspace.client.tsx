'use client';

import { useState } from 'react';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

type Ticket = { id: string; tenantId: string; issueContext: string; status: string; createdAt: string };
type SecureData = { data?: string, error?: string };

export function CSRWorkspace({ initialQueue }: { initialQueue: Ticket[] }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [secureData, setSecureData] = useState<SecureData | null>(null);

  const handleSelect = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setLoadingContext(true);
    setSecureData(null);
    try {
      const res = await fetch(`${API_URL}/admin/tickets/secure-data/${ticket.tenantId}`, {
        headers: ADMIN_HEADERS
      });
      if (res.ok) {
        setSecureData(await res.json());
      } else {
        const err = await res.json();
        setSecureData({ error: err.message || 'Access Forbidden by Enforcer' });
      }
    } catch (e: any) {
      setSecureData({ error: 'Network failure communicating with Enforcer' });
    } finally {
      setLoadingContext(false);
    }
  };

  return (
    <>
      {/* Left Panel: Ticket Queue */}
      <div className="w-1/3 flex flex-col admin-card overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400">Active Dispatch Queue</h2>
          </div>
          <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-widest">{initialQueue.length} TASKS</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-dot-grid-admin">
          {initialQueue.length === 0 ? (
             <div className="text-[10px] text-zinc-600 text-center py-12 font-mono uppercase tracking-[0.2em]">Queue Synchronized // 0 Pending</div>
          ) : initialQueue.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className={`w-full text-left p-5 rounded-2xl border transition-all active:scale-[0.98] group ${
                selectedTicket?.id === t.id 
                  ? 'bg-red-600/10 border-red-500/40 shadow-[0_0_20px_rgba(220,38,38,0.05)]' 
                  : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-mono font-black tracking-tight ${selectedTicket?.id === t.id ? 'text-red-400' : 'text-zinc-500'}`}>TKT_{t.id.slice(0, 12).toUpperCase()}</span>
                <span className={`text-[9px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-md border ${t.status === 'OPEN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}>
                  {t.status}
                </span>
              </div>
              <p className={`text-[11px] font-medium leading-relaxed mb-3 ${selectedTicket?.id === t.id ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{t.issueContext}</p>
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest pt-3 border-t border-white/[0.03]">
                <span className="flex items-center gap-1.5">
                   <span className="text-zinc-800 font-black">TENANT:</span>
                   <span className={selectedTicket?.id === t.id ? 'text-zinc-400' : ''}>{t.tenantId.slice(0, 8)}</span>
                </span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Merchant Context */}
      <div className="flex-1 flex flex-col admin-card overflow-hidden shadow-2xl">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 bg-dot-grid-admin">
            <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center text-4xl mb-6 opacity-20">
              ⚡
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Load Context Vector to Begin</p>
            <p className="text-[9px] font-mono mt-2 opacity-20">PENDING_COMMAND_AUTHORIZATION</p>
          </div>
        ) : (
          <>
            <div className="px-8 py-6 border-b border-white/[0.05] bg-white/[0.01] flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] font-bold">Context Workspace</span>
                    <div className="h-px w-4 bg-zinc-800" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Merchant Operational Hub</h2>
                  <p className="text-[10px] text-zinc-600 font-mono mt-1.5 uppercase">SID: {selectedTicket.tenantId} {"// SECTOR_4"}</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-red-600/10 border border-red-500/20 rounded-xl">
                   <p className="text-[9px] font-mono font-black text-red-500 uppercase tracking-widest animate-pulse">ENFORCER: ARMED</p>
                 </div>
               </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto space-y-10 custom-scrollbar bg-dot-grid-admin">
              {/* Context Render */}
              <section>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  Initial Vector Description
                </h3>
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.02] blur-2xl rounded-full" />
                   <p className="text-sm text-zinc-400 leading-relaxed font-medium relative z-10">{selectedTicket.issueContext}</p>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  Secure Registry Stream // TXN_VAULT
                </h3>
                
                {loadingContext ? (
                  <div className="flex items-center gap-4 bg-red-600/[0.02] border border-red-500/20 p-8 rounded-[2rem] animate-pulse">
                    <div className="w-8 h-8 border-2 border-white/5 border-t-red-600 rounded-full animate-spin" />
                    <div>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Authenticating Uplink...</p>
                      <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">Validating CSR Authority Matrix via Enforcer Core</p>
                    </div>
                  </div>
                ) : secureData?.error ? (
                  <div className="flex items-start gap-5 bg-red-500/10 p-8 rounded-[2rem] border border-red-500/30 text-red-500 group">
                    <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner group-hover:scale-110 transition-all">
                      !
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-xs uppercase tracking-widest mb-1.5">Strict Enforcer: Access Rejected</p>
                      <p className="text-xs text-red-400/80 font-medium leading-relaxed">{secureData.error}</p>
                      <div className="mt-4 pt-4 border-t border-red-500/20 flex items-center justify-between">
                         <p className="text-[9px] text-red-500/60 font-mono uppercase tracking-[0.2em]">Violation Event Logged // Target: ADMIN_AUDIT_LOGS</p>
                         <span className="text-[8px] text-red-500/40 font-mono tracking-widest uppercase">ID: 403_FORBIDDEN</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/60 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/20 transition-all shadow-inner">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.03] blur-[60px] rounded-full group-hover:bg-emerald-500/[0.05] transition-all" />
                    <div className="flex items-center gap-2 mb-6">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                       <span className="text-[10px] font-mono font-black text-emerald-500 uppercase tracking-[0.4em]">Dispatch Link: Active</span>
                    </div>
                    <pre className="text-[11px] font-mono text-emerald-500/80 whitespace-pre-wrap relative z-10 leading-relaxed select-all selection:bg-emerald-500/20 selection:text-white">
{`ACCESS_GRANTED // PROTOCOL_V1
-----------------------------------------
TENANT_ENVIRONMENT_SYNC: 100%
DATA_STRUCTURE: SECURE_BLOB_V2

REGISTRY_DUMP:
[
  { "type": "TXN_THROUGHPUT", "state": "OPERATIONAL", "v": "98.2%" },
  { "type": "GATEWAY_LATENCY", "state": "NOMINAL", "v": "12ms" },
  { "type": "ENFORCER_BLOB", "state": "INJECTED", "v": "${secureData?.data || 'NULL_SET'}" }
]

SYSTEM_NOTICE: This context is scoped to your 
CSR_SPECIALTY_IDENTIFIER. All interactions 
within this hub are audit-logged for SOC2.`}
                    </pre>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}
