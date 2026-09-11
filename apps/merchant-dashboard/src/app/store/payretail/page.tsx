'use client';

import { useState } from 'react';

const CATEGORIES = ['All', 'Clothing', 'Electronics', 'Home', 'Accessories'];
const PRODUCTS = [
  { id: '1', name: 'Premium Denim Jacket', category: 'Clothing', price: 8999, sku: 'CLT-001', stock: 24, color: '#3B82F6' },
  { id: '2', name: 'Graphic Tee — Logo', category: 'Clothing', price: 2999, sku: 'CLT-002', stock: 56, color: '#8B5CF6' },
  { id: '3', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 7999, sku: 'ELC-001', stock: 18, color: '#F97316' },
  { id: '4', name: 'Smart Watch Band', category: 'Electronics', price: 3499, sku: 'ELC-002', stock: 42, color: '#F59E0B' },
  { id: '5', name: 'Scented Candle Set', category: 'Home', price: 3499, sku: 'HOM-001', stock: 35, color: '#10B981' },
  { id: '6', name: 'Throw Pillow — Linen', category: 'Home', price: 2499, sku: 'HOM-002', stock: 28, color: '#06B6D4' },
  { id: '7', name: 'Leather Wallet', category: 'Accessories', price: 4999, sku: 'ACC-001', stock: 47, color: '#A855F7' },
  { id: '8', name: 'Sunglasses — Aviator', category: 'Accessories', price: 5999, sku: 'ACC-002', stock: 31, color: '#EC4899' },
];

const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

interface CartItem { id: string; name: string; price: number; qty: number }

export default function PayRetailPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');

  const add = (p: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const items = PRODUCTS.filter(p =>
    (cat === 'All' || p.category === cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(63,63,70,0.4)',
        padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>R</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PayRetail</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8, width: 200,
              border: '1px solid rgba(63,63,70,0.5)', background: 'rgba(24,24,27,0.8)',
              color: '#FAFAFA', fontSize: '0.8rem', outline: 'none',
            }}
          />
          <span style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>
            🛒 {cart.reduce((s, c) => s + c.qty, 0)} items — {fmt(total)}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '60px 32px 40px', textAlign: 'center',
        background: 'linear-gradient(180deg, #1E1B4B 0%, #09090B 100%)',
      }}>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 900,
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Retail. Reimagined.</h1>
        <p style={{ color: '#A1A1AA', marginTop: 8 }}>Modern retail POS with real-time inventory and seamless checkout.</p>
      </section>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 32px', overflowX: 'auto' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
            background: cat === c ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'rgba(63,63,70,0.3)',
            color: '#fff',
          }}>{c}</button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {items.map(p => {
            const inCart = cart.find(c => c.id === p.id);
            return (
              <div key={p.id} style={{
                borderRadius: 14, overflow: 'hidden',
                background: 'rgba(24,24,27,0.9)', border: inCart ? '2px solid #8B5CF6' : '1px solid rgba(63,63,70,0.4)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onClick={() => add(p)}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Color swatch as "image" placeholder */}
                <div style={{ height: 120, background: `linear-gradient(135deg, ${p.color}40, ${p.color}15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem', opacity: 0.6 }}>🏷️</span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontWeight: 700, color: '#8B5CF6' }}>{fmt(p.price)}</span>
                    <span style={{
                      fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4,
                      background: p.stock > 20 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: p.stock > 20 ? '#10B981' : '#F59E0B',
                    }}>{p.stock} in stock</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#52525B', marginTop: 4 }}>SKU: {p.sku}</div>
                  {inCart && (
                    <div style={{ marginTop: 6, fontSize: '0.7rem', color: '#8B5CF6', fontWeight: 600 }}>
                      ✓ {inCart.qty} in cart
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '32px', textAlign: 'center', borderTop: '1px solid rgba(63,63,70,0.3)', color: '#52525B', fontSize: '0.75rem' }}>
        <strong style={{ color: '#A1A1AA' }}>PayRetail</strong> — Powered by <strong style={{ color: '#3B82F6' }}>PaySurity</strong> • © 2026
      </footer>
    </div>
  );
}
