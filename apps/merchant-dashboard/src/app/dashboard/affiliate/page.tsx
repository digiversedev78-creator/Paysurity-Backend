'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, BarChart3, Users, Gift, TrendingUp, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Default to localhost for staging

interface AffiliateLink {
  id: string;
  url: string;
  campaign: string;
  clicks: number;
  conversions: number;
}

export default function AffiliateDashboard() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [metrics, setMetrics] = useState({ totalClicks: 0, totalConversions: 0, revenueShare: 0 });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      // Future API connection
      // const res = await fetch(`${API_BASE}/api/affiliates/tracking-links?tenantId=tenant_123`);
      // Simulating staging DB response
      setLinks([
        { id: 'aff_1', url: 'https://paysurity.com/ref/houseofbiryani', campaign: 'Default Referral', clicks: 124, conversions: 12 },
        { id: 'aff_2', url: 'https://paysurity.com/ref/spring_promo', campaign: 'Spring Instagram Promo', clicks: 840, conversions: 45 },
      ]);
      setMetrics({ totalClicks: 964, totalConversions: 57, revenueShare: 1425.50 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateLink = async () => {
    if (!campaignName) return;
    try {
      // const res = await fetch(`${API_BASE}/api/affiliates/tracking-links`, { method: 'POST', body: JSON.stringify({ campaignName }) });
      const newLink: AffiliateLink = {
        id: `aff_${Date.now()}`,
        url: `https://paysurity.com/ref/${campaignName.toLowerCase().replace(/\s+/g, '_')}`,
        campaign: campaignName,
        clicks: 0,
        conversions: 0
      };
      setLinks(prev => [newLink, ...prev]);
      setCampaignName('');
    } catch (e) {}
  };

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans p-8 overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 bg-[radial-gradient(ellipse_at_top,_#0f766e,_transparent_40%)] pointer-events-none opacity-40 h-[600px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold pb-2 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Partner & Affiliates</h1>
          <p className="text-zinc-400 text-lg">Generate tracking links, monitor referred revenue, and collect payouts.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-md">
            <Users className="w-10 h-10 text-teal-500 mb-4" />
            <p className="text-zinc-400 text-sm">Total Converted Partners</p>
            <p className="text-4xl font-black text-white">{metrics.totalConversions}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-md">
            <BarChart3 className="w-10 h-10 text-blue-500 mb-4" />
            <p className="text-zinc-400 text-sm">Campaign Click-Throughs</p>
            <p className="text-4xl font-black text-white">{metrics.totalClicks}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-md shadow-lg shadow-emerald-900/20">
            <TrendingUp className="w-10 h-10 text-emerald-400 mb-4" />
            <p className="text-emerald-200/60 text-sm">Revenue Share Earned</p>
            <p className="text-4xl font-black text-emerald-400">${metrics.revenueShare.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-lg">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3"><Link2 className="w-6 h-6 text-teal-400" /> Active Tracking Links</h2>
            
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-zinc-100 mb-1">{link.campaign}</h3>
                    <div className="flex items-center gap-2 text-sm text-teal-400/80 bg-teal-500/10 px-3 py-1 rounded-lg w-fit border border-teal-500/20 font-mono">
                      {link.url}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Clicks</p>
                      <p className="text-white font-semibold">{link.clicks}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Signups</p>
                      <p className="text-white font-semibold">{link.conversions}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(link.id, link.url)}
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors border border-zinc-700"
                    >
                      {copiedId === link.id ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-zinc-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-lg h-fit">
            <h2 className="text-xl font-bold mb-2 text-white flex items-center gap-3">Create Campaign</h2>
            <p className="text-zinc-400 text-sm mb-6">Generate a new unique tracing URL.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Campaign Name</label>
                <input 
                  value={campaignName} onChange={e=>setCampaignName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none focus:border-teal-500 transition-colors" 
                  placeholder="e.g. Summer Promo 2026" 
                />
              </div>
              <button 
                onClick={handleGenerateLink}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <Link2 className="w-5 h-5" /> Generate URL
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-zinc-800/80">
              <div className="flex items-start gap-4 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                <Gift className="w-6 h-6 text-teal-400 flex-shrink-0" />
                <div>
                  <h4 className="text-teal-100 font-semibold mb-1 text-sm">Current Tier: Pro Partner</h4>
                  <p className="text-teal-500/80 text-xs leading-relaxed">You are earning 15% revenue share on all processing fees generated by your referred merchants.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
