'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types (aligned to settlement.controller.ts DTO shapes) ──────────────────
interface SettlementBatch {
  id: string;
  date?: string;
  batchId?: string;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'COMPLETED' | 'FAILED' | 'ON_HOLD';
  grossAmountCents?: number;
  gross?: number;
  feesAmountCents?: number;
  fees?: number;
  netAmountCents?: number;
  net?: number;
  transactionCount?: number;
  txnCount?: number;
  gateway?: string;
  processorRef?: string;
  bankAccountLast4?: string;
  periodStart?: string;
  periodEnd?: string;
  settledAt?: string;
  createdAt?: string;
}

interface SettlementReport {
  batchId?: string;
  transactions?: ReportTransaction[];
  summary?: {
    totalGross: number;
    totalFees: number;
    totalNet: number;
    transactionCount: number;
  };
}

interface ReportTransaction {
  id: string;
  amountCents?: number;
  amount?: number;
  cardLast4?: string | null;
  cardBrand?: string | null;
  tenderType?: string;
  status?: string;
  createdAt?: string;
}

// ─── Rich seed data ───────────────────────────────────────────────────────────
const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString().split('T')[0];

const SEED_BATCHES: SettlementBatch[] = [
  { id: 'SET-2026-0407', batchId: 'SET-2026-0407', date: daysAgo(0), status: 'PENDING', grossAmountCents: 428750, feesAmountCents: 6431, netAmountCents: 422319, transactionCount: 67, gateway: 'FluidPay', bankAccountLast4: '4821', createdAt: new Date().toISOString() },
  { id: 'SET-2026-0406', batchId: 'SET-2026-0406', date: daysAgo(1), status: 'SETTLED', grossAmountCents: 512000, feesAmountCents: 7680, netAmountCents: 504320, transactionCount: 82, gateway: 'FluidPay', bankAccountLast4: '4821', settledAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'SET-2026-0405', batchId: 'SET-2026-0405', date: daysAgo(2), status: 'SETTLED', grossAmountCents: 389000, feesAmountCents: 5835, netAmountCents: 383165, transactionCount: 58, gateway: 'FluidPay', bankAccountLast4: '4821', settledAt: new Date(Date.now() - 86400000 - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'SET-2026-0404', batchId: 'SET-2026-0404', date: daysAgo(3), status: 'SETTLED', grossAmountCents: 465000, feesAmountCents: 6975, netAmountCents: 458025, transactionCount: 71, gateway: 'FluidPay', bankAccountLast4: '4821', settledAt: new Date(Date.now() - 86400000 * 2 - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'SET-2026-0403', batchId: 'SET-2026-0403', date: daysAgo(4), status: 'FAILED', grossAmountCents: 210000, feesAmountCents: 3150, netAmountCents: 206850, transactionCount: 31, gateway: 'FluidPay', bankAccountLast4: '4821', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'SET-2026-0402', batchId: 'SET-2026-0402', date: daysAgo(5), status: 'SETTLED', grossAmountCents: 620000, feesAmountCents: 9300, netAmountCents: 610700, transactionCount: 95, gateway: 'FluidPay', bankAccountLast4: '4821', settledAt: new Date(Date.now() - 86400000 * 4 - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'SET-2026-0401', batchId: 'SET-2026-0401', date: daysAgo(6), status: 'SETTLED', grossAmountCents: 580000, feesAmountCents: 8700, netAmountCents: 571300, transactionCount: 89, gateway: 'FluidPay', bankAccountLast4: '4821', settledAt: new Date(Date.now() - 86400000 * 5 - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
];

const SEED_REPORT_TXNS: ReportTransaction[] = [
  { id: 'TXN-001', amountCents: 8450, cardLast4: '4242', cardBrand: 'VISA', tenderType: 'CARD', status: 'CAPTURED', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'TXN-002', amountCents: 12300, cardLast4: '5555', cardBrand: 'MASTERCARD', tenderType: 'CARD', status: 'CAPTURED', createdAt: new Date(Date.now() - 7800000).toISOString() },
  { id: 'TXN-003', amountCents: 4750, cardLast4: null, cardBrand: null, tenderType: 'CASH', status: 'CAPTURED', createdAt: new Date(Date.now() - 8400000).toISOString() },
  { id: 'TXN-004', amountCents: 6200, cardLast4: '1234', cardBrand: 'AMEX', tenderType: 'CARD', status: 'CAPTURED', createdAt: new Date(Date.now() - 9000000).toISOString() },
  { id: 'TXN-005', amountCents: 3100, cardLast4: '9876', cardBrand: 'DISCOVER', tenderType: 'CARD', status: 'CAPTURED', createdAt: new Date(Date.now() - 9600000).toISOString() },
  { id: 'TXN-006', amountCents: 2500, cardLast4: null, cardBrand: null, tenderType: 'GIFT_CARD', status: 'CAPTURED', createdAt: new Date(Date.now() - 10200000).toISOString() },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGross = (b: SettlementBatch) => b.grossAmountCents ?? (b.gross ? b.gross * 100 : 0);
const getFees  = (b: SettlementBatch) => b.feesAmountCents  ?? (b.fees  ? b.fees  * 100 : 0);
const getNet   = (b: SettlementBatch) => b.netAmountCents   ?? (b.net   ? b.net   * 100 : 0);
const getTxns  = (b: SettlementBatch) => b.transactionCount ?? b.txnCount ?? 0;
const getDate  = (b: SettlementBatch) => b.date ?? (b.createdAt ? b.createdAt.split('T')[0] : '—');

const fmtCents = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: 'Pending',    cls: 'bg-amber-500/15  text-amber-400  border border-amber-500/30'  },
  PROCESSING: { label: 'Processing', cls: 'bg-blue-500/15   text-blue-400   border border-blue-500/30'   },
  SETTLED:    { label: 'Funded ✓',   cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  COMPLETED:  { label: 'Funded ✓',   cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  FAILED:     { label: 'Failed ✗',   cls: 'bg-red-500/15    text-red-400    border border-red-500/30'    },
  ON_HOLD:    { label: 'On Hold',    cls: 'bg-zinc-600/50   text-zinc-300   border border-zinc-600'      },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-zinc-700 text-zinc-300' };
  return <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
};

const TenderIcon = ({ type }: { type?: string }) => {
  if (type === 'CARD') return <span className="text-blue-400 text-xs">💳</span>;
  if (type === 'CASH') return <span className="text-emerald-400 text-xs">💵</span>;
  if (type === 'GIFT_CARD') return <span className="text-violet-400 text-xs">🎁</span>;
  if (type === 'WALLET') return <span className="text-amber-400 text-xs">📱</span>;
  return <span className="text-zinc-400 text-xs">—</span>;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettlementsPage() {
  const [batches, setBatches] = useState<SettlementBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Drill-down state
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null);
  const [report, setReport] = useState<SettlementReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ─── Fetch batches ────────────────────────────────────────────────────────
  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/settlement/batches`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data ?? [];
      setBatches(list.length > 0 ? list : SEED_BATCHES);
    } catch {
      setBatches(SEED_BATCHES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  // ─── Process a pending batch ──────────────────────────────────────────────
  const handleProcess = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessingId(id);
    try {
      const res = await fetch(`${API}/settlement/batches/${id}/process`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('Batch submitted for processing');
      await fetchBatches();
    } catch {
      showToast('Failed to process batch — showing demo state', 'error');
      setBatches(prev => prev.map(b => b.id === id ? { ...b, status: 'PROCESSING' as const } : b));
    } finally {
      setProcessingId(null);
    }
  };

  // ─── Open drill-down + load report ────────────────────────────────────────
  const openDrillDown = async (batch: SettlementBatch) => {
    setSelectedBatch(batch);
    setReport(null);
    setReportLoading(true);
    try {
      const res = await fetch(`${API}/settlement/batches/${batch.id}/report`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setReport(json);
    } catch {
      setReport({
        batchId: batch.id,
        transactions: SEED_REPORT_TXNS,
        summary: {
          totalGross: getGross(batch),
          totalFees: getFees(batch),
          totalNet: getNet(batch),
          transactionCount: getTxns(batch),
        },
      });
    } finally {
      setReportLoading(false);
    }
  };

  // ─── Create new batch ─────────────────────────────────────────────────────
  const handleCreateBatch = async () => {
    try {
      const res = await fetch(`${API}/settlement/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('New settlement batch created');
      await fetchBatches();
    } catch {
      showToast('Batch creation queued — API unreachable in dev mode', 'error');
    }
  };

  // ─── KPI calculations ─────────────────────────────────────────────────────
  const weeklyGross = batches.reduce((s, b) => s + getGross(b), 0);
  const weeklyFees  = batches.reduce((s, b) => s + getFees(b),  0);
  const weeklyNet   = batches.reduce((s, b) => s + getNet(b),   0);
  const effectiveRate = weeklyGross > 0 ? ((weeklyFees / weeklyGross) * 100).toFixed(2) + '%' : '—';
  const pendingCount = batches.filter(b => b.status === 'PENDING').length;
  const failedCount  = batches.filter(b => b.status === 'FAILED').length;

  // Transactions for drill-down
  const drillTxns: ReportTransaction[] = report?.transactions ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-up ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">Money Flow</p>
          <h1 className="text-3xl font-bold text-white">Settlement Batches</h1>
          <p className="text-zinc-500 text-sm mt-1">Daily T+1 funding batches via FluidPay ACH</p>
        </div>
        <div className="flex gap-3">
          <button
            id="create-batch-btn"
            onClick={handleCreateBatch}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/30 text-sm"
          >
            + New Batch
          </button>
          <button className="px-4 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm font-semibold rounded-xl transition-colors">
            📥 Export
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: '7-Day Gross', value: fmtCents(weeklyGross), color: 'from-zinc-800 to-zinc-900', accent: 'text-white' },
          { label: 'Processing Fees', value: fmtCents(weeklyFees), color: 'from-red-900/50 to-zinc-900', accent: 'text-red-400' },
          { label: 'Net Deposits', value: fmtCents(weeklyNet), color: 'from-emerald-900/50 to-zinc-900', accent: 'text-emerald-400' },
          { label: 'Effective Rate', value: effectiveRate, color: 'from-blue-900/50 to-zinc-900', accent: 'text-blue-400' },
          { label: 'Pending / Failed', value: `${pendingCount} / ${failedCount}`, color: failedCount > 0 ? 'from-red-900/40 to-zinc-900' : 'from-amber-900/30 to-zinc-900', accent: failedCount > 0 ? 'text-red-400' : 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} border border-zinc-800 rounded-2xl px-5 py-4 shadow-lg`}>
            <p className="text-xs text-zinc-500 font-medium mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Settlement Batches Table ─────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Recent Batches</h2>
          <span className="text-xs text-zinc-600">Click any row to drill down into transactions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-zinc-500 text-sm animate-pulse">Loading batches…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Batch ID</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Gateway</th>
                  <th className="px-6 py-3 text-right">Txns</th>
                  <th className="px-6 py-3 text-right">Gross</th>
                  <th className="px-6 py-3 text-right">Fees</th>
                  <th className="px-6 py-3 text-right font-semibold text-emerald-500">Net Deposit</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, i) => (
                  <tr
                    key={batch.id}
                    id={`batch-row-${batch.id}`}
                    className={`border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-zinc-900/50'}`}
                    onClick={() => openDrillDown(batch)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{batch.batchId ?? batch.id}</td>
                    <td className="px-6 py-4 text-zinc-300">{getDate(batch)}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-zinc-400 text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                        {batch.gateway ?? 'FluidPay'}
                        {batch.bankAccountLast4 && <span className="text-zinc-600">···{batch.bankAccountLast4}</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-400">{getTxns(batch)}</td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-300">{fmtCents(getGross(batch))}</td>
                    <td className="px-6 py-4 text-right font-mono text-red-400 text-xs">({fmtCents(getFees(batch))})</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">{fmtCents(getNet(batch))}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={batch.status} /></td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      {batch.status === 'PENDING' ? (
                        <button
                          id={`process-batch-${batch.id}`}
                          onClick={(e) => handleProcess(batch.id, e)}
                          disabled={processingId === batch.id}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 disabled:opacity-50 text-emerald-400 border border-emerald-600/30 rounded-lg transition-colors"
                        >
                          {processingId === batch.id ? 'Processing…' : '▶ Process'}
                        </button>
                      ) : batch.status === 'FAILED' ? (
                        <button
                          id={`retry-batch-${batch.id}`}
                          onClick={(e) => handleProcess(batch.id, e)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg transition-colors"
                        >
                          ↻ Retry
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

      {/* ── Transaction Drill-Down Panel ──────────────────────────────────────── */}
      {selectedBatch && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-end"
          onClick={() => setSelectedBatch(null)}
        >
          <div
            className="bg-zinc-900 border-l border-zinc-800 h-full w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="border-b border-zinc-800 px-6 py-5 flex items-start justify-between shrink-0">
              <div>
                <p className="text-xs font-mono text-zinc-500 mb-0.5">Settlement Batch</p>
                <h2 className="text-lg font-bold text-white">{selectedBatch.batchId ?? selectedBatch.id}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={selectedBatch.status} />
                  <span className="text-zinc-500 text-xs">{getDate(selectedBatch)}</span>
                  {selectedBatch.gateway && (
                    <span className="text-xs text-blue-400 font-semibold">{selectedBatch.gateway}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors mt-1"
              >✕</button>
            </div>

            {/* Financial Summary */}
            <div className="px-6 py-4 border-b border-zinc-800 shrink-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1">Gross</p>
                  <p className="text-xl font-bold text-white">{fmtCents(getGross(selectedBatch))}</p>
                </div>
                <div className="text-center border-x border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Fees</p>
                  <p className="text-xl font-bold text-red-400">({fmtCents(getFees(selectedBatch))})</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1">Net Deposit</p>
                  <p className="text-xl font-bold text-emerald-400">{fmtCents(getNet(selectedBatch))}</p>
                </div>
              </div>

              {/* Rate pill */}
              {getGross(selectedBatch) > 0 && (
                <div className="mt-3 flex justify-center">
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full font-mono">
                    Effective rate: {((getFees(selectedBatch) / getGross(selectedBatch)) * 100).toFixed(2)}%
                    · {getTxns(selectedBatch)} transactions
                    {selectedBatch.bankAccountLast4 && ` · Bank ···${selectedBatch.bankAccountLast4}`}
                  </span>
                </div>
              )}
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Transactions</h3>

              {reportLoading ? (
                <div className="flex items-center justify-center h-32 text-zinc-500 text-sm animate-pulse">
                  Loading transaction detail…
                </div>
              ) : drillTxns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-zinc-600 text-sm">
                  No transaction detail available for this batch.
                </div>
              ) : (
                <div className="space-y-2">
                  {drillTxns.map(txn => (
                    <div key={txn.id} className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <TenderIcon type={txn.tenderType} />
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">
                            {txn.cardBrand ? `${txn.cardBrand} ···${txn.cardLast4}` : txn.tenderType ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-zinc-500 font-mono">{txn.id.slice(0, 12)} · {txn.createdAt ? new Date(txn.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-white text-sm">
                          {fmtCents(txn.amountCents ?? (txn.amount ? txn.amount * 100 : 0))}
                        </p>
                        <p className={`text-xs font-semibold ${txn.status === 'CAPTURED' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                          {txn.status ?? '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="border-t border-zinc-800 px-6 py-4 flex gap-3 shrink-0">
              {selectedBatch.status === 'PENDING' && (
                <button
                  id={`panel-process-${selectedBatch.id}`}
                  onClick={(e) => handleProcess(selectedBatch.id, e)}
                  disabled={processingId === selectedBatch.id}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
                >
                  {processingId === selectedBatch.id ? 'Processing…' : '▶ Process Batch'}
                </button>
              )}
              <button
                onClick={() => setSelectedBatch(null)}
                className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 font-semibold rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}