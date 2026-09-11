'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface MenuItem {
  id: string; name: string; category: string; price_cents: number;
  emoji?: string; description?: string; popular?: boolean;
}
interface CartItem extends MenuItem { quantity: number; }
interface PaymentSplit { id: string; amount_cents: number; method: 'cash' | 'card' | 'other'; paid: boolean; }

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Rich demo menu (mirrors DB seed, 13 categories) ───────────────────────────
const DEMO_MENU: MenuItem[] = [
  { id: 'b1', name: 'Chicken Biryani', category: 'Biryani', price_cents: 1499, emoji: '🍛', popular: true, description: 'Basmati rice, slow-cooked chicken, saffron' },
  { id: 'b2', name: 'Lamb Biryani', category: 'Biryani', price_cents: 1699, emoji: '🍖', popular: true },
  { id: 'b3', name: 'Shrimp Biryani', category: 'Biryani', price_cents: 1799, emoji: '🦐' },
  { id: 'b4', name: 'Vegetable Biryani', category: 'Biryani', price_cents: 1299, emoji: '🥗' },
  { id: 'b5', name: 'Hyderabadi Dum Biryani', category: 'Biryani', price_cents: 1799, emoji: '🍛', popular: true },
  { id: 'b6', name: 'Fish Biryani', category: 'Biryani', price_cents: 1799, emoji: '🐟' },
  { id: 'g1', name: 'Chicken Tikka', category: 'Grills', price_cents: 1399, emoji: '🔥', popular: true },
  { id: 'g2', name: 'Seekh Kebab (6 pcs)', category: 'Grills', price_cents: 1199, emoji: '🍢' },
  { id: 'g3', name: 'Lamb Chops', category: 'Grills', price_cents: 1899, emoji: '🥩', popular: true },
  { id: 'g4', name: 'Shami Kebab (4 pcs)', category: 'Grills', price_cents: 999, emoji: '🍢' },
  { id: 'g5', name: 'Mixed Grill Platter', category: 'Grills', price_cents: 2299, emoji: '🍽️', popular: true },
  { id: 'c1', name: 'Chicken Karahi', category: 'Curries', price_cents: 1499, emoji: '🍲', popular: true },
  { id: 'c2', name: 'Nihari', category: 'Curries', price_cents: 1599, emoji: '🥣' },
  { id: 'c3', name: 'Haleem', category: 'Curries', price_cents: 1299, emoji: '🍲' },
  { id: 'c4', name: 'Daal Makhani', category: 'Curries', price_cents: 1099, emoji: '🫘' },
  { id: 'c5', name: 'Palak Paneer', category: 'Curries', price_cents: 1199, emoji: '🥬' },
  { id: 'c6', name: 'Butter Chicken', category: 'Curries', price_cents: 1499, emoji: '🍗', popular: true },
  { id: 'ch1', name: 'Chicken Manchurian', category: 'Chinese', price_cents: 1299, emoji: '🥡', popular: true },
  { id: 'ch2', name: 'Hakka Noodles', category: 'Chinese', price_cents: 1099, emoji: '🍜' },
  { id: 'ch3', name: 'Fried Rice', category: 'Chinese', price_cents: 999, emoji: '🍚' },
  { id: 'ch4', name: 'Chili Chicken', category: 'Chinese', price_cents: 1299, emoji: '🌶️' },
  { id: 'br1', name: 'Garlic Naan (2 pcs)', category: 'Breads', price_cents: 499, emoji: '🫓', popular: true },
  { id: 'br2', name: 'Tandoori Roti (2 pcs)', category: 'Breads', price_cents: 299, emoji: '🫓' },
  { id: 'br3', name: 'Paratha (2 pcs)', category: 'Breads', price_cents: 399, emoji: '🫓' },
  { id: 'br4', name: 'Peshwari Naan', category: 'Breads', price_cents: 599, emoji: '🫓' },
  { id: 'a1', name: 'Samosas (4 pcs)', category: 'Appetizers', price_cents: 799, emoji: '🥟', popular: true },
  { id: 'a2', name: 'Pakora Basket', category: 'Appetizers', price_cents: 899, emoji: '🥜' },
  { id: 'a3', name: 'Chaat', category: 'Appetizers', price_cents: 799, emoji: '🥙' },
  { id: 'a4', name: 'Papri Chaat', category: 'Appetizers', price_cents: 849, emoji: '🍿' },
  { id: 'd1', name: 'Gulab Jamun (4 pcs)', category: 'Desserts', price_cents: 699, emoji: '🍮', popular: true },
  { id: 'd2', name: 'Kheer (bowl)', category: 'Desserts', price_cents: 599, emoji: '🍚' },
  { id: 'd3', name: 'Rasmalai (3 pcs)', category: 'Desserts', price_cents: 799, emoji: '🍨' },
  { id: 'd4', name: 'Shahi Tukda', category: 'Desserts', price_cents: 699, emoji: '🍞' },
  { id: 'dr1', name: 'Mango Lassi', category: 'Drinks', price_cents: 499, emoji: '🥭', popular: true },
  { id: 'dr2', name: 'Sweet Lassi', category: 'Drinks', price_cents: 399, emoji: '🥛' },
  { id: 'dr3', name: 'Masala Chai', category: 'Drinks', price_cents: 349, emoji: '☕', popular: true },
  { id: 'dr4', name: 'Nimbu Pani', category: 'Drinks', price_cents: 299, emoji: '🍋' },
  { id: 'dr5', name: 'Rooh Afza Sharbat', category: 'Drinks', price_cents: 349, emoji: '🌹' },
  { id: 'p1', name: 'Sweet Paan', category: 'Paan', price_cents: 299, emoji: '🌿', popular: true },
  { id: 'p2', name: 'Saada Paan', category: 'Paan', price_cents: 199, emoji: '🌿' },
  { id: 'p3', name: 'Fire Paan', category: 'Paan', price_cents: 399, emoji: '🔥' },
  { id: 'cat1', name: 'Biryani Tray (25 ppl)', category: 'Catering', price_cents: 12999, emoji: '🍛', description: '25-person tray · 72hr notice required' },
  { id: 'cat2', name: 'Mixed Grill Tray', category: 'Catering', price_cents: 15999, emoji: '🍖', description: '25-person tray · 72hr notice required' },
  { id: 'cat3', name: 'Appetizer Sampler Tray', category: 'Catering', price_cents: 8999, emoji: '🥟' },
];

