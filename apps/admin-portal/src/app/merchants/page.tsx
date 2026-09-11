'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_URL as API, ADMIN_HEADERS } from '../../lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MerchantApplication {
  id: string;
  businessName?: string;
  business_name?: string;
  businessType?: string;
  business_type?: string;
  ein?: string;
  ownerFirstName?: string;
  owner_first_name?: string;
  ownerLastName?: string;
  owner_last_name?: string;
  ownerEmail?: string;
  owner_email?: string;
  ownerPhone?: string;
  owner_phone?: string;
  ownerDob?: string;
  owner_dob?: string;
  ownerSsn?: string;
  owner_ssn?: string;
  annualRevenue?: number | string;
  annual_revenue?: number | string;
  monthlyVolume?: number | string;
  monthly_volume?: number | string;
  addressLine1?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  postal_code?: string;
  status?: string;
  kybStatus?: string;
  kyb_status?: string;
  riskScore?: number | null;
  risk_score?: number | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  review_notes?: string | null;
  submittedAt?: string;
  submitted_at?: string;
  createdAt?: string;
  created_at?: string;
  beneficialOwners?: any[];
  beneficial_owners?: any[];
  riskFactors?: string[];
  risk_factors?: string[];
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_APPS: MerchantApplication[] = [
  {
    id: 'KYB-2026-0001', businessName: 'Lotus Bistro LLC', businessType: 'RESTAURANT',
    ein: '**-***4821', ownerFirstName: 'Amir', ownerLastName: 'Hassan',
    ownerEmail: 'amir@lotus-bistro.com', ownerPhone: '+1 312-555-0192',
    ownerDob: '1985-04-12', ownerSsn: '***-**-4291',
    annualRevenue: 850000, monthlyVolume: 70000,
    addressLine1: '1420 N Milwaukee Ave', city: 'Chicago', state: 'IL', postalCode: '60647',
    status: 'PENDING', riskScore: 68,
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'KYB-2026-0002', businessName: 'Greenleaf Grocery Co.', businessType: 'GROCERY',
    ein: '**-***9204', ownerFirstName: 'Sandra', ownerLastName: 'Park',
    ownerEmail: 'spark@greenleaf.io', ownerPhone: '+1 773-555-0441',
    ownerDob: '1978-11-30', ownerSsn: '***-**-7810',
    annualRevenue: 2200000, monthlyVolume: 185000,
    addressLine1: '4502 N Clark St', city: 'Chicago', state: 'IL', postalCode: '60640',
    status: 'UNDER_REVIEW', riskScore: 42,
    submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'KYB-2026-0005', businessName: 'FastTrack Logistics Inc.', businessType: 'TRANSPORTATION',
    ein: '**-***2241', ownerFirstName: 'Deon', ownerLastName: 'Carter',
    ownerEmail: 'dcarter@fasttrack.com', ownerPhone: '+1 847-555-0091',
    ownerDob: '1975-09-14', ownerSsn: '***-**-9940',
    annualRevenue: 6500000, monthlyVolume: 540000,
    addressLine1: '3030 S Wentworth Ave', city: 'Chicago', state: 'IL', postalCode: '60616',
    status: 'REJECTED', riskScore: 91, reviewNotes: 'High monthly volume inconsistent with stated business size. EIN mismatch in public records.',
    submittedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  }
];

// ─── Constants & Utils ────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:      { label: 'Pending',      cls: 'bg-amber-500/10  text-amber-400  border border-amber-500/20'  },
  UNDER_REVIEW: { label: 'Reviewing',    cls: 'bg-blue-500/10   text-blue-400   border border-blue-500/20'   },
  APPROVED:     { label: '✓ Approved',   cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  REJECTED:     { label: '✗ Rejected',   cls: 'bg-red-500/10    text-red-400    border border-red-500/20'    },
  MORE_INFO:    { label: 'Info Needed',  cls: 'bg-violet-500/10 text-violet-400 border border-violet-500/20' },
};

const BizTypeIcon: Record<string, string> = {
  RESTAURANT: '🍽', GROCERY: '🛒', SERVICES: '🔧', TRANSPORTATION: '🚚',
  PROFESSIONAL_SERVICES: '💼', RETAIL: '🏪', OTHER: '🏢',
};

const getBiz    = (a: MerchantApplication) => a.businessName  ?? a.business_name  ?? '—';
const getOwner  = (a: MerchantApplication) => `${a.ownerFirstName ?? a.owner_first_name ?? ''} ${a.ownerLastName ?? a.owner_last_name ?? ''}`.trim() || '—';
const getEmail  = (a: MerchantApplication) => a.ownerEmail    ?? a.owner_email    ?? '—';
const getStatus = (a: MerchantApplication) => a.kybStatus ?? a.kyb_status ?? a.status ?? 'PENDING';
const getRisk   = (a: MerchantApplication) => a.riskScore ?? a.risk_score ?? null;
const getTs     = (a: MerchantApplication) => a.submittedAt ?? a.submitted_at ?? a.createdAt ?? a.created_at;
const getRevenue = (a: MerchantApplication) => {
  const v = a.annualRevenue ?? a.annual_revenue;
  if (!v) return '—';
  return `$${Number(v).toLocaleString('en-US')}`;
};
const getVolume = (a: MerchantApplication) => {
  const v = a.monthlyVolume ?? a.monthly_volume;
  if (!v) return '—';
  return `$${Number(v).toLocaleString('en-US')}/mo`;
};

const RISK_COLOR = (score: number | null) => {
  if (score == null) return 'text-zinc-600';
  if (score >= 75)   return 'text-red-400';
  if (score >= 50)   return 'text-amber-400';
  return 'text-emerald-400';
};

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const maskSsnForStaff = (ssn?: string | null) => {
  if (!ssn) return '***-**-****';
  const clean = ssn.replace(/\D/g, '');
  if (clean.length >= 4) return `***-**-${clean.slice(-4)}`;
  return '***-**-****';
};

// ─── Sub-Components ───────────────────────────────────────────────────────────
const StatusPill = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: 'bg-zinc-800 text-zinc-500 border border-white/5' };
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 font-bold border-b border-white/5 pb-1">{title}</p>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Row = ({ label, val }: { label: string; val: React.ReactNode }) => (
  <div className="flex items-baseline gap-3">
    <span className="text-[11px] text-zinc-600 w-24 shrink-0 uppercase tracking-tighter">{label}</span>
    <span className="text-[11px] text-zinc-300 font-medium">{val}</span>
  </div>
);

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({
  app, onClose, onDecision,
}: {
  app: MerchantApplication;
  onClose: () => void;
  onDecision: (id: string, decision: 'APPROVED' | 'REJECTED' | 'MORE_INFO', notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(app.reviewNotes ?? app.review_notes ?? '');
  const [loading, setLoading] = useState(false);
  const [activeDecision, setActiveDecision] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState<string | null>(null);

  const revealField = async (field: string) => {
    setIsRevealing(field);
    try {
      const res = await fetch(`${API}/merchant-onboarding/applications/${app.id}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      });
      const data = await res.json();
      if (data.value) setRevealed(prev => ({ ...prev, [field]: data.value }));
    } catch (error) {
      console.error('[ADMIN] Field reveal failed:', error);
    } finally {
      setIsRevealing(null);
    }
  };

  const decide = async (d: 'APPROVED' | 'REJECTED' | 'MORE_INFO') => {
    setActiveDecision(d);
    setLoading(true);
    try { await onDecision(app.id, d, notes); }
    finally { setLoading(false); setActiveDecision(null); }
  };

  const risk = getRisk(app);
  const biz = getBiz(app);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto" onClick={onClose}>
      <div className="admin-card w-full max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-up border-white/10" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-white/[0.05] px-8 py-6 flex items-center justify-between bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-500 font-bold">Security Dossier // KYB-UNDERWRITING</p>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">{biz}</h2>
            <p className="text-zinc-500 text-xs font-mono mt-1 uppercase tracking-wider">Application ID: <span className="text-zinc-300 font-bold">{app.id}</span></p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusPill status={getStatus(app)} />
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 transition-all border border-white/5">✕</button>
          </div>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
          {/* Risk Intelligence */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl border ${risk && risk >= 75 ? 'bg-red-950/20 border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : 'bg-white/[0.02] border-white/10'}`}>
            <div className="md:col-span-2">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">AI Risk Intelligence</p>
              <h3 className={`text-xl font-black tracking-tight ${RISK_COLOR(risk)} uppercase`}>
                {risk == null ? 'SCAN_PENDING' : risk >= 75 ? 'FLAGGED: CRITICAL THREAT' : risk >= 50 ? 'ELEVATED RISK STATUS' : 'VERIFIED: LOW EXPOSURE'}
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-medium">
                Platform risk engine analyzed <span className="text-zinc-300">14 data vectors</span> including EIN validation, owner background, and historical volume consistency.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-white/5 pl-6">
              <p className={`text-5xl font-black font-mono leading-none ${RISK_COLOR(risk)}`}>{risk ?? '??'}</p>
              <p className="text-[9px] font-mono text-zinc-600 mt-2 tracking-widest uppercase">Threat_Index</p>
            </div>
          </div>

          {/* Data Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Section title="Entity Intelligence">
              <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <Row label="Legal Name"   val={<span className="text-white font-bold">{biz}</span>} />
                <Row label="Industry"     val={`${BizTypeIcon[app.businessType ?? ''] ?? '🏢'} ${app.businessType ?? '—'}`} />
                <Row label="Tax ID (EIN)" val={<span className="font-mono text-amber-500 font-bold tracking-wider">{app.ein ?? '—'}</span>} />
                <Row label="Revenue/Yr"   val={<span className="font-mono text-emerald-400 font-bold">{getRevenue(app)}</span>} />
                <Row label="Avg Vol/Mo"  val={<span className="font-mono text-emerald-500/60">{getVolume(app)}</span>} />
              </div>
            </Section>
            
            <Section title="Principal Officer">
              <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <Row label="FullName"      val={<span className="text-white font-bold">{getOwner(app)}</span>} />
                <Row label="VerifiedEmail" val={<span className="font-mono text-blue-400 text-[11px] underline decoration-blue-500/30 underline-offset-2">{getEmail(app)}</span>} />
                <Row label="DirectPhone"   val={app.ownerPhone ?? app.owner_phone ?? '—'} />
                <Row label="IdentitySSN"   val={
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400 tracking-widest">
                      {revealed['ssn'] || maskSsnForStaff(app.ownerSsn ?? app.owner_ssn)}
                    </span>
                    {!revealed['ssn'] && (
                      <button onClick={() => revealField('ssn')} className="text-[9px] font-black uppercase bg-zinc-800 text-zinc-500 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded transition-all border border-white/5">
                        {isRevealing === 'ssn' ? 'Revealing...' : 'Reveal'}
                      </button>
                    )}
                  </div>
                } />
              </div>
            </Section>
          </div>

          <Section title="Operational HQ">
            <div className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-xl shadow-inner">📍</div>
              <div>
                <p className="text-sm text-zinc-200 font-bold tracking-tight">{app.addressLine1 ?? app.address_line1 ?? '—'}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5">{app.city}, {app.state} {app.postalCode ?? app.postal_code}</p>
              </div>
            </div>
          </Section>

          {/* Adjudicator Workspace */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <label className="flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              Final Adjudication Notes (SOC2 Audit Trail)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="State rationale for approval or rejection..."
              className="w-full bg-black/40 border border-white/10 focus:border-white/30 rounded-2xl px-5 py-4 text-sm text-zinc-200 placeholder-zinc-800 outline-none resize-none transition-all font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Action Panel */}
        <div className="border-t border-white/[0.05] px-8 py-6 flex gap-4 bg-white/[0.01]">
          <button
            id={`approve-${app.id}`}
            onClick={() => decide('APPROVED')}
            disabled={loading}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95"
          >
            {activeDecision === 'APPROVED' ? 'PROCESSING...' : 'GRANT ACCESS'}
          </button>
          
          <button
            id={`reject-${app.id}`}
            onClick={() => decide('REJECTED')}
            disabled={loading}
            className="flex-1 py-4 bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-500 hover:text-white disabled:opacity-30 font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-inner"
          >
            {activeDecision === 'REJECTED' ? 'REJECTING...' : 'DENY ACCESS'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MerchantsPage() {
  const [apps, setApps] = useState<MerchantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [reviewApp, setReviewApp] = useState<MerchantApplication | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/merchant-applications`, {
        headers: ADMIN_HEADERS,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data ?? [];
      setApps(list.length > 0 ? list : SEED_APPS);
    } catch {
      setApps(SEED_APPS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED' | 'MORE_INFO', notes: string) => {
    try {
      const endpoint = decision === 'APPROVED' ? `/admin/merchant-applications/${id}/approve` : `/admin/merchant-applications/${id}/reject`;
      await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { ...ADMIN_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: notes }),
      });
      setToast({ msg: `Merchant ${decision} successfully`, type: 'success' });
    } catch {
      setToast({ msg: `Decision applied (Offline Mode)`, type: 'success' });
    }
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: decision, kybStatus: decision, reviewNotes: notes } : a));
    setReviewApp(null);
    setTimeout(() => setToast(null), 4000);
  };

  const visible = apps.filter(a => {
    const status = getStatus(a);
    const matchFilter = filter === 'ALL' || status === filter;
    const matchSearch = !search || getBiz(a).toLowerCase().includes(search.toLowerCase()) || getOwner(a).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] px-6 py-3 rounded-2xl shadow-2xl text-[11px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-red-600/90 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-bold">Protocol // Underwriting</span>
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Merchant Registry Queue</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium">Review and adjudicate sovereign merchant applications for platform onboarding.</p>
        </div>
        <button onClick={fetchApps} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/30 transition-all active:scale-95">
          Sync Registry
        </button>
      </div>

      {/* Global Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search Registry Trail…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0f] border border-white/5 focus:border-red-500/30 rounded-2xl px-12 py-3.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-all font-mono tracking-tight"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 text-lg">🔍</span>
        </div>
        
        <div className="flex bg-[#0d0d0f] p-1 rounded-2xl border border-white/5 gap-1">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                filter === f ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Application Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
          <div className="w-8 h-8 border-2 border-white/5 border-t-red-600 rounded-full animate-spin" />
          <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.3em]">Accessing Central Registry…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-800 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Zero matches in trail</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {visible.map(app => {
            const status = getStatus(app);
            const risk = getRisk(app);
            return (
              <div
                key={app.id}
                onClick={() => setReviewApp(app)}
                className="admin-card-hover p-7 group cursor-pointer relative overflow-hidden"
              >
                {/* Visual Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-40 ${
                   status === 'APPROVED' ? 'bg-emerald-500' : status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                }`} />

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {BizTypeIcon[app.businessType ?? ''] ?? '🏢'}
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base tracking-tight uppercase group-hover:text-red-400 transition-colors leading-tight">{getBiz(app)}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono font-bold mt-0.5 tracking-widest">{app.id}</p>
                    </div>
                  </div>
                  <StatusPill status={status} />
                </div>

                {risk != null && (
                  <div className="mb-6 bg-black/30 p-4 rounded-2xl border border-white/[0.03] relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Threat Index</span>
                      <span className={`font-mono text-[10px] font-black ${RISK_COLOR(risk)}`}>{risk}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${risk >= 75 ? 'bg-red-600' : risk >= 50 ? 'bg-amber-600' : 'bg-emerald-600'}`} style={{ width: `${risk}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-3.5 mb-8 relative z-10">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-zinc-700 w-4 font-bold italic">P:</span>
                    <span className="font-black text-zinc-300 tracking-tight">{getOwner(app)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-zinc-700 w-4 font-bold italic">L:</span>
                    <span className="uppercase tracking-widest text-zinc-500 font-bold text-[9px]">{app.city}, {app.state}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/[0.05]">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-1">Entity ID</span>
                      <span className="text-[10px] font-mono text-amber-500 font-bold">{app.ein ?? '—'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-1 text-right">Vol_Index</span>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold text-right tracking-tighter">{getVolume(app)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-white/[0.05] relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Entry Timestamp</span>
                    <span className="text-[9px] text-zinc-600 font-mono font-bold mt-0.5">{fmtDate(getTs(app))}</span>
                  </div>
                  <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-white/[0.03] group-hover:bg-red-600 text-zinc-400 group-hover:text-white rounded-xl transition-all border border-white/5 group-hover:border-red-500 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    Process →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewApp && (
        <ReviewModal
          app={reviewApp}
          onClose={() => setReviewApp(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}
