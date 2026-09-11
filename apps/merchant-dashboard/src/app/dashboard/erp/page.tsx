'use client';
import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const s = {
  bg: { minHeight: '100vh', background: '#09090b', color: '#fafafa', padding: '2rem', fontFamily: 'Inter, sans-serif' },
  card: { background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
  h1: { fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  badge: (color: string) => ({ background: color + '20', color, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }),
  btn: { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.4rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' as const },
};

export default function ErpOverviewPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/v1/erp/warehouses`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/v1/erp/accounting/journals`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/v1/erp/accounts`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([w, j, a]) => { setWarehouses(w || []); setJournals(j || []); setAccounts(a || []); setLoading(false); });
  }, []);

  return (
    <div style={s.bg}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={s.h1}>ERP Command Center</h1>
        <p style={{ color: '#71717a', marginBottom: '2rem' }}>Double-entry accounting · Multi-warehouse inventory · Landed costs</p>

        {loading ? <p style={{ color: '#71717a' }}>Loading ERP data...</p> : (
          <>
            <div style={s.grid4}>
              {[
                { label: 'Warehouses', value: warehouses.length, color: '#3b82f6', icon: '🏭' },
                { label: 'Journal Entries', value: journals.length, color: '#8b5cf6', icon: '📒' },
                { label: 'Chart of Accounts', value: accounts.length, color: '#10b981', icon: '📊' },
                { label: 'Pending Landed Costs', value: '–', color: '#f59e0b', icon: '📦' },
              ].map(stat => (
                <div key={stat.label} style={s.statCard}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#71717a', fontSize: '0.85rem', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={s.card}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Quick Links</h2>
                {[
                  { href: '/dashboard/erp/accounts', label: '📊 Chart of Accounts', desc: 'Manage accounts & balances' },
                  { href: '/dashboard/erp/journals', label: '📒 Journal Entries', desc: 'View trial balance & ledger' },
                  { href: '/dashboard/erp/inventory', label: '📦 Inventory Manager', desc: 'Stock levels & transfers' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ display: 'block', padding: '0.75rem', borderRadius: '10px', marginBottom: '0.5rem', background: 'rgba(63,63,70,0.2)', textDecoration: 'none', color: '#fafafa', transition: 'background 0.2s' }}>
                    <div style={{ fontWeight: 600 }}>{link.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{link.desc}</div>
                  </a>
                ))}
              </div>

              <div style={s.card}>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Journal Entries</h2>
                {journals.slice(0, 5).length === 0 ? <p style={{ color: '#71717a' }}>No journal entries yet. Make a POS sale to auto-generate one.</p> : (
                  journals.slice(0, 5).map((j: any) => (
                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(63,63,70,0.3)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{j.ref || 'Journal'}</span>
                      <span style={s.badge(j.status === 'POSTED' ? '#10b981' : '#f59e0b')}>{j.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
