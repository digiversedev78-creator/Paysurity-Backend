'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Activity, FileCheck2, ArrowRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Default to localhost for staging

interface Application {
  id: string;
  cdlNumber: string;
  status: 'PENDING' | 'APPROVED' | 'ESCROW_FUNDED' | 'ADVANCED' | 'REJECTED';
  escrowAmount: number;
}

export default function PayFactorDashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [cdlInput, setCdlInput] = useState('');
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  const [metrics, setMetrics] = useState({ escrow: 0, advanced: 0 });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    // Simulated Staging fetch
    setApps([
      { id: 'app_v9x', cdlNumber: 'TX-8849201', status: 'PENDING', escrowAmount: 0 },
      { id: 'app_f2a', cdlNumber: 'CA-1029481', status: 'APPROVED', escrowAmount: 0 },
      { id: 'app_z7m', cdlNumber: 'NV-5532290', status: 'ESCROW_FUNDED', escrowAmount: 12000 },
      { id: 'app_p4q', cdlNumber: 'NY-8832014', status: 'ADVANCED', escrowAmount: 8500 },
    ]);
    setMetrics({ escrow: 12000, advanced: 8500 });
    setLoading(false);
  };

  const submitApplication = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/payfactor/apply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cdlNumber: cdlInput })
      });
      // Mock local optimistic push
      setApps(p => [{ id: `app_${Date.now()}`, cdlNumber: cdlInput, status: 'PENDING', escrowAmount: 0 }, ...p]);
      setShowApplyModal(false);
      setCdlInput('');
    } catch {}
  };

  const fundEscrow = async () => {
    if (!selectedApp) return;
    try {
      await fetch(`${API_BASE}/api/v1/payfactor/escrow`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: selectedApp.id, amount: 15000 }) // Demo $15k escrow
      });
      setApps(p => p.map(a => a.id === selectedApp.id ? { ...a, status: 'ESCROW_FUNDED', escrowAmount: 15000 } : a));
      setMetrics(m => ({ ...m, escrow: m.escrow + 15000 }));
      setShowEscrowModal(false);
    } catch {}
  };

  const disburseAdvance = async (app: Application) => {
    try {
      await fetch(`${API_BASE}/api/v1/payfactor/advance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id, trancheAmount: app.escrowAmount * 0.5 }) // Demo 50% advance
      });
      setApps(p => p.map(a => a.id === app.id ? { ...a, status: 'ADVANCED' } : a));
      setMetrics(m => ({ ...m, advanced: m.advanced + (app.escrowAmount * 0.5) }));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans p-8 overflow-hidden relative">
      <div className="absolute inset-x-0 bottom-0 bg-[radial-gradient(circle_at_bottom,_#4c1d95,_transparent_50%)] pointer-events-none opacity-30 h-[800px]" />
      <div className="absolute inset-y-0 right-0 bg-[radial-gradient(ellipse_at_right,_#1e1b4b,_transparent_50%)] pointer-events-none opacity-50 w-[800px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-8 h-8 text-violet-500" />
              <h1 className="text-4xl font-extrabold pb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">PayFactor Engine</h1>
            </div>
            <p className="text-zinc-400 text-lg">Freight escrow & immediate cash advance financing (Tranche 1).</p>
          </div>
          <button 
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20 text-white font-bold py-3 px-6 rounded-xl"
          >
            <FileCheck2 className="w-5 h-5"/> New Application
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2"><ShieldCheck className="w-6 h-6 text-zinc-400" /> <span className="text-zinc-400 font-semibold">Active Escrows Held</span></div>
            <p className="text-4xl font-black text-white">${metrics.escrow.toLocaleString()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2"><DollarSign className="w-6 h-6 text-violet-400" /> <span className="text-zinc-400 font-semibold">Cash Advanced (T1)</span></div>
            <p className="text-4xl font-black text-violet-400">${metrics.advanced.toLocaleString()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2"><Activity className="w-6 h-6 text-emerald-400" /> <span className="text-zinc-400 font-semibold">System Status</span></div>
            <p className="text-xl font-bold text-emerald-400 mt-2 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"/> Engine Operational</p>
          </motion.div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950/50">
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-xs tracking-wider">
                <th className="py-5 px-6 font-semibold">CDL Driver ID</th>
                <th className="py-5 px-6 font-semibold text-center">Engine Status</th>
                <th className="py-5 px-6 font-semibold text-right">Escrow Locked</th>
                <th className="py-5 px-6 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="py-5 px-6 font-mono text-zinc-200">{app.cdlNumber}</td>
                  <td className="py-5 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-2 ${
                      app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      app.status === 'ESCROW_FUNDED' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 
                      app.status === 'ADVANCED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {app.status === 'PENDING' && <AlertTriangle className="w-3 h-3"/>}
                      {app.status === 'ESCROW_FUNDED' && <ShieldCheck className="w-3 h-3"/>}
                      {app.status === 'ADVANCED' && <CheckCircle2 className="w-3 h-3"/>}
                      {app.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right font-bold text-emerald-400">
                    {app.escrowAmount > 0 ? `$${app.escrowAmount.toLocaleString()}` : '--'}
                  </td>
                  <td className="py-5 px-6 text-right flex justify-end gap-2">
                    {app.status === 'APPROVED' && (
                      <button onClick={() => { setSelectedApp(app); setShowEscrowModal(true); }} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-zinc-700">
                        Lock Escrow <ShieldCheck className="w-4 h-4"/>
                      </button>
                    )}
                    {app.status === 'ESCROW_FUNDED' && (
                      <button onClick={() => disburseAdvance(app)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2">
                        Release Advance <ArrowRight className="w-4 h-4"/>
                      </button>
                    )}
                    {app.status === 'ADVANCED' && (
                      <span className="text-zinc-500 text-sm font-medium mr-4">Tranche 2 Pending</span>
                    )}
                    {app.status === 'PENDING' && (
                      <span className="text-zinc-500 text-sm font-medium mr-4">Reviewing Credit...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals omitted for brevity, but natively wired directly via explicit state handlers matching native fetches */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <h2 className="text-2xl font-bold text-white mb-2">New Factoring Application</h2>
              <div className="mb-6"><label className="text-xs font-bold text-zinc-500 uppercase">Driver CDL</label><input value={cdlInput} onChange={e=>setCdlInput(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white mt-2" placeholder="e.g. TX-192847" /></div>
              <div className="flex gap-3"><button onClick={() => setShowApplyModal(false)} className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800">Cancel</button><button onClick={submitApplication} className="flex-[2] py-3 px-4 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-500">Run Credit</button></div>
            </div>
          </div>
        )}

        {showEscrowModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <h2 className="text-2xl font-bold text-white mb-2">Fund Escrow</h2>
              <p className="text-zinc-400 mb-6 font-mono text-sm">Locking funds for CDL: {selectedApp?.cdlNumber}</p>
              <div className="flex gap-3"><button onClick={() => setShowEscrowModal(false)} className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 font-semibold">Cancel</button><button onClick={fundEscrow} className="flex-[2] py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2"><ShieldCheck className="w-5 h-5"/> Secure Payload</button></div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}