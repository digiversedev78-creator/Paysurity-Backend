"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle, Wrench, Building, FileText, Landmark, FileCheck } from 'lucide-react';

const steps = [
  { id: 1, title: 'Driver KYC', icon: Truck },
  { id: 2, title: 'Banking Details', icon: Landmark },
  { id: 3, title: 'Load Profile', icon: FileText },
  { id: 4, title: 'Verification', icon: FileCheck },
];

export default function PayFactorApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ driverName: '', dotNumber: '', cdlState: '', cdlNumber: '', routingNumber: '', accountNumber: '', aelsLoadId: '', grossAmount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const next = () => setCurrentStep(p => Math.min(p + 1, 5));
  const prev = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleSubmit = (e: any) => {
    e.preventDefault(); setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setResult({ id: 'PF-88992', est: '24-48 hours' }); setCurrentStep(5); }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#09090B] font-sans text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl relative">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] z-0 rounded-full"></div>
        
        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-indigo-400">PayFactor Onboarding</h1>
            <p className="text-zinc-400 mt-2">Accelerate your cash flow securely and seamlessly.</p>
          </div>

          {currentStep < 5 && (
            <div className="flex justify-between items-center mb-12 relative px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -z-10 -translate-y-1/2 rounded-full overflow-hidden">
                 <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${(currentStep - 1) / 3 * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              {steps.map((s) => {
                const active = currentStep >= s.id;
                const Icon = s.icon;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white' : 'bg-[#09090B] border-white/10 text-zinc-500'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-indigo-300' : 'text-zinc-600'}`}>{s.title}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative overflow-hidden min-h-[300px]">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Driver Identity</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold uppercase text-zinc-500">Legal Name</label><input type="text" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.driverName} onChange={e=>setFormData({...formData, driverName: e.target.value})} /></div>
                    <div className="col-span-2 md:col-span-1"><label className="text-xs font-bold uppercase text-zinc-500">DOT Number</label><input type="text" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.dotNumber} onChange={e=>setFormData({...formData, dotNumber: e.target.value})} /></div>
                    <div className="col-span-2"><label className="text-xs font-bold uppercase text-zinc-500">CDL Number (State & ID)</label>
                       <div className="flex gap-4 mt-2">
                         <input type="text" placeholder="State (e.g. TX)" className="w-24 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.cdlState} onChange={e=>setFormData({...formData, cdlState: e.target.value})} />
                         <input type="text" placeholder="CDL Number" className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.cdlNumber} onChange={e=>setFormData({...formData, cdlNumber: e.target.value})} />
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Banking Configuration</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><label className="text-xs font-bold uppercase text-zinc-500">Routing Number (9 Digits)</label><input type="text" placeholder="ABA Routing" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.routingNumber} onChange={e=>setFormData({...formData, routingNumber: e.target.value})} /></div>
                    <div className="col-span-2"><label className="text-xs font-bold uppercase text-zinc-500">Account Number</label><input type="password" placeholder="DDA Account" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.accountNumber} onChange={e=>setFormData({...formData, accountNumber: e.target.value})} /></div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">Load Allocation Details</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><label className="text-xs font-bold uppercase text-zinc-500">AELS Load ID</label><input type="text" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.aelsLoadId} onChange={e=>setFormData({...formData, aelsLoadId: e.target.value})} /></div>
                    <div className="col-span-2"><label className="text-xs font-bold uppercase text-zinc-500">Projected Gross Estimate ($)</label><input type="number" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-indigo-500 outline-none transition-colors" value={formData.grossAmount} onChange={e=>setFormData({...formData, grossAmount: e.target.value})} /></div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-semibold mb-6">KYC Final Verification</h2>
                  <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 text-sm text-zinc-300">
                     <p><strong className="text-white">Driver:</strong> {formData.driverName} ({formData.cdlState} {formData.cdlNumber})</p>
                     <p><strong className="text-white">DOT:</strong> {formData.dotNumber}</p>
                     <p><strong className="text-white">Banking:</strong> {formData.routingNumber} / ****{formData.accountNumber.slice(-4)}</p>
                     <p><strong className="text-white">Load Scope:</strong> {formData.aelsLoadId} @ ${formData.grossAmount}</p>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && result && (
                <motion.div key="5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }} className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle size={48} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Application Secured</h2>
                  <p className="text-zinc-400 max-w-md mx-auto">Your PayFactor KYC & Load routing configuration was successfully securely stored via AELS standard.</p>
                  <div className="mt-8 bg-white/5 border border-white/10 p-6 rounded-2xl w-full max-w-sm flex justify-between items-center text-left">
                     <div><p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">App ID</p><p className="font-mono text-lg text-white mt-1">{result.id}</p></div>
                     <div className="text-right"><p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">SLA Wait</p><p className="font-semibold text-emerald-400 mt-1">{result.est}</p></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {currentStep < 5 && (
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
              <button disabled={currentStep === 1 || isSubmitting} onClick={prev} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
              {currentStep < 4 ? (
                <button onClick={next} className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-bold transition-all">Continue</button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white font-bold transition-all flex items-center gap-2">
                  {isSubmitting ? <><div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> Minting Details...</> : 'Deploy Application'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}