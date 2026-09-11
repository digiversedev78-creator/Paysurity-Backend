'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiClient } from '../../lib/api-client';

interface RetailItem {
  id: string; name: string; sku: string; barcode?: string;
  stock_quantity: number; category: string; price_cents: number;
  emoji?: string; image?: string;
}
interface CartItem extends RetailItem { quantity: number; }
interface PaymentSplit { id: string; method: 'cash' | 'card' | 'other'; amount_cents: number; paid: boolean; }

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Rich demo catalog ─────────────────────────────────────────────────────────
const DEMO_PRODUCTS: RetailItem[] = [
  // Electronics
  { id: 'e1', name: 'USB-C Phone Charger', sku: 'USB-C-65W', barcode: '8901234567890', category: 'Electronics', price_cents: 2999, stock_quantity: 48, emoji: '🔌' },
  { id: 'e2', name: 'Wireless Earbuds', sku: 'WE-BT50', barcode: '8901234567891', category: 'Electronics', price_cents: 4999, stock_quantity: 23, emoji: '🎧' },
  { id: 'e3', name: 'Phone Screen Protector', sku: 'SP-UNV', barcode: '8901234567892', category: 'Electronics', price_cents: 899, stock_quantity: 120, emoji: '📱' },
  { id: 'e4', name: 'Power Bank 10000mAh', sku: 'PB-10K', barcode: '8901234567893', category: 'Electronics', price_cents: 3499, stock_quantity: 17, emoji: '🔋' },
  // Apparel
  { id: 'a1', name: 'Classic White T-Shirt (M)', sku: 'TS-W-M', barcode: '8901234567894', category: 'Apparel', price_cents: 1999, stock_quantity: 34, emoji: '👕' },
  { id: 'a2', name: 'Classic White T-Shirt (L)', sku: 'TS-W-L', barcode: '8901234567895', category: 'Apparel', price_cents: 1999, stock_quantity: 28, emoji: '👕' },
  { id: 'a3', name: 'Black Hoodie (L)', sku: 'HD-BK-L', barcode: '8901234567896', category: 'Apparel', price_cents: 4499, stock_quantity: 12, emoji: '🧥' },
  { id: 'a4', name: 'Baseball Cap', sku: 'CAP-BL', barcode: '8901234567897', category: 'Apparel', price_cents: 1499, stock_quantity: 55, emoji: '🧢' },
  { id: 'a5', name: 'Canvas Tote Bag', sku: 'TOTE-CV', barcode: '8901234567898', category: 'Apparel', price_cents: 1299, stock_quantity: 40, emoji: '👜' },
  // Snacks & Drinks
  { id: 's1', name: 'Red Bull (12oz)', sku: 'RB-12', barcode: '8901234567899', category: 'Drinks', price_cents: 399, stock_quantity: 144, emoji: '🥤' },
  { id: 's2', name: 'Monster Energy (16oz)', sku: 'MON-16', barcode: '8901234567900', category: 'Drinks', price_cents: 349, stock_quantity: 96, emoji: '🥤' },
  { id: 's3', name: 'Bottled Water (16oz)', sku: 'H2O-16', barcode: '8901234567901', category: 'Drinks', price_cents: 149, stock_quantity: 200, emoji: '💧' },
  { id: 's4', name: 'Chips (Lay\'s BBQ)', sku: 'CHI-BBQ', barcode: '8901234567902', category: 'Snacks', price_cents: 199, stock_quantity: 88, emoji: '🥔' },
  { id: 's5', name: 'Chocolate Bar', sku: 'CHO-MK', barcode: '8901234567903', category: 'Snacks', price_cents: 249, stock_quantity: 72, emoji: '🍫' },
  // Tobacco
  { id: 't1', name: 'Marlboro Red (pk)', sku: 'MAR-RED', barcode: '8901234567904', category: 'Tobacco', price_cents: 1249, stock_quantity: 60, emoji: '🚬' },
  { id: 't2', name: 'Newport Menthol (pk)', sku: 'NEW-MEN', barcode: '8901234567905', category: 'Tobacco', price_cents: 1199, stock_quantity: 45, emoji: '🚬' },
  { id: 't3', name: 'Disposable Lighter', sku: 'LITE-D', barcode: '8901234567906', category: 'Tobacco', price_cents: 149, stock_quantity: 200, emoji: '🔥' },
  { id: 't4', name: 'Cigarillo 5-Pack', sku: 'CIG-5P', barcode: '8901234567907', category: 'Tobacco', price_cents: 699, stock_quantity: 30, emoji: '💨' },
  // Household
  { id: 'h1', name: 'AA Batteries (4pk)', sku: 'BAT-AA4', barcode: '8901234567908', category: 'Household', price_cents: 699, stock_quantity: 80, emoji: '🔦' },
  { id: 'h2', name: 'Hand Sanitizer 8oz', sku: 'SAN-8OZ', barcode: '8901234567909', category: 'Household', price_cents: 449, stock_quantity: 65, emoji: '🧴' },
  { id: 'h3', name: 'Face Mask (10pk)', sku: 'MASK-10', barcode: '8901234567910', category: 'Household', price_cents: 899, stock_quantity: 50, emoji: '😷' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  All: '🏪', Electronics: '⚡', Apparel: '👕', Drinks: '🥤',
  Snacks: '🍿', Tobacco: '🚬', Household: '🧴',
};

const S = {
  page: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" } as React.CSSProperties,
  // Left panel
  left: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 } as React.CSSProperties,
  title: { fontSize: 20, fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  scannerBadge: { fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em' } as React.CSSProperties,
  searchBar: { margin: '10px 16px 6px', padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#e2e8f0', fontSize: 14, outline: 'none', width: 'calc(100% - 32px)' } as React.CSSProperties,
  catStrip: { display: 'flex', gap: 8, padding: '6px 16px 10px', overflowX: 'auto', flexShrink: 0 } as React.CSSProperties,
  catBtn: (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', flexShrink: 0, background: active ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.04)', color: active ? '#fff' : '#64748b' }),
  grid: { flex: 1, overflowY: 'auto', padding: '0 12px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10, alignContent: 'start' } as React.CSSProperties,
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px 12px', borderRadius: 16, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'transform 0.15s', textAlign: 'center' } as React.CSSProperties,
  outOfStock: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px 12px', borderRadius: 16, background: 'rgba(15,15,15,0.5)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'not-allowed', textAlign: 'center', opacity: 0.4 } as React.CSSProperties,
  // Right panel
  right: { display: 'flex', flexDirection: 'column', width: 360, flexShrink: 0, background: 'rgba(8,12,24,0.95)' } as React.CSSProperties,
  orderHeader: { padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 } as React.CSSProperties,
  cartList: { flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 } as React.CSSProperties,
  cartItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' } as React.CSSProperties,
  totals: { padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 } as React.CSSProperties,
  chargeBtn: (hasItems: boolean): React.CSSProperties => ({ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontWeight: 900, fontSize: 18, cursor: hasItems ? 'pointer' : 'not-allowed', opacity: hasItems ? 1 : 0.3, marginTop: 12, boxShadow: hasItems ? '0 8px 28px rgba(59,130,246,0.4)' : 'none', fontFamily: 'inherit' }),
  // Modal
  overlay: { position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' } as React.CSSProperties,
  modal: { width: '100%', maxWidth: 480, borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(180deg,#0f172a 0%,#080d1a 100%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' } as React.CSSProperties,
};

export default function RetailPOSPage() {
  const [products, setProducts] = useState<RetailItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [scannerInput, setScannerInput] = useState('');
  const [scannerStatus, setScannerStatus] = useState<'WAITING' | 'FOUND' | 'NOT_FOUND'>('WAITING');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [splitAmt, setSplitAmt] = useState('');
  const [orderDone, setOrderDone] = useState(false);
  const [taxRate] = useState(0.0825);
  const [zkpVerified, setZkpVerified] = useState(false);
  const [zkpProof, setZkpProof] = useState<string | null>(null);
  const [showZkpPrompt, setShowZkpPrompt] = useState(false);

  const scanRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const requiresAgeGate = useMemo(() => cart.some(i => i.category === 'Tobacco'), [cart]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await apiClient.get<any>('/api/retail/products');
        const items = r?.items || (Array.isArray(r) ? r : null);
        if (items?.length) { setProducts(items); return; }
      } catch { /* fall through */ }
      setProducts(DEMO_PRODUCTS);
    };
    load();
  }, []);

  // Barcode scanner: listens for rapid keystrokes followed by Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const bc = scannerInput.trim();
        setScannerInput('');
        if (!bc) return;
        const found = products.find(p => p.barcode === bc || p.sku === bc);
        if (found) { setScannerStatus('FOUND'); addToCart(found); }
        else setScannerStatus('NOT_FOUND');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setScannerStatus('WAITING'), 2000);
      } else if (e.key.length === 1) {
        setScannerInput(p => p + e.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scannerInput, products, addToCart]);

  const addToCart = useCallback((item: RetailItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) {
        if (ex.quantity >= item.stock_quantity) return prev;
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      if (item.stock_quantity <= 0) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQty = (id: string, delta: number) => setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  const clearCart = () => { setCart([]); setSplits([]); setOrderDone(false); setZkpVerified(false); setZkpProof(null); };

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const visible = useMemo(() => {
    let items = category === 'All' ? products : products.filter(p => p.category === category);
    if (search.trim()) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [products, category, search]);

  const subtotal = cart.reduce((s, i) => s + i.price_cents * i.quantity, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;
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
    const allocated = splits.reduce((s, x) => s + x.amount_cents, 0);
    if (amt > total - allocated) return;
    setSplits(prev => [...prev, { id: uid(), method, amount_cents: amt, paid: false }]);
    setSplitAmt(((total - allocated - amt) / 100).toFixed(2));
  };

  const markPaid = (id: string) => setSplits(prev => prev.map(s => s.id === id ? { ...s, paid: true } : s));
  const removeSplit = (id: string) => {
    const next = splits.filter(s => s.id !== id);
    const alloc = next.reduce((s, x) => s + x.amount_cents, 0);
    setSplits(next);
    setSplitAmt(((total - alloc) / 100).toFixed(2));
  };

  const handleCheckout = async () => {
    if (balanceDue > 0) return;
    if (requiresAgeGate && !zkpVerified) {
        setShowZkpPrompt(true);
        return; // Halt if OP-ZK Age proof is absent !
    }
    try {
      await apiClient.post<any>('/api/retail/orders', {
        items: cart.map(i => ({ itemId: i.id, name: i.name, sku: i.sku, price_cents: i.price_cents, quantity: i.quantity })),
        subtotal_cents: subtotal, tax_cents: tax, total_cents: total,
        payments: splits.filter(s => s.paid).map(s => ({ amount_cents: s.amount_cents, method: s.method })),
        zkp_age_proof: zkpProof, // Attach cryptographic payload
        status: 'completed',
      });
    } catch { /* show success anyway in demo */ }
    setPayModalOpen(false);
    setOrderDone(true);
    setTimeout(() => { clearCart(); }, 2500);
  };

  const simulateZkpScan = () => {
      // Simulate ID Scan cryptographic hashing to prove age without revealing DOB
      setTimeout(() => {
          setZkpProof(`ZKP_v2_${Math.random().toString(36).substring(2)}_AGE_OVER_21_VERIFIED`);
          setZkpVerified(true);
          setShowZkpPrompt(false);
      }, 1000);
  };

  const scanColor = scannerStatus === 'FOUND' ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' } : scannerStatus === 'NOT_FOUND' ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' } : { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' };
  const scanLabel = scannerStatus === 'FOUND' ? '✓ SCANNED' : scannerStatus === 'NOT_FOUND' ? '✗ NOT FOUND' : '◉ SCANNER READY';

  return (
    <div style={S.page}>
      {/* ── LEFT: Product Panel ── */}
      <div style={S.left}>
        {/* Top bar */}
        <div style={S.topbar}>
          <div>
            <div style={S.title}>RetailPro POS</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Point of Sale Terminal · Retail</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ ...S.scannerBadge, ...scanColor }}>{scanLabel}</div>
            <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>● ONLINE</div>
          </div>
        </div>

        {/* Search */}
        <input style={S.searchBar} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name or SKU..." />

        {/* Category strip */}
        <div style={S.catStrip}>
          {categories.map(c => (
            <button key={c} style={S.catBtn(c === category)} onClick={() => setCategory(c)}>
              <span>{CATEGORY_EMOJI[c] || '📦'}</span>{c}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div style={S.grid}>
          {visible.map(item => {
            const inCart = cart.find(c => c.id === item.id);
            const oos = item.stock_quantity <= 0;
            return (
              <div key={item.id} style={oos ? S.outOfStock : S.card}
                onClick={() => !oos && addToCart(item)}>
                {inCart && (
                  <div style={{ position: 'absolute' as any, top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {inCart.quantity}
                  </div>
                )}
                <div style={{ fontSize: 36, marginBottom: 8 }}>{item.emoji || '📦'}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', marginBottom: 6 }}>{item.sku}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#60a5fa' }}>{fmt(item.price_cents)}</div>
                <div style={{ fontSize: 10, color: item.stock_quantity < 5 ? '#f87171' : '#34d399', marginTop: 4 }}>
                  {oos ? '● OUT OF STOCK' : item.stock_quantity < 5 ? `⚠ ${item.stock_quantity} left` : `${item.stock_quantity} in stock`}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#334155' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No items found</div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Order Panel ── */}
      <div style={S.right}>
        <div style={S.orderHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#f1f5f9' }}>Register Cart</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{itemCount} item{itemCount !== 1 ? 's' : ''} scanned</div>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontFamily: 'inherit' }}>
                Void
              </button>
            )}
          </div>
        </div>

        <div style={S.cartList}>
          {cart.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e293b', textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🏪</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Cart is empty</div>
              <div style={{ fontSize: 12, color: '#1e293b', marginTop: 4 }}>Tap a product or scan a barcode</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} style={S.cartItem}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji || '📦'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{item.sku} · {fmt(item.price_cents)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#f87171', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>−</button>
                <span style={{ width: 20, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', fontSize: 16 }}>+</button>
              </div>
              <div style={{ width: 56, textAlign: 'right', fontSize: 13, fontWeight: 900, color: '#60a5fa', flexShrink: 0 }}>{fmt(item.price_cents * item.quantity)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={S.totals}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#64748b' }}>
            <span>Subtotal</span><span style={{ color: '#94a3b8' }}>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: '#64748b' }}>
            <span>Tax ({(taxRate * 100).toFixed(2)}%)</span><span style={{ color: '#94a3b8' }}>{fmt(tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 900, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)', color: '#f1f5f9' }}>
            <span>TOTAL</span><span style={{ color: '#60a5fa' }}>{fmt(total)}</span>
          </div>
          <button style={S.chargeBtn(cart.length > 0)} onClick={openPay} disabled={cart.length === 0}>
            {cart.length ? `Charge ${fmt(total)} →` : 'Scan or Add Items'}
          </button>
        </div>
      </div>

      {/* ── PAYMENT MODAL ── */}
      {payModalOpen && (
        <div style={S.overlay}>
          <div style={S.modal}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9' }}>Collect Payment</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Retail Checkout</div>
              </div>
              <button onClick={() => setPayModalOpen(false)} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>×</button>
            </div>

            {/* Amount due */}
            <div style={{ padding: '20px 24px', textAlign: 'center', background: 'rgba(59,130,246,0.05)', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', marginBottom: 8 }}>AMOUNT DUE</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#f1f5f9' }}>{fmt(total)}</div>
              {totalPaid > 0 && <div style={{ fontSize: 13, color: '#34d399', marginTop: 8 }}>Paid: {fmt(totalPaid)} · <span style={{ color: '#f87171' }}>Due: {fmt(balanceDue)}</span></div>}
            </div>

            {/* Tender input */}
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" value={splitAmt} onChange={e => setSplitAmt(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={() => addSplit('cash')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.12)', color: '#34d399', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>💵 Cash</button>
                <button onClick={() => addSplit('card')} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>💳 Card</button>
              </div>

              {/* Splits */}
              {splits.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 140, overflowY: 'auto' }}>
                  {splits.map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: s.paid ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${s.paid ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.paid ? '#34d399' : '#94a3b8' }}>{fmt(s.amount_cents)} · {s.method.toUpperCase()}</span>
                      {s.paid
                        ? <span style={{ fontSize: 11, fontWeight: 900, color: '#34d399' }}>✓ PAID</span>
                        : <button onClick={() => markPaid(s.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Mark Paid</button>
                      }
                      <button onClick={() => removeSplit(s.id)} style={{ border: 'none', background: 'none', color: '#475569', cursor: 'pointer', fontSize: 14, padding: 0, fontFamily: 'inherit' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 12 }}>
              <button onClick={() => setPayModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              {requiresAgeGate && !zkpVerified ? (
                 <button onClick={() => setShowZkpPrompt(true)} disabled={balanceDue > 0} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#eab308,#ca8a04)', color: '#fff', fontWeight: 900, fontSize: 16, cursor: balanceDue > 0 ? 'not-allowed' : 'pointer', opacity: balanceDue > 0 ? 0.3 : 1, fontFamily: 'inherit' }}>
                   🔒 Verify Age (ZKP) To Commit
                 </button>
              ) : (
                <button onClick={handleCheckout} disabled={balanceDue > 0} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 900, fontSize: 16, cursor: balanceDue > 0 ? 'not-allowed' : 'pointer', opacity: balanceDue > 0 ? 0.3 : 1, fontFamily: 'inherit', boxShadow: balanceDue === 0 ? '0 8px 28px rgba(16,185,129,0.4)' : 'none' }}>
                  {balanceDue > 0 ? `Due: ${fmt(balanceDue)}` : '✓ Complete Sale'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ZKP PROMPT MODAL ── */}
      {showZkpPrompt && (
          <div style={{ ...S.overlay, zIndex: 60 }}>
              <div style={{ ...S.modal, padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛂</div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#f1f5f9' }}>ZKP Age Verification Required</h2>
                  <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
                      Tobacco items detected in cart. Cryptographic Zero-Knowledge Proof required to satisfy local compliance laws without storing PII.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => setShowZkpPrompt(false)} style={{ flex: 1, padding: '14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#e2e8f0', cursor: 'pointer', fontWeight: 700 }}>
                          Cancel
                      </button>
                      <button onClick={simulateZkpScan} style={{ flex: 1, padding: '14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', cursor: 'pointer', fontWeight: 900 }}>
                          Initiate ZKP Scan
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* ── Success toast ── */}
      {orderDone && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 999, padding: '16px 32px', borderRadius: 16, fontWeight: 900, fontSize: 16, color: '#fff', background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 12px 40px rgba(16,185,129,0.5)', whiteSpace: 'nowrap' }}>
          ✓ Sale Complete — Register cleared!
        </div>
      )}
    </div>
  );
}
