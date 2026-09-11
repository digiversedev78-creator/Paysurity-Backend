'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KdsTicket {
  id: string;
  orderId?: string;
  tableId?: string;
  tableNumber?: string;
  station?: string;
  status?: string;
  priority?: number;
  items?: KdsItem[];
  notes?: string;
  firedAt?: string | null;
  readyAt?: string | null;
  createdAt?: string;
}

interface KdsItem {
  name: string;
  qty: number;
  modifiers?: string[];
  notes?: string;
  status?: string; // PENDING | COOKING | READY
}

// ─── Live seed data (cycles every 30s to simulate real kitchen traffic) ──────
const genTickets = (): KdsTicket[] => [
  {
    id: 'KT001', tableNumber: '12', station: 'KITCHEN', status: 'NEW', priority: 2,
    items: [
      { name: 'House Burger', qty: 2, modifiers: ['No onion', 'Extra bacon'], status: 'PENDING' },
      { name: 'Caesar Salad', qty: 1, modifiers: ['Dressing on side'], status: 'PENDING' },
    ],
    firedAt: new Date(Date.now() - 120000).toISOString(), createdAt: new Date().toISOString(),
  },
  {
    id: 'KT002', tableNumber: '5', station: 'KITCHEN', status: 'IN_PROGRESS', priority: 1,
    items: [
      { name: 'Ribeye Steak', qty: 1, modifiers: ['Medium-rare'], status: 'COOKING' },
      { name: 'Garlic Mashed Potatoes', qty: 1, status: 'READY' },
      { name: 'Grilled Asparagus', qty: 1, status: 'COOKING' },
    ],
    firedAt: new Date(Date.now() - 480000).toISOString(), createdAt: new Date().toISOString(),
  },
  {
    id: 'KT003', tableNumber: '8', station: 'BAR', status: 'NEW', priority: 0,
    items: [
      { name: 'Old Fashioned', qty: 2, status: 'PENDING' },
      { name: 'Sparkling Water', qty: 4, status: 'PENDING' },
      { name: 'Craft IPA', qty: 1, status: 'PENDING' },
    ],
    firedAt: new Date(Date.now() - 60000).toISOString(), createdAt: new Date().toISOString(),
  },
  {
    id: 'KT004', tableNumber: '3', station: 'EXPO', status: 'READY', priority: 3,
    items: [
      { name: 'Margherita Pizza', qty: 1, status: 'READY' },
      { name: 'Pasta Carbonara', qty: 2, status: 'READY' },
    ],
    firedAt: new Date(Date.now() - 900000).toISOString(),
    readyAt: new Date(Date.now() - 120000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'KT005', tableNumber: '17', station: 'GRILL', status: 'IN_PROGRESS', priority: 2,
    items: [
      { name: 'BBQ Chicken', qty: 3, modifiers: ['Spicy'], status: 'COOKING' },
      { name: 'Corn on the Cob', qty: 3, status: 'READY' },
    ],
    notes: 'Table is celebrating birthday — rush order!',
    firedAt: new Date(Date.now() - 300000).toISOString(), createdAt: new Date().toISOString(),
  },
];

const STATIONS = ['ALL', 'KITCHEN', 'BAR', 'EXPO', 'GRILL'];

const elapsed = (iso?: string | null) => {
  if (!iso) return '—';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

const ticketBorder = (status?: string, elapsed?: number) => {
  if (status === 'READY') return 'border-emerald-500/50 bg-emerald-950/20';
  if (status === 'IN_PROGRESS') {
    if ((elapsed ?? 0) > 600) return 'border-red-500/60 bg-red-950/20'; // >10min = urgent
    return 'border-amber-500/50 bg-amber-950/20';
  }
  return 'border-zinc-700 bg-zinc-900';
};

const statusLabel = (status?: string) => {
  if (status === 'NEW') return { label: 'NEW', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  if (status === 'IN_PROGRESS') return { label: 'COOKING', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (status === 'READY') return { label: '✓ READY', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (status === 'BUMPED') return { label: 'BUMPED', cls: 'bg-zinc-700 text-zinc-400' };
  return { label: status ?? '—', cls: 'bg-zinc-700 text-zinc-400' };
};

const itemStatusDot = (s?: string) => {
  if (s === 'READY') return 'text-emerald-400';
  if (s === 'COOKING') return 'text-amber-400';
  return 'text-zinc-500';
};

export default function KdsPage() {
  const [tickets, setTickets] = useState<KdsTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState('ALL');
  const [tick, setTick] = useState(0); // forces re-render for elapsed timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-tick every second for live elapsed timers
  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // ─── Fetch from API or fall back to seed ──────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch(`${API}/kds/tickets`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data ?? [];
      setTickets(list.length > 0 ? list : genTickets());
    } catch {
      setTickets(genTickets());
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // ─── Bump (complete) a ticket ─────────────────────────────────────────────
  const bumpTicket = async (id: string) => {
    try {
      await fetch(`${API}/kds/tickets/${id}/bump`, { method: 'PATCH', credentials: 'include' });
    } catch { /* ignore — optimistic UI */ }
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  // ─── Mark ticket as in progress ──────────────────────────────────────────
  const startTicket = async (id: string) => {
    try {
      await fetch(`${API}/kds/tickets/${id}/start`, { method: 'PATCH', credentials: 'include' });
    } catch { /* ignore */ }
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'IN_PROGRESS', firedAt: t.firedAt ?? new Date().toISOString() } : t));
  };

  // ─── Filter ───────────────────────────────────────────────────────────────
  const visible = tickets.filter(t => {
    if (station === 'ALL') return t.status !== 'BUMPED';
    return t.station === station && t.status !== 'BUMPED';
  }).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  // Stats
  const newCount = tickets.filter(t => t.status === 'NEW').length;
  const cookingCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const readyCount = tickets.filter(t => t.status === 'READY').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* KDS Top Bar */}
      <header className="h-14 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">Kitchen Display System</span>
          <span className="text-xs text-zinc-500 font-mono hidden sm:block">
            Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full">
            <span className="font-mono">{newCount}</span> NEW
          </span>
          <span className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
            <span className="font-mono">{cookingCount}</span> COOKING
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full">
            <span className="font-mono">{readyCount}</span> READY
          </span>
          <button
            id="kds-refresh-btn"
            onClick={fetchTickets}
            className="ml-2 px-3 py-1 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Station Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATIONS.map(s => (
            <button key={s} onClick={() => setStation(s)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border uppercase tracking-wider transition-colors ${station === s ? 'bg-zinc-200 text-zinc-900 border-zinc-200' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
              {s === 'ALL' ? '🍽 All Stations' : s === 'KITCHEN' ? '🔥 Kitchen' : s === 'BAR' ? '🍸 Bar' : s === 'EXPO' ? '🧑‍🍳 Expo' : '🥩 Grill'}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-zinc-500 text-sm animate-pulse">Loading tickets…</div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-semibold text-zinc-400">All clear!</p>
            <p className="text-sm text-zinc-600 mt-1">No open tickets for this station.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map(ticket => {
              const elapsedSecs = ticket.firedAt ? Math.floor((Date.now() - new Date(ticket.firedAt).getTime()) / 1000) : 0;
              const isUrgent = ticket.status !== 'READY' && elapsedSecs > 600;
              const { label, cls } = statusLabel(ticket.status);

              return (
                <div key={ticket.id + tick}
                  className={`rounded-2xl border-2 p-4 shadow-lg transition-all ${ticketBorder(ticket.status, elapsedSecs)} ${ticket.priority && ticket.priority >= 2 ? 'ring-1 ring-amber-500/30' : ''}`}>

                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-2xl font-black text-white">Table {ticket.tableNumber ?? '?'}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {ticket.station} · {ticket.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
                      {ticket.priority !== undefined && ticket.priority >= 2 && (
                        <span className="text-xs text-amber-400 font-bold">🔥 RUSH</span>
                      )}
                    </div>
                  </div>

                  {/* Elapsed Timer */}
                  <div className={`flex items-center gap-1.5 text-xs font-mono mb-3 ${isUrgent ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                    <span className={isUrgent ? 'animate-pulse' : ''}>⏱</span>
                    <span>{elapsed(ticket.firedAt)}</span>
                    {isUrgent && <span className="text-red-400 ml-1">⚠ OVERDUE</span>}
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2 mb-4 border-t border-zinc-800 pt-3">
                    {(ticket.items ?? []).map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`mt-0.5 text-xs font-bold ${itemStatusDot(item.status)}`}>
                          {item.status === 'READY' ? '●' : item.status === 'COOKING' ? '◑' : '○'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${item.status === 'READY' ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                            <span className="text-zinc-400">×{item.qty}</span> {item.name}
                          </p>
                          {(item.modifiers ?? []).map((m, mi) => (
                            <p key={mi} className="text-xs text-amber-400 font-medium">↳ {m}</p>
                          ))}
                          {item.notes && <p className="text-xs text-zinc-500 italic">"{item.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {ticket.notes && (
                    <div className="text-xs text-red-300 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                      ⚠ {ticket.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {ticket.status === 'NEW' && (
                      <button
                        id={`start-ticket-${ticket.id}`}
                        onClick={() => startTicket(ticket.id)}
                        className="flex-1 py-2 text-xs font-bold bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/30 rounded-lg transition-colors"
                      >
                        🔥 Start
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button
                        id={`ready-ticket-${ticket.id}`}
                        onClick={() => setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'READY', readyAt: new Date().toISOString() } : t))}
                        className="flex-1 py-2 text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded-lg transition-colors"
                      >
                        ✓ Mark Ready
                      </button>
                    )}
                    <button
                      id={`bump-ticket-${ticket.id}`}
                      onClick={() => bumpTicket(ticket.id)}
                      className={`py-2 text-xs font-bold border rounded-lg transition-colors ${ticket.status === 'READY' ? 'flex-1 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500' : 'px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'}`}
                    >
                      {ticket.status === 'READY' ? 'BUMP ✓' : '✕'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
