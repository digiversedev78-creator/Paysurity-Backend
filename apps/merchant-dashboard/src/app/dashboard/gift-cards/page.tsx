'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GiftCard {
  id: string;
  code: string;
  initialBalanceCents?: number;
  currentBalanceCents?: number;
  initialBalance?: number;
  currentBalance?: number;
  recipientEmail?: string;
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
}

// ─── Seed data (fallback) ─────────────────────────────────────────────────────
const SEED: GiftCard[] = [
  { id: 'GC001', code: 'BISTRO-2024-WXYZ', initialBalanceCents: 5000, currentBalanceCents: 3250, recipientEmail: 'sarah@example.com', isActive: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'GC002', code: 'BISTRO-GIFT-ABCD', initialBalanceCents: 10000, currentBalanceCents: 10000, recipientEmail: 'mike@example.com', isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 355).toISOString() },
  { id: 'GC003', code: 'PARTY-CARD-1234', initialBalanceCents: 2500, currentBalanceCents: 0, recipientEmail: 'julia@example.com', isActive: false, createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'GC004', code: 'HOLIDAY-XMAS-999', initialBalanceCents: 7500, currentBalanceCents: 4100, recipientEmail: 'tom@example.com', isActive: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), expiresAt: new Date(Date.now() + 86400000 * 60).toISOString() },
  { id: 'GC005', code: 'CORP-REWARD-7890', initialBalanceCents: 20000, currentBalanceCents: 20000, recipientEmail: 'corp@acmeco.com', isActive: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const fmtDollars = (cents?: number) => {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getBalance = (card: GiftCard) => card.currentBalanceCents ?? (card.currentBalance ? card.currentBalance * 100 : undefined);
const getInitial = (card: GiftCard) => card.initialBalanceCents ?? (card.initialBalance ? card.initialBalance * 100 : undefined);

const balancePct = (card: GiftCard) => {
  const cur = getBalance(card) ?? 0;
  const init = getInitial(card) ?? 1;
  return Math.min(100, Math.round((cur / init) * 100));
};

// ─── Issue Gift Card Form State ───────────────────────────────────────────────
const EMPTY_FORM = { recipientEmail: '', amount: '', notes: '' };

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SPENT' | 'INACTIVE'>('ALL');
  const [search, setSearch] = useState('');

  // Issue modal
  const [issueOpen, setIssueOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  // Redeem modal
  const [redeemCard, setRedeemCard] = useState<GiftCard | null>(null);
  const [redeemAmt, setRedeemAmt] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Fetch ──────────────────────────────────────────────────────────────
  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/gift-cards`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: GiftCard[] = Array.isArray(json) ? json : json.data ?? [];
      setCards(list.length > 0 ? list : SEED);
    } catch {
      setCards(SEED);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  // ─── Issue gift card ─────────────────────────────────────────────────────
  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtCents = Math.round(parseFloat(form.amount) * 100);
    if (isNaN(amtCents) || amtCents <= 0) { setIssueError('Enter a valid amount.'); return; }
    setIssueLoading(true);
    setIssueError(null);
    try {
      const res = await fetch(`${API}/gift-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientEmail: form.recipientEmail, initialBalanceCents: amtCents }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      showToast('Gift card issued successfully!');
      setIssueOpen(false);
      setForm(EMPTY_FORM);
      await fetchCards();
    } catch (err: any) {
      setIssueError(err.message);
    } finally {
      setIssueLoading(false);
    }
  };

  // ─── Redeem ──────────────────────────────────────────────────────────────
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCard) return;
    const amtCents = Math.round(parseFloat(redeemAmt) * 100);
    if (isNaN(amtCents) || amtCents <= 0) { setRedeemError('Enter a valid amount.'); return; }
    const balance = getBalance(redeemCard) ?? 0;
    if (amtCents > balance) { setRedeemError(`Cannot exceed current balance of ${fmtDollars(balance)}.`); return; }
    setRedeemLoading(true);
    setRedeemError(null);
    try {
      const res = await fetch(`${API}/gift-cards/${redeemCard.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amountCents: amtCents }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `HTTP ${res.status}`);
      }
      showToast(`${fmtDollars(amtCents)} redeemed from ${redeemCard.code}`);
      setRedeemCard(null);
      setRedeemAmt('');
      await fetchCards();
    } catch (err: any) {
      setRedeemError(err.message);
    } finally {
      setRedeemLoading(false);
    }
  };

  // ─── Filtered visible cards ───────────────────────────────────────────────
  const visible = cards.filter(c => {
    const bal = getBalance(c) ?? 0;
    const init = getInitial(c) ?? 0;
    const searchMatch = c.code.toLowerCase().includes(search.toLowerCase()) || (c.recipientEmail ?? '').toLowerCase().includes(search.toLowerCase());
    if (!searchMatch) return false;
    if (filter === 'ACTIVE') return c.isActive && bal > 0;
    if (filter === 'SPENT') return bal === 0;
    if (filter === 'INACTIVE') return !c.isActive;
    return true;
  });

  // Summary stats
  const totalOutstanding = cards.filter(c => c.isActive).reduce((sum, c) => sum + (getBalance(c) ?? 0), 0);
  const totalIssued = cards.reduce((sum, c) => sum + (getInitial(c) ?? 0), 0);
  const activeCount = cards.filter(c => c.isActive && (getBalance(c) ?? 0) > 0).length;
  const redeemedPct = totalIssued > 0 ? Math.round(((totalIssued - totalOutstanding) / totalIssued) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-fade-up ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '🎁' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-1">Customer Engagement</p>
          <h1 className="text-3xl font-bold text-white">Gift Cards</h1>
        </div>
        <button
          id="issue-gift-card-btn"
          onClick={() => setIssueOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-900/30"
        >
          🎁 Issue Gift Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Issued', value: fmtDollars(totalIssued), icon: '💳', color: 'from-violet-700 to-violet-900' },
          { label: 'Outstanding Balance', value: fmtDollars(totalOutstanding), icon: '💰', color: 'from-emerald-700 to-emerald-900' },
          { label: 'Active Cards', value: activeCount, icon: '✅', color: 'from-blue-700 to-blue-900' },
          { label: 'Redeemed %', value: `${redeemedPct}%`, icon: '📊', color: 'from-amber-700 to-amber-900' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white/70 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by code or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'SPENT', 'INACTIVE'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === f ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-zinc-500 text-sm animate-pulse">Loading gift cards…</div>
      ) : visible.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">No gift cards match your filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(card => {
            const pct = balancePct(card);
            const balance = getBalance(card) ?? 0;
            const initial = getInitial(card) ?? 0;
            const isExpiringSoon = card.expiresAt && new Date(card.expiresAt).getTime() - Date.now() < 86400000 * 30;
            return (
              <div key={card.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-lg transition-all group">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs text-zinc-500 mb-1">Gift Card Code</p>
                    <p className="font-mono text-base font-bold text-violet-400 tracking-wider">{card.code}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {card.isActive && balance > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">Active</span>}
                    {!card.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 font-semibold">Inactive</span>}
                    {balance === 0 && card.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 font-semibold">Spent</span>}
                    {isExpiringSoon && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">⚠ Expiring</span>}
                  </div>
                </div>

                {/* Balance */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                    <span>Balance</span>
                    <span>{fmtDollars(balance)} / {fmtDollars(initial)}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 60 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-1 mb-4">
                  {card.recipientEmail && <p className="text-xs text-zinc-500">📧 {card.recipientEmail}</p>}
                  <p className="text-xs text-zinc-600">Issued: {fmtDate(card.createdAt)}</p>
                  {card.expiresAt && <p className={`text-xs ${isExpiringSoon ? 'text-amber-400' : 'text-zinc-600'}`}>Expires: {fmtDate(card.expiresAt)}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-zinc-800">
                  <button
                    id={`redeem-${card.id}`}
                    disabled={!card.isActive || balance === 0}
                    onClick={() => { setRedeemCard(card); setRedeemAmt(''); setRedeemError(null); }}
                    className="flex-1 py-2 text-xs font-semibold bg-violet-600/15 hover:bg-violet-600/30 disabled:opacity-30 disabled:cursor-not-allowed text-violet-400 border border-violet-500/30 rounded-lg transition-colors"
                  >
                    Redeem
                  </button>
                  <button
                    id={`add-funds-${card.id}`}
                    disabled={!card.isActive}
                    className="flex-1 py-2 text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/25 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors"
                  >
                    Add Funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Gift Card Modal */}
      {issueOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">🎁 Issue Gift Card</h2>
              <button onClick={() => setIssueOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400">✕</button>
            </div>
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 font-semibold mb-1">Recipient Email *</label>
                <input required type="email" value={form.recipientEmail} onChange={e => setForm(p => ({ ...p, recipientEmail: e.target.value }))}
                  placeholder="customer@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 font-semibold mb-1">Amount ($) *</label>
                <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="25.00"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
              </div>
              {/* Quick amount buttons */}
              <div className="flex gap-2">
                {['10', '25', '50', '100', '200'].map(v => (
                  <button key={v} type="button" onClick={() => setForm(p => ({ ...p, amount: v }))}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${form.amount === v ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                    ${v}
                  </button>
                ))}
              </div>
              {issueError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{issueError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIssueOpen(false)}
                  className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 rounded-xl text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={issueLoading}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                  {issueLoading ? 'Issuing…' : 'Issue Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Modal */}
      {redeemCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Redeem Gift Card</h2>
              <button onClick={() => setRedeemCard(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400">✕</button>
            </div>
            <p className="font-mono text-violet-400 text-sm font-bold mb-1">{redeemCard.code}</p>
            <p className="text-zinc-400 text-xs mb-4">Available balance: <span className="text-emerald-400 font-semibold">{fmtDollars(getBalance(redeemCard))}</span></p>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 font-semibold mb-1">Redeem Amount ($)</label>
                <input required type="number" min="0.01" step="0.01" value={redeemAmt} onChange={e => setRedeemAmt(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors" />
              </div>
              {redeemError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{redeemError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setRedeemCard(null)}
                  className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={redeemLoading}
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                  {redeemLoading ? 'Processing…' : 'Redeem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
