'use client';
import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'COGS'];
const TYPE_COLORS: Record<string, string> = {
  ASSET: '#3b82f6', LIABILITY: '#ef4444', EQUITY: '#8b5cf6',
  INCOME: '#10b981', EXPENSE: '#f59e0b', COGS: '#f97316',
};

export default function ErpAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', accountType: 'ASSET', reconcilable: false });
  const [saving, setSaving] = useState(false);

  const fetchAccounts = () => {
    fetch(`${API_BASE}/v1/erp/accounts`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setAccounts(data || []); setLoading(false); });
  };

  useEffect(fetchAccounts, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/v1/erp/accounts`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ code: '', name: '', accountType: 'ASSET', reconcilable: false });
      fetchAccounts();
    } finally { setSaving(false); }
  };

  const grouped = ACCOUNT_TYPES.reduce((acc, t) => {
    acc[t] = accounts.filter((a: any) => a.account_type === t);
    return acc;
  }, {} as Record<string, any[]>);

  const inputStyle = { background: '#09090b', border: '1px solid rgba(63,63,70,0.6)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#fafafa', width: '100%', fontSize: '0.9rem' };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Chart of Accounts</h1>
            <p style={{ color: '#71717a' }}>{accounts.length} accounts configured</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
            {showForm ? '✕ Cancel' : '+ New Account'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create Account</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input style={inputStyle} placeholder="Code (e.g. 1000)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              <input style={inputStyle} placeholder="Account Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <select style={inputStyle} value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })}>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleCreate} disabled={saving || !form.code || !form.name} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Create Account'}
            </button>
          </div>
        )}

        {loading ? <p style={{ color: '#71717a' }}>Loading accounts...</p> : (
          ACCOUNT_TYPES.map(type => grouped[type].length > 0 && (
            <div key={type} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: TYPE_COLORS[type] }} />
                <h3 style={{ fontWeight: 700, color: TYPE_COLORS[type], fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type}</h3>
                <span style={{ color: '#71717a', fontSize: '0.8rem' }}>({grouped[type].length})</span>
              </div>
              <div style={{ background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.4)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(63,63,70,0.2)', color: '#71717a', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Code</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Reconcilable</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[type].map((a: any) => (
                      <tr key={a.id} style={{ borderTop: '1px solid rgba(63,63,70,0.3)' }}>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: TYPE_COLORS[type] }}>{a.code}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{a.name}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{a.reconcilable ? '✓' : '–'}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <span style={{ background: a.is_active ? '#10b98120' : '#71717a20', color: a.is_active ? '#10b981' : '#71717a', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem' }}>
                            {a.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
