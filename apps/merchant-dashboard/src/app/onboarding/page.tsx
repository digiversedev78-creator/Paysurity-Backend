'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─── Exact DTO shapes from merchant-onboarding.controller.ts ───────────────
interface SubmitKycDto {
  legalBusinessName: string;
  registrationNumber: string;
  taxId: string;
  legalStructure: 'SOLE_PROPRIETORSHIP' | 'LLC' | 'CORPORATION' | 'PARTNERSHIP';
  primaryContactName: string;
  primaryContactEmail: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
  documentUrls?: string[];
}

interface KycApiResponse {
  message: string;
  onboardingApplicationId: string;
  status: string;
}

interface ChecklistStep {
  stepId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_REVIEW' | 'ACTION_REQUIRED';
}

// ─── Form data tracks 5 wizard steps ───────────────────────────────────────
interface FormData {
  // Step 1 — Company Info
  legalBusinessName: string;
  legalStructure: 'SOLE_PROPRIETORSHIP' | 'LLC' | 'CORPORATION' | 'PARTNERSHIP' | '';
  registrationNumber: string;
  taxId: string;
  // Step 2 — Primary Contact
  primaryContactName: string;
  primaryContactEmail: string;
  // Step 3 — Business Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
  // Step 4 — Documents
  documentUrls: string[];
}

const INITIAL_FORM: FormData = {
  legalBusinessName: '',
  legalStructure: '',
  registrationNumber: '',
  taxId: '',
  primaryContactName: '',
  primaryContactEmail: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  countryCode: 'US',
  documentUrls: [],
};

const STEPS = [
  { id: 1, label: 'Company Info',    icon: '🏢' },
  { id: 2, label: 'Primary Contact', icon: '👤' },
  { id: 3, label: 'Address',         icon: '📍' },
  { id: 4, label: 'Documents',       icon: '📄' },
  { id: 5, label: 'Review',          icon: '✅' },
];

const TOTAL_STEPS = STEPS.length;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Toast ──────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType }

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-slide-in border ${
            t.type === 'success'
              ? 'bg-emerald-900/80 border-emerald-500/40 text-emerald-100'
              : t.type === 'error'
              ? 'bg-red-900/80 border-red-500/40 text-red-100'
              : 'bg-blue-900/80 border-blue-500/40 text-blue-100'
          }`}
        >
          <span className="text-lg leading-none">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}
          </span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100 leading-none">&times;</button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = React.useRef(0);

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, add, remove };
}

// ─── FieldGroup Component ───────────────────────────────────────────────────
function FieldGroup({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = `
  w-full rounded-lg px-3.5 py-2.5 text-sm
  bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500
  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
  transition-all duration-150
