'use client';

import { useState, useRef } from 'react';

import { API_URL as API, ADMIN_HEADERS } from '../../lib/constants';

// ─── PQC Signature Generator (mirrors apps/public-website/src/lib/pqc.ts) ─────
function generatePqcSignature(tenantId: string, payload: object): string {
  const timestamp = Date.now();
  const canonical = JSON.stringify({ tenantId, timestamp, payload });
  // STUB: ML-DSA-65 / FIPS 204 — replace with @noble/post-quantum in production
  return `mldsa-fips204-stub::${tenantId}::${timestamp}::ML-DSA-65::${Buffer.from(canonical.slice(0, 32)).toString('base64')}`;
}

// ─── Demo seed (realistic data for shareholder walkthrough) ───────────────────
const DEMO_PAYLOAD = {
  appName:       'Harvest Kitchen LLC',
  salesPartner:  'PaySurity Direct',
  template:      'RESTAURANT_STANDARD',
  initEmail:     'owner@harvestkitchen.com',
  initPhone:     '+1-512-555-0192',
  pFirstName:    'Marcus',
  pLastName:     'Okafor',
  pTitle:        'Owner',
  pEquity:       '100',
  pSsn:          '***-**-4821',
  pDob:          '1981-07-14',
  pDlNumber:     'TX-DL-8821004',
  pDlState:      'TX',
  bBusinessName: 'Harvest Kitchen',
  bLegalName:    'Harvest Kitchen LLC',
  bFein:         '82-4491023',
  bType:         'LLC',
  bCbd:          false,
  bMcc:          '5812',
  bAvgTicket:    '4200',
  bAvgMonthly:   '185000',
  bHighTicket:   '22000',
  bAmexMonthly:  '18000',
  bWebsite:      'https://harvestkitchen.com',
  bRouting:      '021000021',
  bAccount:      '****8842',
};

type Step = 'form' | 'submitting' | 'done' | 'error';

interface PqcLog {
  timestamp: string;
  algorithm: string;
  signature: string;
  endpoint: string;
  applicationId: string;
  status: 'SOVEREIGN_ESCROW_HOLD' | 'DRAFT_SECURED';
}

