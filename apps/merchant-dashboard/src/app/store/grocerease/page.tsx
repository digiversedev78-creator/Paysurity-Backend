'use client';

import { useState } from 'react';

const DEPARTMENTS = [
  { title: 'Fresh Produce', icon: '🥬', items: [
    { name: 'Organic Avocados (3pk)', price: 599, unit: 'pack' },
    { name: 'Roma Tomatoes (lb)', price: 299, unit: 'lb' },
    { name: 'Baby Spinach (5oz)', price: 449, unit: 'bag' },
    { name: 'Bananas (bunch)', price: 179, unit: 'bunch' },
    { name: 'Strawberries (16oz)', price: 549, unit: 'ctn' },
  ]},
  { title: 'Dairy & Eggs', icon: '🥛', items: [
    { name: 'Whole Milk (1gal)', price: 499, unit: 'gal' },
    { name: 'Grade A Eggs (18ct)', price: 649, unit: 'ctn' },
    { name: 'Greek Yogurt (32oz)', price: 599, unit: 'tub' },
    { name: 'Butter (unsalted)', price: 449, unit: 'pack' },
  ]},
  { title: 'Bakery', icon: '🍞', items: [
    { name: 'Sourdough Loaf', price: 549, unit: 'ea' },
    { name: 'Croissants (4ct)', price: 699, unit: 'pack' },
    { name: 'Cinnamon Rolls (6ct)', price: 799, unit: 'pack' },
  ]},
  { title: 'Meat & Seafood', icon: '🥩', items: [
    { name: 'Chicken Breast (lb)', price: 699, unit: 'lb' },
    { name: 'Ground Beef 80/20 (lb)', price: 799, unit: 'lb' },
    { name: 'Atlantic Salmon (lb)', price: 1299, unit: 'lb' },
    { name: 'Pork Chops (lb)', price: 599, unit: 'lb' },
  ]},
  { title: 'Pantry', icon: '🫙', items: [
    { name: 'Olive Oil (750ml)', price: 899, unit: 'btl' },
    { name: 'Pasta (16oz)', price: 249, unit: 'box' },
    { name: 'Rice (5lb)', price: 699, unit: 'bag' },
    { name: 'Black Beans (15oz)', price: 149, unit: 'can' },
  ]},
];

const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

interface CartItem { name: string; price: number; qty: number }

export default function GrocerEasePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dept, setDept] = useState('All');

  const add = (name: string, price: number) => {
    setCart(prev => {
      const ex = prev.find(c => c.name === name);
      if (ex) return prev.map(c => c.name === name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { name, price, qty: 1 }];
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const filtered = dept === 'All' ? DEPARTMENTS : DEPARTMENTS.filter(d => d.title === dept);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', color: '#1C1917', fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,249,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E7E5E4',
        padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>G</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#15803D' }}>GrocerEase</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input placeholder="Search products..." style={{
            padding: '8px 14px', borderRadius: 8, width: 200,
            border: '1px solid #D6D3D1', background: '#fff', fontSize: '0.8rem', outline: 'none',
          }} />
          <button style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: count > 0 ? '#16A34A' : '#E7E5E4',
            color: count > 0 ? '#fff' : '#78716C',
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
          }}>🛒 {count > 0 ? `${count} — ${fmt(total)}` : 'Cart'}</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '60px 32px 40px', textAlign: 'center',
        background: 'linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)',
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#15803D' }}>Fresh. Simple. Delivered.</h1>
        <p style={{ color: '#78716C', marginTop: 8, fontSize: '1rem' }}>
          Quality groceries at your fingertips. Shop by department or search for what you need.
        </p>
      </section>

      {/* Department Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 32px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #E7E5E4' }}>
        {['All', ...DEPARTMENTS.map(d => d.title)].map(d => (
          <button key={d} onClick={() => setDept(d)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
            background: dept === d ? '#16A34A' : '#F5F5F4',
            color: dept === d ? '#fff' : '#57534E',
          }}>{d}</button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {filtered.map(section => (
          <div key={section.title} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{section.icon}</span> {section.title}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {section.items.map(item => {
                const inCart = cart.find(c => c.name === item.name);
                return (
                  <div key={item.name} style={{
                    padding: 16, borderRadius: 12,
                    background: '#fff', border: inCart ? '2px solid #16A34A' : '1px solid #E7E5E4',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                    onClick={() => add(item.name, item.price)}
                    onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                    onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontWeight: 700, color: '#15803D' }}>{fmt(item.price)}<span style={{ fontSize: '0.65rem', color: '#A8A29E', fontWeight: 400 }}>/{item.unit}</span></span>
                      <button onClick={e => { e.stopPropagation(); add(item.name, item.price); }} style={{
                        width: 28, height: 28, borderRadius: '50%', border: 'none',
                        background: inCart ? '#16A34A' : '#F0FDF4', color: inCart ? '#fff' : '#16A34A',
                        fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{inCart ? inCart.qty : '+'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{ padding: '32px', textAlign: 'center', borderTop: '1px solid #E7E5E4', color: '#A8A29E', fontSize: '0.75rem' }}>
        <strong style={{ color: '#57534E' }}>GrocerEase</strong> — Powered by <strong style={{ color: '#3B82F6' }}>PaySurity</strong> • © 2026
      </footer>
    </div>
  );
}