`;

const selectCls = inputCls + ' cursor-pointer appearance-none';

// ─── Step 1: Company Info ────────────────────────────────────────────────────
function StepCompanyInfo({ data, onChange, errors }: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <FieldGroup label="Legal Business Name" required error={errors.legalBusinessName}>
        <input id="legalBusinessName" type="text" value={data.legalBusinessName}
          onChange={(e) => onChange('legalBusinessName', e.target.value)}
          placeholder="Acme Corp LLC" className={inputCls} />
      </FieldGroup>

      <FieldGroup label="Legal Structure" required error={errors.legalStructure}>
        <select id="legalStructure" value={data.legalStructure}
          onChange={(e) => onChange('legalStructure', e.target.value)}
          className={selectCls}>
          <option value="">Select structure…</option>
          <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
          <option value="LLC">LLC</option>
          <option value="CORPORATION">Corporation</option>
          <option value="PARTNERSHIP">Partnership</option>
        </select>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="EIN / Registration Number" required error={errors.registrationNumber}>
          <input id="registrationNumber" type="text" value={data.registrationNumber}
            onChange={(e) => onChange('registrationNumber', e.target.value)}
            placeholder="12-3456789" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="Tax ID (TIN)" required error={errors.taxId}>
          <input id="taxId" type="text" value={data.taxId}
            onChange={(e) => onChange('taxId', e.target.value)}
            placeholder="987-65-4321" className={inputCls} />
        </FieldGroup>
      </div>

      <div className="rounded-xl bg-blue-950/40 border border-blue-500/20 px-4 py-3 text-xs text-blue-300 leading-relaxed">
        🔒 Your business information is encrypted at rest and used solely for KYB verification purposes.
        PaySurity is PCI-DSS SAQ-A compliant.
      </div>
    </div>
  );
}

// ─── Step 2: Primary Contact ─────────────────────────────────────────────────
function StepPrimaryContact({ data, onChange, errors }: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <FieldGroup label="Full Name" required error={errors.primaryContactName}>
        <input id="primaryContactName" type="text" value={data.primaryContactName}
          onChange={(e) => onChange('primaryContactName', e.target.value)}
          placeholder="Jane Smith" className={inputCls} />
      </FieldGroup>

      <FieldGroup label="Business Email" required error={errors.primaryContactEmail}>
        <input id="primaryContactEmail" type="email" value={data.primaryContactEmail}
          onChange={(e) => onChange('primaryContactEmail', e.target.value)}
          placeholder="jane@acmecorp.com" className={inputCls} />
      </FieldGroup>

      <p className="text-xs text-zinc-500">
        This contact will receive KYB decision notifications and serve as the primary account administrator.
      </p>
    </div>
  );
}

// ─── Step 3: Business Address ────────────────────────────────────────────────
function StepAddress({ data, onChange, errors }: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <FieldGroup label="Address Line 1" required error={errors.addressLine1}>
        <input id="addressLine1" type="text" value={data.addressLine1}
          onChange={(e) => onChange('addressLine1', e.target.value)}
          placeholder="123 Main Street" className={inputCls} />
      </FieldGroup>

      <FieldGroup label="Address Line 2 (Suite, Floor, etc.)">
        <input id="addressLine2" type="text" value={data.addressLine2}
          onChange={(e) => onChange('addressLine2', e.target.value)}
          placeholder="Suite 100" className={inputCls} />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="City" required error={errors.city}>
          <input id="city" type="text" value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="Los Angeles" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="State / Province" required error={errors.stateProvince}>
          <input id="stateProvince" type="text" value={data.stateProvince}
            onChange={(e) => onChange('stateProvince', e.target.value)}
            placeholder="CA" maxLength={2} className={inputCls} />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="ZIP / Postal Code" required error={errors.postalCode}>
          <input id="postalCode" type="text" value={data.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            placeholder="90210" className={inputCls} />
        </FieldGroup>
        <FieldGroup label="Country Code" required error={errors.countryCode}>
          <select id="countryCode" value={data.countryCode}
            onChange={(e) => onChange('countryCode', e.target.value)}
            className={selectCls}>
            <option value="US">🇺🇸 United States (US)</option>
            <option value="CA">🇨🇦 Canada (CA)</option>
            <option value="GB">🇬🇧 United Kingdom (GB)</option>
            <option value="AU">🇦🇺 Australia (AU)</option>
          </select>
        </FieldGroup>
      </div>
    </div>
  );
}

// ─── Step 4: Documents ───────────────────────────────────────────────────────
function StepDocuments({ data, onChange }: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
}) {
  const [docUrl, setDocUrl] = useState('');

  const addDoc = () => {
    if (!docUrl.trim()) return;
    const updated = [...data.documentUrls, docUrl.trim()];
    onChange('documentUrls', JSON.stringify(updated));
    setDocUrl('');
  };

  const removeDoc = (idx: number) => {
    const updated = data.documentUrls.filter((_, i) => i !== idx);
    onChange('documentUrls', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-amber-950/30 border border-amber-500/20 px-4 py-3 text-xs text-amber-300 leading-relaxed">
        📎 <strong>Acceptable documents:</strong> Business License, Articles of Incorporation, Government-issued Owner ID.
        Upload to your secure storage (e.g., GCS bucket) and paste the URL below.
      </div>

      <div className="flex gap-2">
        <input type="url" value={docUrl} onChange={(e) => setDocUrl(e.target.value)}
          placeholder="https://storage.paysurity.com/docs/..." className={inputCls + ' flex-1'} />
        <button type="button" onClick={addDoc}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap">
          + Add
        </button>
      </div>

      {data.documentUrls.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4 border border-dashed border-zinc-700 rounded-xl">
          No documents added yet. (Optional — can be submitted later)
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.documentUrls.map((url, i) => (
            <li key={i} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg px-3 py-2.5 text-xs text-zinc-300 border border-zinc-700">
              <span className="text-blue-400">📄</span>
              <span className="truncate flex-1">{url}</span>
              <button type="button" onClick={() => removeDoc(i)}
                className="text-zinc-500 hover:text-red-400 transition-colors font-bold text-sm">&times;</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Step 5: Review & Submit ─────────────────────────────────────────────────
function StepReview({ data }: { data: FormData }) {
  const legalStructureLabels: Record<string, string> = {
    SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
    LLC: 'LLC',
    CORPORATION: 'Corporation',
    PARTNERSHIP: 'Partnership',
  };

  const sections = [
    {
      title: '🏢 Company Info',
      rows: [
        ['Legal Name', data.legalBusinessName],
        ['Legal Structure', legalStructureLabels[data.legalStructure] || data.legalStructure],
        ['Registration Number', data.registrationNumber],
        ['Tax ID', data.taxId],
      ],
    },
    {
      title: '👤 Primary Contact',
      rows: [
        ['Full Name', data.primaryContactName],
        ['Email', data.primaryContactEmail],
      ],
    },
    {
      title: '📍 Business Address',
      rows: [
        ['Street', [data.addressLine1, data.addressLine2].filter(Boolean).join(', ')],
        ['City', data.city],
        ['State', data.stateProvince],
        ['ZIP', data.postalCode],
        ['Country', data.countryCode],
      ],
    },
    {
      title: '📄 Documents',
      rows: [['Attached URLs', data.documentUrls.length === 0 ? 'None (to be submitted later)' : `${data.documentUrls.length} document(s)`]],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-400">Please review your information before submitting for KYB verification.</p>
      {sections.map((section) => (
        <div key={section.title} className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-zinc-800/60 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            {section.title}
          </div>
          <div className="divide-y divide-zinc-800/60">
            {section.rows.map(([label, value]) => (
              <div key={label} className="flex px-4 py-2.5 gap-4">
                <span className="text-xs text-zinc-500 w-36 shrink-0">{label}</span>
                <span className="text-xs text-zinc-200 break-all">{value || <span className="text-zinc-600 italic">—</span>}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-300 leading-relaxed">
        ✅ By submitting, you confirm all information is accurate and authorize PaySurity to conduct a KYB review.
        Decisions are typically returned within 1–2 business days.
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ applicationId }: { applicationId: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-5xl animate-pulse-slow">
        ✅
      </div>
      <div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Application Submitted!</h2>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
          Your KYB application is now under review. Our compliance team will reach out within 1–2 business days.
        </p>
      </div>
      <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 px-4 py-3 text-left w-full">
        <p className="text-xs text-zinc-500 mb-0.5">Application Reference ID</p>
        <p className="font-mono text-sm text-blue-400 break-all">{applicationId}</p>
      </div>
      <a href="/dashboard"
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors text-center">
        Go to Dashboard →
      </a>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const errors: Partial<Record<keyof FormData, string>> = {};
  if (step === 1) {
    if (!data.legalBusinessName.trim()) errors.legalBusinessName = 'Legal business name is required';
    if (!data.legalStructure) errors.legalStructure = 'Please select a legal structure';
    if (!data.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required';
    if (!data.taxId.trim()) errors.taxId = 'Tax ID is required';
  }
  if (step === 2) {
    if (!data.primaryContactName.trim()) errors.primaryContactName = 'Contact name is required';
    if (!data.primaryContactEmail.trim()) errors.primaryContactEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.primaryContactEmail))
      errors.primaryContactEmail = 'Enter a valid email address';
  }
  if (step === 3) {
    if (!data.addressLine1.trim()) errors.addressLine1 = 'Street address is required';
    if (!data.city.trim()) errors.city = 'City is required';
    if (!data.stateProvince.trim()) errors.stateProvince = 'State is required';
    if (!data.postalCode.trim()) errors.postalCode = 'ZIP code is required';
    if (!data.countryCode.trim()) errors.countryCode = 'Country is required';
  }
  return errors;
}

// ─── Main Wizard Component ────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { toasts, add: addToast, remove: removeToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle documentUrls serialization workaround
  const handleChange = useCallback((key: keyof FormData, val: string) => {
    setFormData((prev) => {
      if (key === 'documentUrls') {
        try { return { ...prev, documentUrls: JSON.parse(val) }; } catch { return prev; }
      }
      return { ...prev, [key]: val };
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentStep < TOTAL_STEPS) {
        setIsSavingDraft(true);
        try {
          await fetch(`${API_BASE}/merchant-onboarding/draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, ...formData }),
          });
        } catch (_) { /* silent auto-save failure */ } finally {
          setIsSavingDraft(false);
        }
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [formData, applicationId, currentStep]);

  const goNext = useCallback(() => {
    const errs = validateStep(currentStep, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast('Please fix the highlighted fields to continue.', 'error');
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, formData, addToast]);

  const goPrev = useCallback(() => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const payload: SubmitKycDto = {
        legalBusinessName: formData.legalBusinessName,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        legalStructure: formData.legalStructure as SubmitKycDto['legalStructure'],
        primaryContactName: formData.primaryContactName,
        primaryContactEmail: formData.primaryContactEmail,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city,
        stateProvince: formData.stateProvince,
        postalCode: formData.postalCode,
        countryCode: formData.countryCode,
        documentUrls: formData.documentUrls.length > 0 ? formData.documentUrls : undefined,
      };

      const res = await fetch(`${API_BASE}/merchant-onboarding/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Server error. Please try again.' }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data: KycApiResponse = await res.json();
      setApplicationId(data.onboardingApplicationId);
      setIsSuccess(true);
      addToast('Application submitted successfully!', 'success');
    } catch (err: any) {
      addToast(err.message ?? 'Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, addToast]);

  const progressPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.25s ease-out both; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.35s ease-out both; }
      `}</style>

      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="min-h-screen bg-[#09090B] flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              KYB Verification
            </div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Merchant Onboarding</h1>
            <p className="text-zinc-500 text-sm mt-2">Complete all steps to activate your PaySurity merchant account</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center mb-8 px-1">
            {STEPS.map((step, idx) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                        isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20' :
                        'bg-zinc-800 text-zinc-500 border border-zinc-700'}
                    `}>
                      {isDone ? '✓' : step.id}
                    </div>
                    <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block transition-colors duration-200 ${
                      isActive ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-zinc-600'
                    }`}>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm shadow-2xl overflow-hidden">

            {/* Progress bar */}
            <div className="h-1 bg-zinc-800 w-full">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
                style={{ width: isSuccess ? '100%' : `${progressPct}%` }}
              />
            </div>

            <div className="p-6 sm:p-8 animate-fade-up">
              {isSuccess && applicationId ? (
                <SuccessScreen applicationId={applicationId} />
              ) : (
                <>
                  {/* Step header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{STEPS[currentStep - 1].icon}</span>
                      <div>
                        <p className="text-xs text-zinc-500 font-medium">Step {currentStep} of {TOTAL_STEPS}</p>
                        <h2 className="text-lg font-bold text-zinc-100">{STEPS[currentStep - 1].label}</h2>
                      </div>
                      {isSavingDraft && (
                        <span className="ml-auto text-xs text-zinc-500 animate-pulse">Saving…</span>
                      )}
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="mb-8">
                    {currentStep === 1 && <StepCompanyInfo data={formData} onChange={handleChange} errors={errors} />}
                    {currentStep === 2 && <StepPrimaryContact data={formData} onChange={handleChange} errors={errors} />}
                    {currentStep === 3 && <StepAddress data={formData} onChange={handleChange} errors={errors} />}
                    {currentStep === 4 && <StepDocuments data={formData} onChange={handleChange} />}
                    {currentStep === 5 && <StepReview data={formData} />}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center gap-3 pt-5 border-t border-zinc-800">
                    {currentStep > 1 && (
                      <button type="button" onClick={goPrev} disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 text-sm font-medium transition-all disabled:opacity-40">
                        ← Back
                      </button>
                    )}

                    <div className="ml-auto flex items-center gap-3">
                      {currentStep < TOTAL_STEPS ? (
                        <button type="button" onClick={goNext}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/25">
                          Continue →
                        </button>
                      ) : (
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                          {isSubmitting ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Submitting…
                            </>
                          ) : '✓ Submit KYB Application'}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-600 mt-6">
            Need help? <a href="mailto:support@paysurity.com" className="text-blue-500 hover:text-blue-400 transition-colors">support@paysurity.com</a>
            {' · '}
            <a href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </>
  );
}