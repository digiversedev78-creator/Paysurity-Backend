'use client';

import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

const STEPS = ['Merchant Application', 'Principal', 'Business', 'Documents', 'Confirm'];

// ─── Shared CSS classes injected via <style> ───────────────────────────────
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { background: #020409; }
  .ps-input {
    width: 100%; padding: 13px 16px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: #f1f5f9; font-size: 0.9rem; outline: none;
    font-family: 'Inter', system-ui, sans-serif;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .ps-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  .ps-input::placeholder { color: #334155; }
  .ps-label {
    display: block; font-size: 0.7rem; font-weight: 700;
    color: #64748b; margin-bottom: 6px;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .ps-btn-primary {
    padding: 13px 28px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: #fff; font-weight: 700; font-size: 0.9rem; cursor: pointer;
    font-family: 'Inter', system-ui, sans-serif;
    box-shadow: 0 4px 14px rgba(59,130,246,0.35);
    transition: all 0.2s;
  }
  .ps-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(59,130,246,0.45); }
  .ps-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .ps-btn-ghost {
    padding: 13px 28px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: #94a3b8; font-weight: 600; font-size: 0.9rem; cursor: pointer;
    font-family: 'Inter', system-ui, sans-serif; transition: all 0.2s;
  }
  .ps-btn-ghost:hover { background: rgba(255,255,255,0.07); color: #e2e8f0; }
  .ps-section {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 22px 24px;
    background: rgba(15,23,42,0.5); margin-bottom: 16px;
  }
  .ps-section-title {
    font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
    text-transform: uppercase; color: #3b82f6;
    margin-bottom: 18px; display: flex; align-items: center; gap: 10px;
  }
  .ps-section-title::before, .ps-section-title::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(to right, rgba(59,130,246,0.3), transparent);
  }
  .ps-section-title::after {
    background: linear-gradient(to left, rgba(59,130,246,0.3), transparent);
  }
  .ps-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ps-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  @media (max-width: 600px) {
    .ps-grid-2 { grid-template-columns: 1fr; }
    .ps-grid-3 { grid-template-columns: 1fr; }
  }
  .ps-upload-box {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px; border-radius: 12px; cursor: pointer;
    border: 2px dashed rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.01);
    transition: all 0.2s; width: 100%;
  }
  .ps-upload-box:hover { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.04); }
  .ps-upload-box.uploaded { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); border-style: solid; }
  .animate-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .ps-step-active { background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; }
  .ps-step-done { background: rgba(59,130,246,0.15); color: #60a5fa; }
  .ps-step-pending { background: rgba(255,255,255,0.05); color: #475569; }
`;

// ─── Sub-components ────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="ps-label">{label}</label>
      {children}
    </div>
  );
}

function UploadCard({ label, hint, required, capture, onFile, file }: {
  label: string; hint?: string; required?: boolean;
  capture?: 'environment' | 'user'; onFile: (f: File) => void; file: File | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const acceptStr = capture ? "image/*" : "image/*,.pdf";
  return (
    <div className={`ps-upload-box ${file ? 'uploaded' : ''}`} onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept={acceptStr} capture={capture}
        style={{ display: 'none' }} onChange={e => { if(e.target.files?.[0]) onFile(e.target.files[0]); }} />
      <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{file ? '✅' : '📎'}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 3 }}>
          {label} {required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
        </div>
        {hint && <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, marginBottom: 4 }}>{hint}</div>}
        {file
          ? <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>✓ {file.name}</div>
          : <div style={{ fontSize: '0.72rem', color: '#3b82f6', opacity: 0.7 }}>Click to open camera / upload</div>
        }
      </div>
    </div>
  );
}

const DOC_TYPES = [
  'IRS FEIN Letter', 'Articles of Incorporation / Organization',
  'City / Municipality Business License', 'State Business License',
  'CC Processing Statement — Month 1', 'CC Processing Statement — Month 2', 'CC Processing Statement — Month 3',
  'Business Bank Statement — Month 1', 'Business Bank Statement — Month 2', 'Business Bank Statement — Month 3',
  'Personal Bank Statement — Month 1 (new biz)', 'Personal Bank Statement — Month 2 (new biz)', 'Personal Bank Statement — Month 3 (new biz)',
  'Other Document',
];

interface BizDoc { type: string; file: File; }

// Camera-capture only button for DocUploader
function CameraUploadBtn({ onFile }: { onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) { onFile(e.target.files[0]); if (ref.current) ref.current.value = ''; } }} />
      <button type="button" onClick={() => ref.current?.click()} style={{ flex: 1, padding: '11px 10px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.06)', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        📷 Take Photo
      </button>
    </>
  );
}

function DocUploader({ docs, onChange }: { docs: BizDoc[]; onChange: (d: BizDoc[]) => void }) {
  const [dt, setDt] = useState(DOC_TYPES[0]);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      {docs.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 8, fontSize: '0.8rem' }}>
          <span style={{ color: '#10b981' }}>✓</span>
          <span style={{ color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{d.type}</span>
          <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.file.name}</span>
          <button type="button" onClick={() => onChange(docs.filter((_, j) => j !== i))} style={{ marginLeft: 'auto', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontSize: '0.75rem' }}>Remove</button>
        </div>
      ))}
      <div style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
        <label className="ps-label" style={{ marginBottom: 8 }}>Select Document Type <span style={{ color: '#f87171' }}>*</span></label>
        <select className="ps-input" style={{ background: '#0f172a', marginBottom: 12 }} value={dt} onChange={e => setDt(e.target.value)}>
          {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        {/* File upload input */}
        <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) { onChange([...docs, { type: dt, file: e.target.files[0] }]); if (ref.current) ref.current.value = ''; } }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => ref.current?.click()} style={{ flex: 1, padding: '11px 10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.05)', color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            📤 Upload
          </button>
          <CameraUploadBtn onFile={f => { onChange([...docs, { type: dt, file: f }]); }} />
        </div>
      </div>
    </div>
  );
}

function VoidedCheckOCR({ onExtracted }: { onExtracted: (r: string, a: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [ext, setExt] = useState({ routing: '', account: '' });
  const [confirmed, setConfirmed] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handle = (f: File) => {
    setFile(f); setConfirmed(false); setScanning(true);
    setTimeout(() => {
      const r = '021000021';
      const a = '000' + Math.floor(Math.random() * 9000000 + 1000000);
      setExt({ routing: r, account: a }); setScanning(false);
    }, 2000);
  };

  return (
    <div>
      <div style={{ border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0', marginBottom: 3 }}>
          Voided Check <span style={{ color: '#f87171' }}>*</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 12 }}>Upload or photograph your voided check</div>
        
        {file ? (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✅ {file.name}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handle(e.target.files[0]); }} />
            <button type="button" onClick={() => ref.current?.click()} style={{ flex: 1, padding: '11px 10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.05)', color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
              📤 Upload
            </button>
            <CameraUploadBtn onFile={handle} />
          </div>
        )}
      </div>

      {scanning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginTop: 10, fontSize: '0.8rem', color: '#fbbf24' }}>
          <span className="animate-spin" style={{ display: 'inline-block' }}>⚙️</span>
          Scanning check with OCR — extracting routing &amp; account numbers…
        </div>
      )}

      {!scanning && file && !confirmed && ext.routing && (
        <div style={{ marginTop: 12, padding: 16, borderRadius: 12, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 12 }}>OCR Result — Please Verify Before Confirming</div>
          <div className="ps-grid-2">
            <Field label="Routing Number *">
              <input className="ps-input" value={ext.routing} onChange={e => setExt(v => ({ ...v, routing: e.target.value }))} />
            </Field>
            <Field label="Account Number *">
              <input className="ps-input" value={ext.account} onChange={e => setExt(v => ({ ...v, account: e.target.value }))} />
            </Field>
          </div>
          <button type="button" onClick={() => { onExtracted(ext.routing, ext.account); setConfirmed(true); }}
            style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            ✓ Confirm — Use These Banking Details
          </button>
        </div>
      )}
      {confirmed && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8rem', color: '#34d399' }}>
          ✅ Banking details confirmed and populated in the fields below
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function SignupWizard() {
  const router = useRouter();
  const { setToken } = useAuth();

  const [step, setStep] = useState(0); // 0..4
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  // Step 0
  const [appName, setAppName] = useState('');
  const [template, setTemplate] = useState('PA Smart Terminal w/Edge 3.8461%');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 1 — Principal
  const [pFirst, setPFirst] = useState('');
  const [pLast, setPLast] = useState('');
  const [pTitle, setPTitle] = useState('Owner');
  const [pEquity, setPEquity] = useState('');
  const [pAddr, setPAddr] = useState('');
  const [pSuite, setPSuite] = useState('');
  const [pZip, setPZip] = useState('');
  const [pCity, setPCity] = useState('');
  const [pState, setPState] = useState('');
  const [pSsn, setPSsn] = useState('');
  const [pDob, setPDob] = useState('');
  const [pDlNum, setPDlNum] = useState('');
  const [pDlState, setPDlState] = useState('');
  const [dlFront, setDlFront] = useState<File | null>(null);
  const [dlBack, setDlBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  // Additional Owners
  const [additionalOwners, setAdditionalOwners] = useState<any[]>([]);

  const addOwner = () => {
    setAdditionalOwners([...additionalOwners, {
      firstName: '', lastName: '', title: 'Partner', equity: '', email: '', phone: '', dob: '', ssn: ''
    }]);
  };

  const removeOwner = (index: number) => {
    setAdditionalOwners(additionalOwners.filter((_, i) => i !== index));
  };

  const updateOwner = (index: number, field: string, val: string) => {
    const next = [...additionalOwners];
    next[index][field] = val;
    setAdditionalOwners(next);
  };

  // Step 2 — Business
  const [bDba, setBDba] = useState('');
  const [bLegal, setBLegal] = useState('');
  const [bFein, setBFein] = useState('');
  const [bType, setBType] = useState('');
  const [bMcc, setBMcc] = useState('');
  const [bProducts, setBProducts] = useState('');
  const [bAvgTicket, setBAvgTicket] = useState('');
  const [bMonthly, setBMonthly] = useState('');
  const [bHigh, setBHigh] = useState('');
  const [bAmex, setBAmex] = useState('');
  const [bCbd, setBCbd] = useState(false);
  const [bEbt, setBEbt] = useState(false);
  const [bWebsite, setBWebsite] = useState('');
  const [bYears, setBYears] = useState('');
  const [bAddr, setBAddr] = useState('');
  const [bCity, setBCity] = useState('');
  const [bState, setBState] = useState('');
  const [bZip, setBZip] = useState('');
  // Banking
  const [bRouting, setBRouting] = useState('');
  const [bAccount, setBAccount] = useState('');
  // Docs
  const [bizDocs, setBizDocs] = useState<BizDoc[]>([]);

  const saveDraft = async (next: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/merchant-onboarding/draft`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId, appName, template, initEmail: email, initPhone: phone,
          pFirstName: pFirst, pLastName: pLast, pTitle, pEquity, pSsn, pDob, pDlNumber: pDlNum, pDlState,
          bBusinessName: bDba, bLegalName: bLegal, bFein, bType, bMcc, bAvgTicket, bAvgMonthly: bMonthly, bHighTicket: bHigh, bAmexMonthly: bAmex, bCbd, bWebsite, bRouting, bAccount,
          additionalOwners
        }),
      });
      const d = await res.json();
      if (d.id) { setAppId(d.id); localStorage.setItem('merchantDraftId', d.id); }
    } catch { /* continue */ } finally { setLoading(false); }
    setStep(next);
  };

  const verify = () => { setLoading(true); setTimeout(() => { setLoading(false); setToken('mock-verified-jwt-token'); router.push('/dashboard'); }, 1500); };

  // ── Shared layout styles ──
  const pageStyle: CSSProperties = {
    minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif",
    background: 'radial-gradient(ellipse at 20% 10%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(99,102,241,0.06) 0%, transparent 50%), #020409',
    color: '#e2e8f0', display: 'flex', flexDirection: 'column',
  };

  const headerStyle: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(2,4,9,0.8)', backdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
  };

  const progressBarStyle: CSSProperties = {
    padding: '20px 32px 0', background: 'rgba(2,4,9,0.6)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  };

  const bodyStyle: CSSProperties = {
    flex: 1, overflowY: 'auto', padding: '32px 24px 60px',
    maxWidth: 700, margin: '0 auto', width: '100%',
  };

  return (
    <div style={pageStyle}>
      {/* suppressHydrationWarning: Next.js SSR entity-encodes CSS quotes (&amp;#x27;) but client injects raw quotes — this mismatch is harmless in style tags */}
      <style suppressHydrationWarning>{PAGE_STYLES}</style>

      {/* ── Sticky Top Header ── */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 0 24px rgba(59,130,246,0.35)' }}>
            💳
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Pay<span style={{ color: '#60a5fa' }}>Surity</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Merchant Application
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
          Step {step + 1} of {STEPS.length} &mdash; {STEPS[step]}
        </div>
      </header>

      {/* ── Step Progress Bar ── */}
      <div style={progressBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 700, margin: '0 auto', paddingBottom: 20 }}>
          {STEPS.map((s, i) => {
            const state = i === step ? 'active' : i < step ? 'done' : 'pending';
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div onClick={() => i <= step && setStep(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: i <= step ? 'pointer' : 'default', flexShrink: 0 }}>
                  <div className={`ps-step-${state}`} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.3s' }}>
                    {state === 'done' ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: state === 'active' ? '#93c5fd' : state === 'done' ? '#60a5fa' : '#334155', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                    {s}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 22, background: i < step ? 'linear-gradient(to right, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.06)', borderRadius: 2, transition: 'background 0.4s' }} />
                )}
              </div>
            );
          })}
        </div>
        {/* Mini progress fill */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: 'linear-gradient(to right, #3b82f6, #6366f1)', width: `${(step / (STEPS.length - 1)) * 100}%`, transition: 'width 0.4s ease', borderRadius: 2 }} />
        </div>
      </div>

      {/* ── Form Body ── */}
      <main style={bodyStyle}>

        {/* ════ STEP 0: Application ════ */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>
                Apply for Your Free Merchant Account
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Complete the application to start accepting payments with PaySurity. No credit card required.
              </p>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Application Details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Business / Application Name *">
                  <input className="ps-input" value={appName} onChange={e => setAppName(e.target.value)} placeholder="e.g. House of Biryani Chicago" required />
                </Field>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Contact Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Principal Email Address *">
                  <input type="email" className="ps-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@yourbusiness.com" required />
                </Field>
                <Field label="Principal Cell / Mobile Number *">
                  <input type="tel" className="ps-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(312) 555-0100" required />
                </Field>
              </div>
            </div>

            <input type="hidden" value="Weboway Inc PPT (51558)" />

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
              <button className="ps-btn-ghost">Cancel</button>
              <button className="ps-btn-primary" onClick={() => saveDraft(1)}>Save &amp; Continue →</button>
            </div>
          </div>
        )}

        {/* ════ STEP 1: Principal ════ */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Principal Information</h2>
              <p style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span>ⓘ</span> Add all individuals who own 25% or more of the business or have a controlling interest.
              </p>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Owner / Personal Guarantor</div>
              <div className="ps-grid-2" style={{ marginBottom: 14 }}>
                <Field label="First Name *"><input className="ps-input" value={pFirst} onChange={e => setPFirst(e.target.value)} required /></Field>
                <Field label="Last Name *"><input className="ps-input" value={pLast} onChange={e => setPLast(e.target.value)} required /></Field>
                <Field label="Title / Role *">
                  <select className="ps-input" style={{ background: '#0a1020' }} value={pTitle} onChange={e => setPTitle(e.target.value)} required>
                    <option>Owner</option><option>CEO</option><option>Partner</option><option>President</option>
                  </select>
                </Field>
                <Field label="Equity Ownership % *"><input className="ps-input" value={pEquity} onChange={e => setPEquity(e.target.value)} placeholder="100" required /></Field>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Home / Residential Address</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Street Address *"><input className="ps-input" value={pAddr} onChange={e => setPAddr(e.target.value)} required /></Field>
                <div className="ps-grid-3">
                  <Field label="City *"><input className="ps-input" value={pCity} onChange={e => setPCity(e.target.value)} required /></Field>
                  <Field label="State *">
                    <select className="ps-input" style={{ background: '#0a1020' }} value={pState} onChange={e => setPState(e.target.value)} required>
                      <option value="">Select</option>{US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Zip Code *"><input className="ps-input" value={pZip} onChange={e => setPZip(e.target.value)} required /></Field>
                </div>
                <Field label="Suite / Apt (optional)"><input className="ps-input" autoComplete="off" value={pSuite} onChange={e => setPSuite(e.target.value)} /></Field>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Identity &amp; Security</div>
              <div className="ps-grid-2" style={{ marginBottom: 14 }}>
                <Field label="Date of Birth *"><input type="date" className="ps-input" value={pDob} onChange={e => setPDob(e.target.value)} required /></Field>
                <Field label="SSN / ITIN *"><input type="password" className="ps-input" value={pSsn} onChange={e => setPSsn(e.target.value)} placeholder="e.g. 999-99-9999" autoComplete="new-password" required /></Field>
                <Field label="Email *"><input className="ps-input" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
                <Field label="Mobile *"><input className="ps-input" value={phone} onChange={e => setPhone(e.target.value)} required /></Field>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Driver's License / State ID</div>
              <div className="ps-grid-2" style={{ marginBottom: 16 }}>
                <Field label="License Number *"><input className="ps-input" value={pDlNum} onChange={e => setPDlNum(e.target.value)} required /></Field>
                <Field label="Issuing State *">
                  <select className="ps-input" style={{ background: '#0a1020' }} value={pDlState} onChange={e => setPDlState(e.target.value)} required>
                    <option value="">Select</option>{US_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className="ps-grid-2">
                <UploadCard label="ID / License — Front" required capture="environment" hint="Clear, well-lit photo. On mobile, tap to use camera." file={dlFront} onFile={setDlFront} />
                <UploadCard label="ID / License — Back" required capture="environment" hint="Include barcode / magnetic strip side." file={dlBack} onFile={setDlBack} />
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Owner Selfie Photo</div>
              <UploadCard label="Clear Selfie — Face Photo" required capture="user" hint="Used for identity verification. Must be a clear, well-lit photo of your face only." file={selfie} onFile={setSelfie} />
            </div>

            {additionalOwners.map((owner, idx) => (
              <div key={idx} className="ps-section" style={{ borderLeft: '3px solid #3b82f6', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 18, right: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button type="button" onClick={() => removeOwner(idx)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}>Remove Owner</button>
                </div>
                <div className="ps-section-title">Co-Owner / Principal #{idx + 2}</div>
                <div className="ps-grid-2" style={{ marginBottom: 14 }}>
                  <Field label="First Name *"><input className="ps-input" value={owner.firstName} onChange={e => updateOwner(idx, 'firstName', e.target.value)} required /></Field>
                  <Field label="Last Name *"><input className="ps-input" value={owner.lastName} onChange={e => updateOwner(idx, 'lastName', e.target.value)} required /></Field>
                  <Field label="Title / Role *">
                    <select className="ps-input" style={{ background: '#0a1020' }} value={owner.title} onChange={e => updateOwner(idx, 'title', e.target.value)} required>
                      <option>Partner</option><option>CEO</option><option>Owner</option><option>President</option>
                    </select>
                  </Field>
                  <Field label="Equity Ownership % *"><input className="ps-input" value={owner.equity} onChange={e => updateOwner(idx, 'equity', e.target.value)} placeholder="0" required /></Field>
                </div>
                <div className="ps-grid-2" style={{ marginBottom: 14 }}>
                   <Field label="Date of Birth *"><input type="date" className="ps-input" value={owner.dob} onChange={e => updateOwner(idx, 'dob', e.target.value)} required /></Field>
                   <Field label="SSN / ITIN *"><input type="password" className="ps-input" value={owner.ssn} onChange={e => updateOwner(idx, 'ssn', e.target.value)} placeholder="***-**-****" autoComplete="new-password" required /></Field>
                   <Field label="Email *"><input className="ps-input" value={owner.email} onChange={e => updateOwner(idx, 'email', e.target.value)} required /></Field>
                   <Field label="Mobile *"><input className="ps-input" value={owner.phone} onChange={e => updateOwner(idx, 'phone', e.target.value)} required /></Field>
                </div>
              </div>
            ))}

            <button type="button" onClick={addOwner} className="ps-btn-ghost" style={{ marginBottom: 20, fontSize: '0.8rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.1rem', color: '#60a5fa' }}>+</span> Add Another Owner / Principal (25%+)
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button className="ps-btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="ps-btn-primary" onClick={() => saveDraft(2)}>Save &amp; Continue →</button>
            </div>
          </div>
        )}

        {/* ════ STEP 2: Business ════ */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Business Information</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Tell us about your business to get the right merchant account configuration.</p>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Business Identity</div>
              <div className="ps-grid-2" style={{ marginBottom: 14 }}>
                <Field label="Business / DBA Name *"><input className="ps-input" value={bDba} onChange={e => setBDba(e.target.value)} required /></Field>
                <Field label="Legal / Corporate Name *"><input className="ps-input" value={bLegal} onChange={e => setBLegal(e.target.value)} required /></Field>
                <Field label="Federal Tax ID (EIN / FEIN) *"><input className="ps-input" value={bFein} onChange={e => setBFein(e.target.value)} placeholder="XX-XXXXXXX" required /></Field>
                <Field label="Business Entity Type *">
                  <select className="ps-input" style={{ background: '#0a1020' }} value={bType} onChange={e => setBType(e.target.value)} required>
                    <option value="">Choose one ▾</option>
                    <option value="LLC">LLC</option>
                    <option value="C-Corp">Corporation (C-Corp)</option>
                    <option value="S-Corp">Corporation (S-Corp)</option>
                    <option value="Sole Prop">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Non-Profit">Non-Profit (501c3)</option>
                  </select>
                </Field>
                <Field label="Business Website"><input className="ps-input" value={bWebsite} onChange={e => setBWebsite(e.target.value)} placeholder="https://" /></Field>
                <Field label="Years in Business *"><input type="number" className="ps-input" value={bYears} onChange={e => setBYears(e.target.value)} placeholder="" required /></Field>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Processing Volume &amp; Products</div>
              <div className="ps-grid-2" style={{ marginBottom: 14 }}>
                <Field label="MCC / SIC Code"><input className="ps-input" value={bMcc} onChange={e => setBMcc(e.target.value)} placeholder="" /></Field>
                <Field label="Products / Services Sold *"><input className="ps-input" value={bProducts} onChange={e => setBProducts(e.target.value)} placeholder="" required /></Field>
                <div>
                  <label className="ps-label">Average Ticket Amount ($) *</label>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 5 }}>Typical dollar amount of a single transaction</div>
                  <input className="ps-input" value={bAvgTicket} onChange={e => setBAvgTicket(e.target.value)} placeholder="" required />
                </div>
                <div>
                  <label className="ps-label">Average Monthly Volume ($) *</label>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 5 }}>Total card sales across all transactions in a typical month</div>
                  <input className="ps-input" value={bMonthly} onChange={e => setBMonthly(e.target.value)} placeholder="" required />
                </div>
                <div>
                  <label className="ps-label">Highest Single Ticket ($) *</label>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 5 }}>The largest individual transaction you have ever processed</div>
                  <input className="ps-input" value={bHigh} onChange={e => setBHigh(e.target.value)} placeholder="" required />
                </div>
                <div>
                  <label className="ps-label">Amex Monthly Volume ($) *</label>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginBottom: 5 }}>American Express cards only — enter 0 if you don&apos;t accept Amex</div>
                  <input className="ps-input" value={bAmex} onChange={e => setBAmex(e.target.value)} placeholder="" required />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: '#94a3b8' }}>
                  <input type="checkbox" checked={bCbd} onChange={e => setBCbd(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }} />
                  Sells CBD Products
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', color: '#94a3b8' }}>
                  <input type="checkbox" checked={bEbt} onChange={e => setBEbt(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }} />
                  Accepts EBT / SNAP Benefits
                </label>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Business Address</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Street Address *"><input className="ps-input" value={bAddr} onChange={e => setBAddr(e.target.value)} required /></Field>
                <div className="ps-grid-3">
                  <Field label="City *"><input className="ps-input" value={bCity} onChange={e => setBCity(e.target.value)} required /></Field>
                  <Field label="State *">
                    <select className="ps-input" style={{ background: '#0a1020' }} value={bState} onChange={e => setBState(e.target.value)} required>
                      <option value="">Select</option>{US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Zip *"><input className="ps-input" value={bZip} onChange={e => setBZip(e.target.value)} required /></Field>
                </div>
              </div>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Business Documents</div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14, lineHeight: 1.6 }}>
                Upload each document separately and select its type. On mobile, tap to use your camera to scan. Accepts PDF, JPG, PNG (max 10MB).
                <br />
                <strong style={{ color: '#94a3b8' }}>If switching processors:</strong> upload last 3 months CC processing statements. &nbsp; <strong style={{ color: '#94a3b8' }}>Brand new business:</strong> upload last 3 months personal bank statements.
              </p>
              <DocUploader docs={bizDocs} onChange={setBizDocs} />
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Banking Information</div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
                Upload a voided check — our OCR system will automatically read and pre-fill your routing and account numbers. You will confirm before we save.
              </p>
              <div style={{ marginBottom: 16 }}>
                <VoidedCheckOCR onExtracted={(r, a) => { setBRouting(r); setBAccount(a); }} />
              </div>
              <div className="ps-grid-2">
                <Field label="ACH / Routing Number *"><input className="ps-input" value={bRouting} onChange={e => setBRouting(e.target.value)} placeholder="" required /></Field>
                <Field label="Bank Account Number *"><input className="ps-input" value={bAccount} onChange={e => setBAccount(e.target.value)} placeholder="" required /></Field>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
              <button className="ps-btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="ps-btn-primary" onClick={() => saveDraft(3)}>Save &amp; Continue →</button>
            </div>
          </div>
        )}

        {/* ════ STEP 3: Review ════ */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Review &amp; Submit</h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review the documents uploaded. Go back to any step to make changes before submitting.</p>
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Principal Documents</div>
              {[
                { label: 'Owner Selfie', file: selfie },
                { label: "ID / License — Front", file: dlFront },
                { label: "ID / License — Back", file: dlBack },
              ].map(({ label, file }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: file ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${file ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, marginBottom: 8, fontSize: '0.83rem' }}>
                  <span>{file ? '✅' : '⚠️'}</span>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: file ? '#34d399' : '#f87171', marginLeft: 'auto' }}>{file ? file.name : 'Not uploaded'}</span>
                </div>
              ))}
            </div>

            <div className="ps-section">
              <div className="ps-section-title">Business Documents ({bizDocs.length} uploaded)</div>
              {bizDocs.length === 0
                ? <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>⚠ No business documents uploaded. Go back to add them.</p>
                : bizDocs.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 8, fontSize: '0.8rem' }}>
                    <span style={{ color: '#10b981' }}>✓</span>
                    <span style={{ color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{d.type}</span>
                    <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.file.name}</span>
                  </div>
                ))
              }
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 }}>
              <button className="ps-btn-ghost" onClick={() => setStep(2)}>← Back to Business</button>
              <button className="ps-btn-primary" disabled={loading} onClick={() => saveDraft(4)}>
                {loading ? 'Submitting…' : 'Submit Application ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 4: Confirmation ════ */}
        {step === 4 && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>✉️</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981', marginBottom: 12, letterSpacing: '-0.02em' }}>Application Submitted!</h2>
            <p style={{ color: '#64748b', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7, fontSize: '0.9rem' }}>
              Your Merchant Application and relevant documents have been submitted to the underwriting team.
              <br /><br />
              A verification link has been sent to <strong style={{ color: '#e2e8f0' }}>{email || 'your email address'}</strong>. Click it to activate your merchant dashboard.
            </p>

            <div style={{ padding: 24, background: 'rgba(16,185,129,0.06)', borderRadius: 16, border: '1px solid rgba(16,185,129,0.15)', display: 'inline-block' }}>
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 14 }}>DEV SIMULATION — Click to bypass email verification in local dev</p>
              <button onClick={verify} style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                {loading ? 'Verifying…' : '🔗 Verify Email & Enter My Dashboard'}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