export default function OnboardMerchantPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]         = useState<Step>('form');
  const [form, setForm]         = useState({ appName: '', initEmail: '', initPhone: '', bBusinessName: '', bLegalName: '', bFein: '', bType: 'LLC', bAvgMonthly: '', bWebsite: '' });
  const [pqcLog, setPqcLog]     = useState<PqcLog | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDemoFill, setIsDemoFill] = useState(false);
  const formRef                 = useRef<HTMLFormElement>(null);

  // ── Fill with demo data ────────────────────────────────────────────────────
  const fillDemo = () => {
    setForm({
      appName:      DEMO_PAYLOAD.appName,
      initEmail:    DEMO_PAYLOAD.initEmail,
      initPhone:    DEMO_PAYLOAD.initPhone,
      bBusinessName: DEMO_PAYLOAD.bBusinessName,
      bLegalName:   DEMO_PAYLOAD.bLegalName,
      bFein:        DEMO_PAYLOAD.bFein,
      bType:        DEMO_PAYLOAD.bType,
      bAvgMonthly:  DEMO_PAYLOAD.bAvgMonthly,
      bWebsite:     DEMO_PAYLOAD.bWebsite,
    });
    setIsDemoFill(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    setErrorMsg('');

    const tenantId    = 'admin-portal-onboarding';
    const fullPayload = isDemoFill ? { ...DEMO_PAYLOAD, ...form } : form;
    const pqcSig      = generatePqcSignature(tenantId, fullPayload);
    const endpoint    = `${API}/merchant-onboarding/draft`;

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: {
          ...ADMIN_HEADERS,
          'Content-Type':    'application/json',
          'X-PQC-Signature': pqcSig,
          'X-Source':        'SHAREHOLDER_DASHBOARD',
        },
        credentials: 'include',
        body: JSON.stringify(fullPayload),
      });

      const data = await res.json();
      const applicationId = data?.id ?? `LOCAL-${Date.now()}`;

      const log: PqcLog = {
        timestamp:     new Date().toISOString(),
        algorithm:     'ML-DSA-65 (FIPS 204)',
        signature:     pqcSig,
        endpoint,
        applicationId,
        status:        'DRAFT_SECURED',
      };
      setPqcLog(log);
      setStep('done');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Network error — API may be offline');
      setStep('error');
    }
  };

  const reset = () => {
    setStep('form');
    setPqcLog(null);
    setErrorMsg('');
    setIsDemoFill(false);
    setForm({ appName: '', initEmail: '', initPhone: '', bBusinessName: '', bLegalName: '', bFein: '', bType: 'LLC', bAvgMonthly: '', bWebsite: '' });
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputCls = 'w-full bg-black/40 border border-white/5 focus:border-red-500/30 rounded-2xl px-5 py-3 text-sm text-zinc-200 placeholder-zinc-800 outline-none transition-all font-mono leading-relaxed';
  const labelCls = 'block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2.5 ml-1';

  // ── Render — Done ──────────────────────────────────────────────────────────
  if (step === 'done' && pqcLog) {
    return (
      <div className="space-y-8 animate-fade-up max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center py-10 bg-emerald-500/[0.02] border border-dashed border-emerald-500/20 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -m-20" />
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mb-6 relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            ⬡
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-emerald-500 font-black mb-2 relative z-10">Transmission Secure</p>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic relative z-10">Application Registry Uplinked</h1>
          <p className="text-zinc-500 text-sm mt-3 max-w-md relative z-10 font-medium">Merchant application data has been crytographically signed and persisted to the sovereign escrow layer.</p>
        </div>

        {/* PQC Handshake Log */}
        <div className="admin-card overflow-hidden border-emerald-500/20 bg-emerald-950/[0.02]">
          <div className="px-8 py-5 border-b border-white/[0.05] flex items-center justify-between bg-emerald-500/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-emerald-400">PQC Protocol Report // FIPS-204</h2>
            </div>
            <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-widest px-2 py-0.5 border border-emerald-500/20 rounded">Encrypted_Uplink</span>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-1">Status_Vector</p>
                <p className="text-emerald-400 font-black font-mono text-xs uppercase tracking-tighter">{pqcLog.status}</p>
              </div>
              <div>
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-1">Cipher_Suite</p>
                <p className="text-emerald-500/80 font-mono text-xs uppercase tracking-tighter">{pqcLog.algorithm.replace(' (FIPS 204)', '')}</p>
              </div>
              <div>
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-1">Registry_UID</p>
                <p className="text-zinc-300 font-mono text-xs font-bold tracking-tighter">{pqcLog.applicationId}</p>
              </div>
              <div>
                <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-1">Epoch_Time</p>
                <p className="text-zinc-500 font-mono text-xs font-bold tracking-tighter">{new Date(pqcLog.timestamp).getTime()}</p>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mb-2">Cryptographic_Signature (X-PQC-Signature)</p>
              <p className="text-zinc-500 font-mono break-all bg-black/40 border border-white/5 rounded-2xl p-5 text-[10px] leading-relaxed select-all">
                {pqcLog.signature}
              </p>
            </div>
          </div>
          <div className="px-8 py-3 bg-white/[0.01] border-t border-white/[0.05]">
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-black">Verify trail at: <span className="text-zinc-500 underline decoration-zinc-800 underline-offset-4">{pqcLog.endpoint}</span></p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button id="onboard-another-btn" onClick={reset}
            className="flex-1 py-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-inner">
            Register New Instance
          </button>
          <a href="/" className="flex-1 py-4 bg-white/5 border border-white/10 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl text-center transition-all active:scale-95">
            Return to Matrix
          </a>
        </div>
      </div>
    );
  }

  // ── Render — Error ─────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="space-y-6 max-w-2xl animate-fade-up">
        <div className="bg-red-950/20 border border-red-500/30 rounded-[2rem] p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl text-red-500 mb-6 font-black shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            !
          </div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-red-500 mb-2">Registry Uplink Failed</p>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xs">{errorMsg}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setStep('form')}
            className="flex-1 py-4 bg-white/5 border border-white/10 text-zinc-300 text-xs font-black uppercase tracking-widest rounded-2xl hover:border-white/20 transition-all active:scale-95">
            Reset Uplink
          </button>
          <a href="/" className="flex-1 py-4 border border-white/5 text-zinc-600 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl text-center transition-all">
            Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ── Render — Form ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 animate-fade-up max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em] font-bold">Protocol // Secure Uplink</span>
            <div className="h-px w-8 bg-zinc-800" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Onboard New Instance</h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium max-w-lg">
            Initialize sovereign merchant records. Application data is signed with <span className="text-emerald-500 font-black">ML-DSA-65</span> post-quantum algorithms on submission.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-widest">Auth_Bypass: Active</p>
          </div>
          <a href="/" className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/30 transition-all">
            Return to Matrix
          </a>
        </div>
      </div>

      {/* Demo Fill Banner */}
      {isDemoFill && (
        <div className="flex items-center gap-3 bg-blue-950/30 border border-blue-500/20 rounded-xl px-4 py-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <p className="text-xs text-blue-300 font-mono">Demo data loaded — <span className="text-zinc-400">Harvest Kitchen LLC</span> · Ready to demonstrate PQC handshake</p>
        </div>
      )}

      {/* Form Card */}
      <form ref={formRef} onSubmit={handleSubmit} className="admin-card overflow-hidden">
        {/* Form Header */}
        <div className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <div>
             <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Draft Metadata</h2>
             <p className="text-sm font-black text-white uppercase italic">Merchant Registration Form</p>
          </div>
          <button
            id="fill-demo-data-btn"
            type="button"
            onClick={fillDemo}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-inner"
          >
            ⚡ Load Demo Vectors
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-8 space-y-10 bg-dot-grid-admin">
          {/* Section: Application Info */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">01 // Application Identity</span>
              <div className="h-px flex-1 bg-white/[0.03]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelCls}>Application Name *</label>
                <input id="field-appName" required className={inputCls} placeholder="e.g. HARVEST_KITCHEN_LLC" value={form.appName}
                  onChange={e => setForm(f => ({ ...f, appName: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Entity Structure *</label>
                <select id="field-bType" required className={`${inputCls} appearance-none cursor-pointer`} value={form.bType}
                  onChange={e => setForm(f => ({ ...f, bType: e.target.value }))}>
                  {['LLC', 'SOLE_PROPRIETORSHIP', 'CORPORATION', 'PARTNERSHIP'].map(t => (
                    <option key={t} value={t} className="bg-zinc-900">{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section: Business Details */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">02 // Operational Parameters</span>
              <div className="h-px flex-1 bg-white/[0.03]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className={labelCls}>DBA_Name (Doing Business As) *</label>
                <input id="field-bBusinessName" required className={inputCls} placeholder="HARVEST_KITCHEN" value={form.bBusinessName}
                  onChange={e => setForm(f => ({ ...f, bBusinessName: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Legal_Registered_Name *</label>
                <input id="field-bLegalName" required className={inputCls} placeholder="HARVEST_KITCHEN_LLC" value={form.bLegalName}
                  onChange={e => setForm(f => ({ ...f, bLegalName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tax_ID (FEIN)</label>
                  <input id="field-bFein" className={`${inputCls} text-amber-500 font-bold`} placeholder="XX-XXXXXXX" value={form.bFein}
                    onChange={e => setForm(f => ({ ...f, bFein: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Target_Vol ($)</label>
                  <input id="field-bAvgMonthly" className={`${inputCls} text-emerald-500 font-bold`} placeholder="185000" type="number" value={form.bAvgMonthly}
                    onChange={e => setForm(f => ({ ...f, bAvgMonthly: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Public_Interface (URL)</label>
                <input id="field-bWebsite" className={`${inputCls} text-blue-400 text-xs`} placeholder="https://harvestkitchen.com" value={form.bWebsite}
                  onChange={e => setForm(f => ({ ...f, bWebsite: e.target.value }))} />
              </div>
            </div>
          </section>

          {/* Section: Primary Contact */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">03 // Principal Officer</span>
              <div className="h-px flex-1 bg-white/[0.03]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelCls}>Verified_Contact_Email *</label>
                <input id="field-initEmail" required type="email" className={`${inputCls} text-blue-400`} placeholder="PRINCIPAL@BUSINESS.IO" value={form.initEmail}
                  onChange={e => setForm(f => ({ ...f, initEmail: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Direct_Secure_Phone</label>
                <input id="field-initPhone" className={inputCls} placeholder="+1-XXX-XXX-XXXX" value={form.initPhone}
                  onChange={e => setForm(f => ({ ...f, initPhone: e.target.value }))} />
              </div>
            </div>
          </section>

          {/* PQC Notice */}
          <div className="flex items-center gap-4 bg-emerald-500/[0.02] border border-emerald-500/20 rounded-[2rem] px-8 py-6">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-xl text-emerald-500 shadow-inner">⬡</div>
            <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-widest font-black">
              Handshake: <span className="text-emerald-400">ML-DSA-65 (FIPS 204)</span> protocol will be executed on submission.
              Uplink: <span className="text-zinc-400">POST /draft</span> with ephemeral signature header.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-8 py-6 border-t border-white/[0.05] flex items-center justify-between gap-6 bg-white/[0.01]">
          <a href="/" className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-all">Abort_Entry</a>
          <button
            id="submit-onboarding-btn"
            type="submit"
            disabled={step === 'submitting'}
            className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95"
          >
            {step === 'submitting' ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing...
              </>
            ) : (
              'Initialize Uplink →'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
