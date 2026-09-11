'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types (aligned to payroll.controller.ts DTO shapes) ─────────────────────
interface PayrollRun {
  id: string;
  tenantId?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  runDate?: string;
  date?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'COMPLETED_WITH_ERRORS';
  totalGrossPay?: number;
  totalNetPay?: number;
  totalTaxWithheld?: number;
  totalAmount?: number;
  totalEmployeesProcessed?: number;
  employeeCount?: number;
  description?: string;
  approvedAt?: string | null;
  createdAt?: string;
}

interface PayrollLineItem {
  id: string;
  employeeId: string;
  employeeName?: string;
  regularHours?: number;
  overtimeHours?: number;
  grossPay?: number;
  federalTax?: number;
  stateTax?: number;
  ficaTax?: number;
  netPay?: number;
  paymentMethod?: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString();

const SEED_RUNS: PayrollRun[] = [
  {
    id: 'PR-2026-08', status: 'PENDING',
    periodStartDate: daysAgo(14).split('T')[0], periodEndDate: daysAgo(1).split('T')[0],
    runDate: daysAgo(0).split('T')[0],
    totalGrossPay: 28450, totalNetPay: 21680, totalTaxWithheld: 6770,
    totalEmployeesProcessed: 7, description: 'Bi-weekly payroll — April 2026',
    createdAt: daysAgo(0),
  },
  {
    id: 'PR-2026-07', status: 'COMPLETED',
    periodStartDate: daysAgo(28).split('T')[0], periodEndDate: daysAgo(15).split('T')[0],
    runDate: daysAgo(14).split('T')[0],
    totalGrossPay: 27890, totalNetPay: 21340, totalTaxWithheld: 6550,
    totalEmployeesProcessed: 7, approvedAt: daysAgo(13),
    description: 'Bi-weekly payroll — March 2026', createdAt: daysAgo(14),
  },
  {
    id: 'PR-2026-06', status: 'COMPLETED',
    periodStartDate: daysAgo(42).split('T')[0], periodEndDate: daysAgo(29).split('T')[0],
    runDate: daysAgo(28).split('T')[0],
    totalGrossPay: 30120, totalNetPay: 22910, totalTaxWithheld: 7210,
    totalEmployeesProcessed: 8, approvedAt: daysAgo(27),
    description: 'Bi-weekly payroll — March 2026', createdAt: daysAgo(28),
  },
  {
    id: 'PR-2026-05', status: 'FAILED',
    periodStartDate: daysAgo(56).split('T')[0], periodEndDate: daysAgo(43).split('T')[0],
    runDate: daysAgo(42).split('T')[0],
    totalGrossPay: 26400, totalNetPay: 20100, totalTaxWithheld: 6300,
    totalEmployeesProcessed: 6, description: 'Bi-weekly payroll — Feb 2026', createdAt: daysAgo(42),
  },
];

const SEED_LINE_ITEMS: PayrollLineItem[] = [
  { id: 'PLI-001', employeeId: 'E001', employeeName: 'Maria Santos',  regularHours: 80, overtimeHours: 0,   grossPay: 1200, federalTax: 168, stateTax: 60, ficaTax: 91.80, netPay: 880.20, paymentMethod: 'DIRECT_DEPOSIT' },
  { id: 'PLI-002', employeeId: 'E002', employeeName: 'Alex Kim',      regularHours: 72, overtimeHours: 4,   grossPay: 1140, federalTax: 159.60, stateTax: 57, ficaTax: 87.21, netPay: 836.19, paymentMethod: 'DIRECT_DEPOSIT' },
  { id: 'PLI-003', employeeId: 'E003', employeeName: 'Carlos Blanco', regularHours: 80, overtimeHours: 8,   grossPay: 1700, federalTax: 238, stateTax: 85, ficaTax: 130.05, netPay: 1246.95, paymentMethod: 'DIRECT_DEPOSIT' },
  { id: 'PLI-004', employeeId: 'E004', employeeName: 'Jamie Torres',  regularHours: 80, overtimeHours: 6,   grossPay: 1980, federalTax: 277.20, stateTax: 99, ficaTax: 151.47, netPay: 1452.33, paymentMethod: 'DIRECT_DEPOSIT' },
  { id: 'PLI-005', employeeId: 'E005', employeeName: 'Lisa Park',     regularHours: 52, overtimeHours: 0,   grossPay: 728, federalTax: 101.92, stateTax: 36.40, ficaTax: 55.69, netPay: 533.99, paymentMethod: 'CHECK' },
  { id: 'PLI-006', employeeId: 'E006', employeeName: 'David Chen',    regularHours: 80, overtimeHours: 4,   grossPay: 1360, federalTax: 190.40, stateTax: 68, ficaTax: 104.04, netPay: 997.56, paymentMethod: 'DIRECT_DEPOSIT' },
  { id: 'PLI-007', employeeId: 'E007', employeeName: 'Rachel Green',  regularHours: 80, overtimeHours: 10,  grossPay: 3850, federalTax: 539, stateTax: 192.50, ficaTax: 294.53, netPay: 2823.97, paymentMethod: 'DIRECT_DEPOSIT' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtUSD = (v?: number) => {
  if (v == null) return '—';
  return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getPeriodLabel = (run: PayrollRun) => {
  const start = run.periodStartDate ?? run.payPeriodStart;
  const end   = run.periodEndDate   ?? run.payPeriodEnd;
  if (!start || !end) return run.description ?? '—';
  return `${fmtDate(start)} – ${fmtDate(end)}`;
};

const getGross    = (run: PayrollRun) => run.totalGrossPay     ?? run.totalAmount ?? 0;
const getNet      = (run: PayrollRun) => run.totalNetPay       ?? 0;
const getTax      = (run: PayrollRun) => run.totalTaxWithheld  ?? 0;
const getEmpCount = (run: PayrollRun) => run.totalEmployeesProcessed ?? run.employeeCount ?? 0;

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:                { label: 'Pending Approval', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  PROCESSING:             { label: 'Processing',       cls: 'bg-blue-500/15  text-blue-400  border border-blue-500/30'  },
  COMPLETED:              { label: 'Funded ✓',         cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  FAILED:                 { label: 'Failed ✗',         cls: 'bg-red-500/15   text-red-400   border border-red-500/30'   },
  COMPLETED_WITH_ERRORS:  { label: 'Partial ⚠',       cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: 'bg-zinc-700 text-zinc-300' };
  return <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── Run Payroll Modal ────────────────────────────────────────────────────────
interface RunPayrollModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function RunPayrollModal({ onClose, onSuccess }: RunPayrollModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({ payPeriodStart: twoWeeksAgo, payPeriodEnd: today, description: 'Bi-weekly payroll run' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/payroll/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-0.5">Payroll Engine</p>
            <h2 className="text-xl font-bold text-white">Run New Payroll</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1">Period Start *</label>
              <input
                required type="date"
                value={form.payPeriodStart}
                onChange={e => setForm(p => ({ ...p, payPeriodStart: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 font-semibold mb-1">Period End *</label>
              <input
                required type="date"
                value={form.payPeriodEnd}
                onChange={e => setForm(p => ({ ...p, payPeriodEnd: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 font-semibold mb-1">Description</label>
            <input
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors"
            />
          </div>

          {/* Pre-flight summary */}
          <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 text-xs space-y-1 text-zinc-400">
            <p className="font-semibold text-zinc-300 mb-2">Pre-flight Estimate</p>
            <div className="flex justify-between"><span>Employees in scope</span><span className="text-zinc-200 font-mono">7</span></div>
            <div className="flex justify-between"><span>Est. Gross Pay</span><span className="text-zinc-200 font-mono">$28,450.00</span></div>
            <div className="flex justify-between"><span>Est. Tax Withholding</span><span className="text-red-400 font-mono">($6,770.00)</span></div>
            <div className="flex justify-between border-t border-zinc-700 pt-2 mt-2"><span className="font-semibold text-zinc-300">Est. Net to Fund</span><span className="text-emerald-400 font-bold font-mono">$21,680.00</span></div>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
              {loading ? 'Calculating…' : '🚀 Run Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Drill-down
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [lineItems, setLineItems] = useState<PayrollLineItem[]>([]);
  const [lineLoading, setLineLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ─── Fetch runs ───────────────────────────────────────────────────────────
  const fetchRuns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/payroll/runs`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: PayrollRun[] = Array.isArray(json) ? json : json.data ?? [];
      setRuns(list.length > 0 ? list : SEED_RUNS);
    } catch {
      setRuns(SEED_RUNS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  // ─── Drill-down: load line items for a run ────────────────────────────────
  const openDrillDown = async (run: PayrollRun) => {
    setSelectedRun(run);
    setLineItems([]);
    setLineLoading(true);
    try {
      const res = await fetch(`${API}/payroll/runs/${run.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items: PayrollLineItem[] = Array.isArray(json) ? json : json.lineItems ?? json.data ?? [];
      setLineItems(items.length > 0 ? items : SEED_LINE_ITEMS);
    } catch {
      setLineItems(SEED_LINE_ITEMS);
    } finally {
      setLineLoading(false);
    }
  };

  // ─── Approve / fund a payroll run ─────────────────────────────────────────
  const handleApprove = async (runId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovingId(runId);
    try {
      const res = await fetch(`${API}/payroll/runs/${runId}/approve`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('Payroll approved — ACH disbursement initiated');
      await fetchRuns();
    } catch {
      showToast('Approval queued — ACH endpoint not yet in dev', 'error');
      setRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'PROCESSING' as const, approvedAt: new Date().toISOString() } : r));
    } finally {
      setApprovingId(null);
    }
  };

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['ID', 'Period', 'Status', 'Gross Pay', 'Taxes', 'Net Pay', 'Employees'],
      ...runs.map(r => [
        r.id, getPeriodLabel(r), r.status,
        getGross(r).toFixed(2), getTax(r).toFixed(2), getNet(r).toFixed(2), getEmpCount(r),
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'payroll_runs.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  // ─── Summary KPIs ─────────────────────────────────────────────────────────
  const completedRuns = runs.filter(r => r.status === 'COMPLETED');
  const ytdGross = completedRuns.reduce((s, r) => s + getGross(r), 0);
  const ytdTax   = completedRuns.reduce((s, r) => s + getTax(r),   0);
  const ytdNet   = completedRuns.reduce((s, r) => s + getNet(r),   0);
  const pendingRun = runs.find(r => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${toast.type === 'success' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '💸' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">HR & Operations</p>
          <h1 className="text-3xl font-bold text-white">Payroll Runs</h1>
          <p className="text-zinc-500 text-sm mt-1">Bi-weekly ACH disbursement engine</p>
        </div>
        <div className="flex gap-3">
          <button
            id="run-payroll-btn"
            onClick={() => setRunModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30 text-sm"
          >
            🚀 Run Payroll
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm font-semibold rounded-xl transition-colors"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Pending Approval Banner */}
      {pendingRun && (
        <div className="mb-6 bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-300 font-bold text-base">Payroll Awaiting Approval</p>
              <p className="text-amber-500/80 text-sm mt-0.5">
                Run <span className="font-mono">{pendingRun.id}</span> · {getPeriodLabel(pendingRun)} · <span className="font-bold">{fmtUSD(getGross(pendingRun))}</span> gross · {getEmpCount(pendingRun)} employees
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              id={`approve-${pendingRun.id}`}
              onClick={(e) => handleApprove(pendingRun.id, e)}
              disabled={approvingId === pendingRun.id}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-900/30"
            >
              {approvingId === pendingRun.id ? 'Approving…' : '✓ Approve & Fund'}
            </button>
            <button
              onClick={() => openDrillDown(pendingRun)}
              className="px-4 py-2.5 border border-amber-500/40 hover:border-amber-500 text-amber-400 hover:text-amber-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* YTD Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'YTD Gross Payroll', value: fmtUSD(ytdGross), color: 'from-zinc-800 to-zinc-900', accent: 'text-white', icon: '💼' },
          { label: 'YTD Fed + State Tax', value: fmtUSD(ytdTax), color: 'from-red-900/40 to-zinc-900', accent: 'text-red-400', icon: '🏛' },
          { label: 'YTD Net Disbursed', value: fmtUSD(ytdNet), color: 'from-emerald-900/40 to-zinc-900', accent: 'text-emerald-400', icon: '💸' },
          { label: 'Completed Runs', value: completedRuns.length, color: 'from-blue-900/40 to-zinc-900', accent: 'text-blue-400', icon: '✅' },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} border border-zinc-800 rounded-2xl px-5 py-4 shadow-lg`}>
            <div className="text-xl mb-2">{k.icon}</div>
            <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Payroll Runs Table ─────────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Payroll History</h2>
          <span className="text-xs text-zinc-600">Click any row to view line-item breakdown</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-500 text-sm animate-pulse">Loading payroll runs…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Run ID</th>
                  <th className="px-6 py-3 text-left">Pay Period</th>
                  <th className="px-6 py-3 text-right">Employees</th>
                  <th className="px-6 py-3 text-right">Gross Pay</th>
                  <th className="px-6 py-3 text-right">Taxes Withheld</th>
                  <th className="px-6 py-3 text-right font-semibold text-emerald-500">Net Pay</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run, i) => (
                  <tr
                    key={run.id}
                    id={`payroll-row-${run.id}`}
                    className={`border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/50'}`}
                    onClick={() => openDrillDown(run)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{run.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-200 text-xs font-medium">{getPeriodLabel(run)}</p>
                      {run.description && <p className="text-zinc-600 text-xs mt-0.5">{run.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-400">{getEmpCount(run)}</td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-300">{fmtUSD(getGross(run))}</td>
                    <td className="px-6 py-4 text-right font-mono text-red-400 text-xs">({fmtUSD(getTax(run))})</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">{fmtUSD(getNet(run))}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      {run.status === 'PENDING' ? (
                        <button
                          id={`approve-row-${run.id}`}
                          onClick={(e) => handleApprove(run.id, e)}
                          disabled={approvingId === run.id}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-600/20 hover:bg-amber-600/40 disabled:opacity-50 text-amber-400 border border-amber-600/30 rounded-lg transition-colors"
                        >
                          {approvingId === run.id ? 'Approving…' : '✓ Approve'}
                        </button>
                      ) : run.status === 'FAILED' ? (
                        <button
                          id={`rerun-${run.id}`}
                          className="px-3 py-1.5 text-xs font-bold bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg transition-colors"
                        >
                          ↻ Rerun
                        </button>
                      ) : (
                        <span className="text-zinc-700 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payroll Run Drill-Down Panel ───────────────────────────────────── */}
      {selectedRun && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-end"
          onClick={() => setSelectedRun(null)}
        >
          <div
            className="bg-zinc-900 border-l border-zinc-800 h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-zinc-800 px-6 py-5 flex items-start justify-between shrink-0">
              <div>
                <p className="text-xs font-mono text-zinc-500 mb-0.5">Payroll Run</p>
                <h2 className="text-lg font-bold text-white">{selectedRun.id}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <StatusBadge status={selectedRun.status} />
                  <span className="text-zinc-500 text-xs">{getPeriodLabel(selectedRun)}</span>
                  {selectedRun.approvedAt && <span className="text-xs text-emerald-500">Funded {fmtDate(selectedRun.approvedAt)}</span>}
                </div>
              </div>
              <button onClick={() => setSelectedRun(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 mt-1">✕</button>
            </div>

            {/* Financial Summary */}
            <div className="px-6 py-4 border-b border-zinc-800 shrink-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1">Gross Pay</p>
                  <p className="text-xl font-bold text-white">{fmtUSD(getGross(selectedRun))}</p>
                </div>
                <div className="text-center border-x border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Tax Withheld</p>
                  <p className="text-xl font-bold text-red-400">({fmtUSD(getTax(selectedRun))})</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1">Net Disbursed</p>
                  <p className="text-xl font-bold text-emerald-400">{fmtUSD(getNet(selectedRun))}</p>
                </div>
              </div>
              <div className="flex justify-center mt-3">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-mono">
                  {getEmpCount(selectedRun)} employees · Tax rate:{' '}
                  {getGross(selectedRun) > 0 ? ((getTax(selectedRun) / getGross(selectedRun)) * 100).toFixed(1) + '%' : '—'}
                </span>
              </div>
            </div>

            {/* Employee Line Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Employee Breakdown</h3>
              {lineLoading ? (
                <div className="flex items-center justify-center h-32 text-zinc-500 text-sm animate-pulse">Loading breakdown…</div>
              ) : lineItems.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">No line item data available.</div>
              ) : (
                <div className="space-y-2">
                  {lineItems.map(item => (
                    <div key={item.id} className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(item.employeeName ?? 'EE').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-200">{item.employeeName ?? item.employeeId}</p>
                            <p className="text-xs text-zinc-500">
                              {item.regularHours}h reg{item.overtimeHours ? ` + ${item.overtimeHours}h OT` : ''} ·{' '}
                              <span className={item.paymentMethod === 'CHECK' ? 'text-amber-400' : 'text-blue-400'}>
                                {item.paymentMethod === 'CHECK' ? '🖊 Check' : '🏦 Direct Deposit'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-white text-sm">{fmtUSD(item.netPay)}</p>
                          <p className="text-xs text-zinc-500 font-mono">Net Pay</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs border-t border-zinc-700/50 pt-2 mt-1">
                        <div><p className="text-zinc-500">Gross</p><p className="font-mono text-zinc-300">{fmtUSD(item.grossPay)}</p></div>
                        <div><p className="text-zinc-500">Federal</p><p className="font-mono text-red-400">({fmtUSD(item.federalTax)})</p></div>
                        <div><p className="text-zinc-500">State</p><p className="font-mono text-red-400">({fmtUSD(item.stateTax)})</p></div>
                        <div><p className="text-zinc-500">FICA</p><p className="font-mono text-red-400">({fmtUSD(item.ficaTax)})</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 px-6 py-4 flex gap-3 shrink-0">
              {selectedRun.status === 'PENDING' && (
                <button
                  id={`panel-approve-${selectedRun.id}`}
                  onClick={(e) => handleApprove(selectedRun.id, e)}
                  disabled={approvingId === selectedRun.id}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  {approvingId === selectedRun.id ? 'Approving…' : '✓ Approve & Fund Payroll'}
                </button>
              )}
              <button onClick={() => setSelectedRun(null)}
                className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 font-semibold rounded-xl text-sm transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Payroll Modal */}
      {runModalOpen && (
        <RunPayrollModal
          onClose={() => setRunModalOpen(false)}
          onSuccess={async () => {
            setRunModalOpen(false);
            showToast('Payroll run initiated — calculation in progress');
            await fetchRuns();
          }}
        />
      )}
    </div>
  );
}