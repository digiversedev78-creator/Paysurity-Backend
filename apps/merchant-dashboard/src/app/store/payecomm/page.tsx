'use client';

import { useState } from 'react';

const CATEGORIES = ['All', 'Trending', 'New Arrivals', 'Best Sellers', 'On Sale'];
const PRODUCTS = [
  { id: '1', name: 'Minimalist Leather Backpack', price: 12999, oldPrice: 15999, rating: 4.8, reviews: 342, img: '🎒', tag: 'Best Seller' },
  { id: '2', name: 'Wireless Charging Pad', price: 3999, oldPrice: 4999, rating: 4.6, reviews: 218, img: '⚡', tag: 'Trending' },
  { id: '3', name: 'Organic Cotton Hoodie', price: 6999, oldPrice: null, rating: 4.9, reviews: 156, img: '👕', tag: 'New' },
  { id: '4', name: 'Smart Water Bottle', price: 4499, oldPrice: 5499, rating: 4.5, reviews: 89, img: '💧', tag: 'On Sale' },
  { id: '5', name: 'Noise-Canceling Headphones', price: 19999, oldPrice: 24999, rating: 4.7, reviews: 512, img: '🎧', tag: 'Best Seller' },
  { id: '6', name: 'Eco-Friendly Tote Bag', price: 2499, oldPrice: null, rating: 4.4, reviews: 73, img: '👜', tag: 'New' },
  { id: '7', name: 'Portable Bluetooth Speaker', price: 5999, oldPrice: 7999, rating: 4.6, reviews: 267, img: '🔊', tag: 'On Sale' },
  { id: '8', name: 'Stainless Steel Watch', price: 15999, oldPrice: null, rating: 4.8, reviews: 189, img: '⌚', tag: 'Trending' },
];

const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

interface CartItem { id: string; name: string; price: number; qty: number }

export default function PayEcommPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cat, setCat] = useState('All');

  const add = (p: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const filtered = cat === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.tag === cat.replace(' ', '') || p.tag === cat);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>E</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>PayEcomm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {['Shop', 'Categories', 'Deals', 'About'].map(l => (
            <a key={l} href="#" style={{ color: '#6B7280', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>{l}</a>
          ))}
          <button style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: count > 0 ? '#3B82F6' : '#E5E7EB',
            color: count > 0 ? '#fff' : '#6B7280',
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
          }}>🛒 {count > 0 ? `${count} — ${fmt(total)}` : 'Cart'}</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '80px 40px 60px', textAlign: 'center',
        background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)',
      }}>
        <div style={{
          display: 'inline-block', padding: '4px 12px', borderRadius: 20,
          background: '#DBEAFE', color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 600, marginBottom: 16,
        }}>🚀 Free shipping on orders over $50</div>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.1 }}>
          Shop Smarter.<br />
          <span style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ship Faster.</span>
        </h1>
        <p style={{ color: '#6B7280', marginTop: 12, fontSize: '1rem', maxWidth: 500, marginInline: 'auto' }}>
          Curated products with integrated payment processing and real-time inventory.
        </p>
      </section>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 40px', borderBottom: '1px solid #E5E7EB' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600,
            background: cat === c ? '#3B82F6' : '#F3F4F6',
            color: cat === c ? '#fff' : '#6B7280',
          }}>{c}</button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {filtered.map(p => {
            const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
            return (
              <div key={p.id} style={{
                borderRadius: 16, overflow: 'hidden',
                background: '#fff', border: '1px solid #E5E7EB',
                transition: 'all 0.2s', cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
                onClick={() => add(p)}
                onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)')}
                onMouseOut={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)')}
              >
                <div style={{
                  height: 160, background: '#F9FAFB', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}>
                  <span style={{ fontSize: '3rem' }}>{p.img}</span>
                  {discount > 0 && (
                    <span style={{
                      position: 'absolute', top: 12, left: 12,
                      padding: '3px 8px', borderRadius: 6,
                      background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                    }}>-{discount}%</span>
                  )}
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '3px 8px', borderRadius: 6,
                    background: '#EFF6FF', color: '#3B82F6', fontSize: '0.6rem', fontWeight: 600,
                  }}>{p.tag}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ color: '#F59E0B', fontSize: '0.7rem' }}>{'★'.repeat(Math.floor(p.rating))}</span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>{p.rating} ({p.reviews})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#111827' }}>{fmt(p.price)}</span>
                      {p.oldPrice && <span style={{ marginLeft: 6, textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.8rem' }}>{fmt(p.oldPrice)}</span>}
                    </div>
                    <button onClick={e => { e.stopPropagation(); add(p); }} style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: '#3B82F6', color: '#fff',
                      fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                    }}>Add</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Badges */}
      <section style={{
        display: 'flex', justifyContent: 'center', gap: 40,
        padding: '40px', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
      }}>
        {[
          { icon: '🔒', label: 'Secure Payments' },
          { icon: '🚚', label: 'Free Shipping' },
          { icon: '↩️', label: '30-Day Returns' },
          { icon: '💬', label: '24/7 Support' },
        ].map(b => (
          <div key={b.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{b.icon}</div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 500 }}>{b.label}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem' }}>
        <strong style={{ color: '#6B7280' }}>PayEcomm</strong> — Powered by <strong style={{ color: '#3B82F6' }}>PaySurity</strong> • © 2026
      </footer>
    </div>
  );
}
