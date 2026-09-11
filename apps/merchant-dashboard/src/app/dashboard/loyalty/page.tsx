'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Users, Settings, Activity } from 'lucide-react';

interface Member { id: string; name: string; tier: 'Bronze' | 'Silver' | 'Gold'; pointsBalance: number; }
interface Redemption { id: string; memberName: string; pointsUsed: number; item: string; date: string; }
interface LoyaltyConfig { pointsPerDollar: number; redemptionThreshold: number; }
interface LoyaltyData { totalEnrolledMembers: number; pointsIssuedThisMonth: number; pointsRedeemedThisMonth: number; topMembers: Member[]; recentRedemptions: Redemption[]; configuration: LoyaltyConfig; }

const colors = { pieBlue: '#3B82F6', piePurple: '#8B5CF6', bronze: 'from-amber-700 to-amber-900 text-amber-200 border-amber-800', silver: 'from-slate-400 to-slate-600 text-slate-100 border-slate-400', gold: 'from-yellow-400 to-yellow-600 text-yellow-900 border-yellow-500' };

export default function LoyaltyDashboardPage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulated API Fetch
    setTimeout(() => {
      setData({
        totalEnrolledMembers: 12, pointsIssuedThisMonth: 85000, pointsRedeemedThisMonth: 32000,
        topMembers: [
          { id: 'm1', name: 'Alice Smith', tier: 'Gold', pointsBalance: 15200 },
          { id: 'm11', name: 'Kelly Hall', tier: 'Gold', pointsBalance: 13000 },
          { id: 'm3', name: 'Charlie Brown', tier: 'Gold', pointsBalance: 12100 },
          { id: 'm8', name: 'Heidi Green', tier: 'Gold', pointsBalance: 10500 },
          { id: 'm2', name: 'Bob Johnson', tier: 'Silver', pointsBalance: 9800 },
        ],
        recentRedemptions: [
          { id: 'r1', memberName: 'Alice Smith', pointsUsed: 500, item: 'Gift Card $5', date: new Date(Date.now() - 172800000).toISOString() },
          { id: 'r2', memberName: 'Bob Johnson', pointsUsed: 1000, item: 'Merchandise X', date: new Date(Date.now() - 432000000).toISOString() },
          { id: 'r4', memberName: 'Eve Davis', pointsUsed: 750, item: 'Free Shipping', date: new Date(Date.now() - 864000000).toISOString() },
        ],
        configuration: { pointsPerDollar: 10, redemptionThreshold: 500 },
      });
      setLoading(false);
    }, 800);
  }, []);

  const [cfg, setCfg] = useState({ pts: 10, thresh: 500 });
  useEffect(() => { if (data) setCfg({ pts: data.configuration.pointsPerDollar, thresh: data.configuration.redemptionThreshold }); }, [data]);

  const pointsData = useMemo(() => [
    { name: 'Issued', value: data?.pointsIssuedThisMonth || 0, color: colors.piePurple },
    { name: 'Redeemed', value: data?.pointsRedeemedThisMonth || 0, color: colors.pieBlue },
  ], [data]);

  if (loading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"/></div>;

  if (!data) return <div className="min-h-screen bg-[#09090B] p-10 font-sans text-zinc-100">No Data Available</div>;

  return (
    <div className="min-h-screen bg-[#09090B] p-6 lg:p-10 font-sans text-zinc-100 flex flex-col gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">Loyalty Protocol</h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-lg">Track customer engagement, point issuance, and redemption velocity metrics.</p>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group">
           <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-white/10 transition-colors"><Users size={120} strokeWidth={1} /></div>
           <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Active Members</p>
           <p className="text-5xl font-black text-white">{data.totalEnrolledMembers.toLocaleString()}</p>
           <p className="text-sm text-emerald-400 mt-4 flex items-center gap-1 font-semibold"><TrendingUp size={14}/> +14% this month</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group col-span-1 md:col-span-2 flex flex-col md:flex-row items-center gap-8">
           <div className="flex-1 w-full">
             <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-6">Velocity Matrix (Monthly)</p>
             <div className="flex justify-around items-center w-full bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="text-center">
                  <p className="text-sm text-zinc-500 font-semibold mb-1 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"/> Minted Points</p>
                  <p className="text-3xl font-black text-zinc-100">{data.pointsIssuedThisMonth.toLocaleString()}</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <p className="text-sm text-zinc-500 font-semibold mb-1 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"/> Redeemed Points</p>
                  <p className="text-3xl font-black text-zinc-100">{data.pointsRedeemedThisMonth.toLocaleString()}</p>
                </div>
             </div>
           </div>
           <div className="w-full md:w-64 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pointsData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                    {pointsData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Tier Ledger */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl xl:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2"><Star size={18} className="text-yellow-400"/> Tier Ledger</h3>
          </div>
          <div className="space-y-4">
            {data.topMembers.map((m, i) => (
              <div key={m.id} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center text-zinc-600 font-black text-lg">#{i+1}</div>
                  <div>
                    <p className="font-bold text-zinc-100">{m.name}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">{m.pointsBalance.toLocaleString()} pts</p>
                  </div>
                </div>
                <div className={`px-3 py-1 bg-gradient-to-r ${colors[m.tier.toLowerCase() as keyof typeof colors]} rounded-full text-xs font-black uppercase tracking-wider shadow-lg border`}>{m.tier}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl xl:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2"><Activity size={18} className="text-blue-400"/> Redemption Feed</h3>
          </div>
          <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-white/10 before:-z-10 z-0 pl-1">
             {data.recentRedemptions.map(r => (
               <div key={r.id} className="relative flex gap-6 pb-8 last:pb-0">
                 <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-[#09090B] shadow-[0_0_15px_rgba(59,130,246,0.5)] shrink-0" />
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full backdrop-blur-md">
                   <p className="text-sm text-zinc-300 font-medium"><strong className="text-white">{r.memberName}</strong> minted <span className="text-blue-400 font-bold">{r.pointsUsed} pts</span></p>
                   <p className="text-xs font-semibold text-zinc-500 mt-2 uppercase tracking-wide">Rewards: {r.item}</p>
                   <p className="text-xs text-zinc-600 mt-2">{new Date(r.date).toLocaleDateString()}</p>
                 </div>
               </div>
             ))}
          </div>
        </motion.div>

        {/* System Configuration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl xl:col-span-1 h-fit">
          <div className="flex items-center justify-between mb-6 border-b border-indigo-500/20 pb-4">
            <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2"><Settings size={18}/> Protocol Config</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400/70 mb-2">Points Injection Ratio</label>
              <div className="relative">
                <input type="number" value={cfg.pts} onChange={e=>setCfg({...cfg, pts: Number(e.target.value)})} className="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-4 py-3 focus:border-indigo-400 outline-none text-white font-bold transition-colors pl-12" />
                <Award size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
              </div>
              <p className="text-xs text-indigo-400/50 mt-2">Points awarded per $1.00 USD settled.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400/70 mb-2">Trigger Threshold</label>
              <div className="relative">
                <input type="number" value={cfg.thresh} onChange={e=>setCfg({...cfg, thresh: Number(e.target.value)})} className="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-4 py-3 focus:border-indigo-400 outline-none text-white font-bold transition-colors pl-12" />
                <TrendingUp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
              </div>
              <p className="text-xs text-indigo-400/50 mt-2">Minimum points required for a redemption event.</p>
            </div>
            <button className="w-full py-4 mt-2 bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white font-bold tracking-wide uppercase text-sm rounded-xl transition-all">Flush Config to Edge</button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}