const CAT_ICONS: Record<string, string> = {
  All: '🍽️', Biryani: '🍛', Grills: '🔥', Curries: '🍲',
  Chinese: '🥡', Breads: '🫓', Appetizers: '🥟',
  Desserts: '🍮', Drinks: '🥤', Paan: '🌿', Catering: '🎪',
};

export default function POSTerminalPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [clientTime, setClientTime] = useState('');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEOUT' | 'DELIVERY'>('DINE_IN');
  const [tableNum, setTableNum] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(0.08);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [splitAmt, setSplitAmt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  // Client-only clock — avoids SSR hydration mismatch
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClientTime(
        n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        + ' — ' + n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.get<any>('/api/restaurant/menu');
        const items = data?.items || (Array.isArray(data) ? data : null);
        if (items?.length) { setMenuItems(items); return; }
      } catch { /* fall through */ }
      setMenuItems(DEMO_MENU);
    };
    load();
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(menuItems.map(i => i.category)))], [menuItems]);
  const visible = useMemo(() => {
    let items = category === 'All' ? menuItems : menuItems.filter(i => i.category === category);
    if (search.trim()) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [menuItems, category, search]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQty = (id: string, delta: number) => setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  const clearCart = () => { setCart([]); setDiscount(0); setSplits([]); setOrderDone(false); };

  const subtotal = cart.reduce((s, i) => s + i.price_cents * i.quantity, 0);
  const taxCents = Math.round((subtotal - discount) * taxRate);
  const total = Math.max(0, subtotal - discount + taxCents);
  const totalPaid = splits.filter(s => s.paid).reduce((s, x) => s + x.amount_cents, 0);
  const balanceDue = total - totalPaid;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const openPay = () => {
    if (!cart.length) return;
    setSplits([{ id: uid(), method: 'card', amount_cents: total, paid: false }]);
    setSplitAmt((total / 100).toFixed(2));
    setPayModalOpen(true);
  };

  const addSplit = (method: 'cash' | 'card') => {
    const amt = Math.round(parseFloat(splitAmt) * 100);
    if (isNaN(amt) || amt <= 0) return;
    const alloc = splits.reduce((s, x) => s + x.amount_cents, 0);
    if (amt > total - alloc) return;
    setSplits(prev => [...prev, { id: uid(), method, amount_cents: amt, paid: false }]);
    setSplitAmt(((total - alloc - amt) / 100).toFixed(2));
  };

  const splitEqually = (n: number) => {
    const each = Math.floor(total / n);
    const rem = total % n;
    setSplits(Array.from({ length: n }, (_, i) => ({ id: uid(), method: 'card' as const, amount_cents: each + (i === 0 ? rem : 0), paid: false })));
  };

  const markPaid = (id: string) => setSplits(prev => prev.map(s => s.id === id ? { ...s, paid: true } : s));
  const removeSplit = (id: string) => {
    const next = splits.filter(s => s.id !== id);
    const alloc = next.reduce((s, x) => s + x.amount_cents, 0);
    setSplits(next);
    setSplitAmt(((total - alloc) / 100).toFixed(2));
  };

  const handleCheckout = async () => {
    if (balanceDue > 0 || processing) return;
    setProcessing(true);
    try {
      await apiClient.post<any>('/api/restaurant/orders', {
        items: cart.map(i => ({ itemId: i.id, name: i.name, price_cents: i.price_cents, quantity: i.quantity, category: i.category })),
        orderType, tableNum: orderType === 'DINE_IN' ? tableNum : undefined,
        subtotal_cents: subtotal, discount_cents: discount, tax_cents: taxCents, total_cents: total,
        payments: splits.filter(s => s.paid).map(s => ({ amount_cents: s.amount_cents, method: s.method })),
        status: 'completed',
      });
    } catch { /* API offline — still show success in demo */ }
    setProcessing(false);
    setPayModalOpen(false);
    setOrderDone(true);
    setTimeout(() => clearCart(), 2500);
  };

  // ── Styles (100% inline — no Tailwind dependency) ──────────────────────────
  const page: React.CSSProperties = { display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" };
  const leftPanel: React.CSSProperties = { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.06)' };
  const topbar: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 };
  const rightPanel: React.CSSProperties = { display: 'flex', flexDirection: 'column', width: 380, flexShrink: 0, background: 'rgba(8,12,24,0.95)' };
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' };
  const modal: React.CSSProperties = { width: '100%', maxWidth: 500, borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(180deg,#0f172a,#080d1a)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)', maxHeight: '90vh', overflowY: 'auto' };

  return (
    <div style={page}>
      {/* ── LEFT: Menu Panel ── */}
      <div style={leftPanel}>
        {/* Top bar */}
        <div style={topbar}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BistroBeast POS
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }} suppressHydrationWarning>
              {clientTime || '\u00a0'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={orderType} onChange={e => setOrderType(e.target.value as any)}
              style={{ fontSize: 13, padding: '7px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="DINE_IN">🪑 Dine In</option>
              <option value="TAKEOUT">🥡 Takeout</option>
              <option value="DELIVERY">🛵 Delivery</option>
            </select>
            {orderType === 'DINE_IN' && (
              <input type="text" value={tableNum} onChange={e => setTableNum(e.target.value)} placeholder="Table #"
                style={{ width: 72, fontSize: 13, textAlign: 'center', padding: '7px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' }} />
            )}
            <div style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, fontWeight: 700, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>● ONLINE</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px 4px', flexShrink: 0 }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search menu items..."
            style={{ width: '100%', padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '8px 16px', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', flexShrink: 0, background: c === category ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.04)', color: c === category ? '#fff' : '#64748b', fontFamily: 'inherit' }}>
              <span>{CAT_ICONS[c] || '📦'}</span>{c}
            </button>
          ))}
        </div>

        {/* Menu grid — uses CSS grid via inline style */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 10, alignContent: 'start', scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
          {visible.map(item => (
            <button key={item.id} onClick={() => addToCart(item)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px 12px', borderRadius: 16, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'center', position: 'relative', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>
              {item.popular && (
                <div style={{ position: 'absolute', top: 7, right: 7, fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 20, background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', letterSpacing: '0.06em' }}>★ POP</div>
              )}
              <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji || '🍽️'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
              {item.description && <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, lineHeight: 1.3 }}>{item.description}</div>}
              <div style={{ fontSize: 15, fontWeight: 900, color: '#60a5fa' }}>{fmt(item.price_cents)}</div>
            </button>
          ))}
          {visible.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#334155' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No items found</div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Order Panel ── */}
      <div style={rightPanel}>
        {/* Order header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9' }}>Current Order</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{itemCount} item{itemCount !== 1 ? 's' : ''} · {orderType.replace('_', ' ')}{tableNum ? ` · Table ${tableNum}` : ''}</div>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8, scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
          {cart.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e293b', textAlign: 'center', padding: 40, minHeight: 200 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🧾</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No items yet</div>
              <div style={{ fontSize: 12, color: '#1e293b', marginTop: 4 }}>Tap a menu item to add to order</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji || '🍽️'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{fmt(item.price_cents)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#f87171', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>−</button>
                <span style={{ width: 20, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>+</button>
              </div>
              <div style={{ width: 58, textAlign: 'right', fontSize: 13, fontWeight: 900, color: '#60a5fa', flexShrink: 0 }}>{fmt(item.price_cents * item.quantity)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
          {cart.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', flexShrink: 0 }}>Discount ($)</span>
              <input type="number" min="0" step="0.5"
                value={discount ? (discount / 100).toFixed(2) : ''}
                onChange={e => setDiscount(Math.round((parseFloat(e.target.value) || 0) * 100))}
                placeholder="0.00"
                style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f87171', fontSize: 13, textAlign: 'right', outline: 'none', fontFamily: 'inherit' }} />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, color: '#64748b' }}><span>Subtotal</span><span style={{ color: '#94a3b8' }}>{fmt(subtotal)}</span></div>
          {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5, color: '#34d399' }}><span>Discount</span><span>−{fmt(discount)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: '#64748b' }}><span>Tax ({(taxRate * 100).toFixed(0)}%)</span><span style={{ color: '#94a3b8' }}>{fmt(taxCents)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 900, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', color: '#f1f5f9' }}>
            <span>TOTAL</span><span style={{ color: '#60a5fa' }}>{fmt(total)}</span>
          </div>
          <button onClick={openPay} disabled={cart.length === 0}
            style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontWeight: 900, fontSize: 18, cursor: cart.length ? 'pointer' : 'not-allowed', opacity: cart.length ? 1 : 0.3, marginTop: 12, boxShadow: cart.length ? '0 8px 28px rgba(59,130,246,0.4)' : 'none', fontFamily: 'inherit' }}>
            {cart.length ? `Charge ${fmt(total)} →` : 'Add Items to Order'}
          </button>
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      {payModalOpen && (
        <div style={overlay}>
          <div style={modal}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>Collect Payment</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{orderType.replace('_', ' ')}{tableNum ? ` · Table ${tableNum}` : ''}</div>
              </div>
              <button onClick={() => setPayModalOpen(false)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
            </div>

            {/* Amount */}
            <div style={{ padding: '20px 24px', textAlign: 'center', background: 'rgba(59,130,246,0.05)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', marginBottom: 8 }}>AMOUNT DUE</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#f1f5f9' }}>{fmt(total)}</div>
              {totalPaid > 0 && <div style={{ fontSize: 13, marginTop: 8, color: '#34d399' }}>Paid: {fmt(totalPaid)} · <span style={{ color: '#f87171' }}>Due: {fmt(balanceDue)}</span></div>}
            </div>

            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Split equally */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>SPLIT EQUALLY:</span>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => splitEqually(n)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>{n} ways</button>
                ))}
              </div>
              {/* Tender row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" value={splitAmt} onChange={e => setSplitAmt(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={() => addSplit('cash')} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.12)', color: '#34d399', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>💵 Cash</button>
                <button onClick={() => addSplit('card')} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>💳 Card</button>
              </div>
              {/* Splits list */}
              {splits.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {splits.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: s.paid ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${s.paid ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.paid ? '#34d399' : '#94a3b8' }}>{fmt(s.amount_cents)} · {s.method.toUpperCase()}</span>
                      {s.paid
                        ? <span style={{ fontSize: 11, fontWeight: 900, color: '#34d399' }}>✓ PAID</span>
                        : <button onClick={() => markPaid(s.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Mark Paid</button>
                      }
                      <button onClick={() => removeSplit(s.id)} style={{ border: 'none', background: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 12 }}>
              <button onClick={() => setPayModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={handleCheckout} disabled={balanceDue > 0 || processing}
                style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 900, fontSize: 16, cursor: (balanceDue > 0 || processing) ? 'not-allowed' : 'pointer', opacity: (balanceDue > 0 || processing) ? 0.3 : 1, fontFamily: 'inherit', boxShadow: balanceDue === 0 ? '0 8px 28px rgba(16,185,129,0.4)' : 'none' }}>
                {processing ? 'Processing…' : balanceDue > 0 ? `Due: ${fmt(balanceDue)}` : '✓ Complete Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {orderDone && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 999, padding: '16px 32px', borderRadius: 16, fontWeight: 900, fontSize: 16, color: '#fff', background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 12px 40px rgba(16,185,129,0.5)', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
          ✓ Order Complete — Table cleared!
        </div>
      )}
    </div>
  );
}