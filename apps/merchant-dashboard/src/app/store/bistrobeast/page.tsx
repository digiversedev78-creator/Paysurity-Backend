'use client';

import { useState } from 'react';

const HERO_ITEMS = [
  { name: 'Signature Smash Burger', price: 1499, desc: 'Double-patty with truffle aioli & aged cheddar', emoji: '🍔' },
  { name: 'Truffle Mushroom Burger', price: 1799, desc: 'Wild mushroom medley with Swiss & truffle oil', emoji: '🍔' },
  { name: 'Beyond Beast', price: 1649, desc: 'Plant-powered with avocado crema', emoji: '🌿' },
];

const MENU_SECTIONS = [
  { title: 'Burgers', icon: '🍔', items: [
    { name: 'Signature Smash Burger', price: 1499, desc: 'Double-patty, truffle aioli, aged cheddar', cal: 820 },
    { name: 'Truffle Mushroom Burger', price: 1799, desc: 'Wild mushrooms, Swiss, truffle oil', cal: 780 },
    { name: 'Beyond Beast', price: 1649, desc: 'Plant-based, avocado crema', cal: 540 },
    { name: 'Classic Cheeseburger', price: 1299, desc: 'American cheese, lettuce, tomato, pickle', cal: 650 },
  ]},
  { title: 'Salads & Bowls', icon: '🥗', items: [
    { name: 'Classic Caesar Salad', price: 1350, desc: 'Romaine, parmesan, house croutons', cal: 380 },
    { name: 'Thai Crunch Bowl', price: 1599, desc: 'Sesame-ginger dressing, crispy wontons', cal: 450 },
    { name: 'Grilled Salmon Bowl', price: 2299, desc: 'Quinoa, roasted veggies, lemon tahini', cal: 520 },
  ]},
  { title: 'Sides', icon: '🍟', items: [
    { name: 'Truffle Parmesan Fries', price: 899, desc: 'Hand-cut, parmesan dust, truffle drizzle', cal: 420 },
    { name: 'Sweet Potato Fries', price: 749, desc: 'With chipotle mayo', cal: 380 },
    { name: 'Onion Rings', price: 699, desc: 'Beer-battered, ranch dip', cal: 460 },
  ]},
  { title: 'Drinks', icon: '🍹', items: [
    { name: 'Craft Lemonade', price: 500, desc: 'Freshly squeezed with mint', cal: 120 },
    { name: 'Iced Tea', price: 350, desc: 'House-brewed, unsweetened', cal: 5 },
    { name: 'Espresso', price: 400, desc: 'Double-shot, locally roasted', cal: 10 },
  ]},
];

const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;

interface CartItem { name: string; price: number; qty: number }

export default function BistroBeastPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const addItem = (name: string, price: number) => {
    setCart(prev => {
      const ex = prev.find(c => c.name === name);
      if (ex) return prev.map(c => c.name === name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { name, price, qty: 1 }];
    });
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ Sticky Nav ═══ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(63,63,70,0.4)',
        padding: '12px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #F97316, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>B</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>BistroBeast</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {['Menu', 'Locations', 'Careers', 'Gift Cards'].map(l => (
            <a key={l} href="#menu" style={{ color: '#A1A1AA', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}>{l}</a>
          ))}
          <button onClick={() => setShowCart(!showCart)} style={{
            position: 'relative',
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: itemCount > 0 ? '#F97316' : 'rgba(63,63,70,0.3)',
            color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
          }}>
            🛒 {itemCount > 0 ? `${itemCount} — ${fmt(total)}` : 'Cart'}
          </button>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section style={{
        padding: '80px 32px 60px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #1C1917 0%, #09090B 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
        }} />
        <h1 style={{
          fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, position: 'relative',
          background: 'linear-gradient(135deg, #FAFAFA, #F97316)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Craft Burgers.<br />Bold Flavors.</h1>
        <p style={{ fontSize: '1.1rem', color: '#A1A1AA', marginTop: 16, maxWidth: 500, marginInline: 'auto', position: 'relative' }}>
          Smashed to perfection, served with passion. Order online for pickup or dine-in.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, position: 'relative' }}>
          <a href="#menu" style={{
            padding: '14px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #F97316, #EF4444)',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
          }}>View Menu</a>
          <a href="#locations" style={{
            padding: '14px 28px', borderRadius: 10,
            border: '1px solid rgba(249,115,22,0.4)',
            background: 'transparent', color: '#F97316', fontWeight: 600,
            fontSize: '0.9rem', textDecoration: 'none',
          }}>Find Us</a>
        </div>

        {/* Featured Items */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 48, position: 'relative' }}>
          {HERO_ITEMS.map(item => (
            <div key={item.name} style={{
              width: 200, padding: 20, borderRadius: 16,
              background: 'rgba(28,25,23,0.9)', border: '1px solid rgba(63,63,70,0.4)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '2.5rem' }}>{item.emoji}</span>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: 8 }}>{item.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#A1A1AA', margin: '4px 0 8px' }}>{item.desc}</div>
              <div style={{ fontWeight: 700, color: '#F97316' }}>{fmt(item.price)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Menu Sections ═══ */}
      <section id="menu" style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>Our Menu</h2>
        {MENU_SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{section.icon}</span> {section.title}
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {section.items.map(item => (
                <div key={item.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', borderRadius: 12,
                  background: 'rgba(24,24,27,0.8)', border: '1px solid rgba(63,63,70,0.3)',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer',
                }}
                  onClick={() => addItem(item.name, item.price)}
                  onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(63,63,70,0.3)')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717A', marginTop: 2 }}>{item.desc}</div>
                    <div style={{ fontSize: '0.65rem', color: '#52525B', marginTop: 2 }}>{item.cal} cal</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 700, color: '#F97316' }}>{fmt(item.price)}</span>
                    <button onClick={e => { e.stopPropagation(); addItem(item.name, item.price); }} style={{
                      width: 32, height: 32, borderRadius: '50%', border: 'none',
                      background: 'rgba(249,115,22,0.15)', color: '#F97316',
                      fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{
        padding: '40px 32px', borderTop: '1px solid rgba(63,63,70,0.3)',
        textAlign: 'center', color: '#52525B', fontSize: '0.75rem',
      }}>
        <div style={{ marginBottom: 8 }}>
          <strong style={{ color: '#A1A1AA' }}>BistroBeast</strong> • Downtown Austin, TX
        </div>
        <div>Powered by <strong style={{ color: '#3B82F6' }}>PaySurity</strong> • © 2026</div>
      </footer>

      {/* ═══ Cart Slide-over ═══ */}
      {showCart && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
          background: '#18181B', borderLeft: '1px solid rgba(63,63,70,0.5)',
          zIndex: 200, display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(63,63,70,0.5)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 700 }}>Your Order</h3>
            <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 60, color: '#52525B' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🛒</div>
                Your cart is empty
              </div>
            ) : cart.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(63,63,70,0.2)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#71717A' }}>{c.qty}× {fmt(c.price)}</div>
                </div>
                <span style={{ fontWeight: 600 }}>{fmt(c.price * c.qty)}</span>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div style={{ padding: '20px', borderTop: '1px solid rgba(63,63,70,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
                <span>Total</span><span style={{ color: '#F97316' }}>{fmt(total)}</span>
              </div>
              <button style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #F97316, #EF4444)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              }}>Checkout — {fmt(total)}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
