'use client';
import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ErpJournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journals' | 'trial-balance'>('journals');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/v1/erp/accounting/journals`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/v1/erp/accounting/trial-balance`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([j, tb]) => { setJournals(j || []); setTrialBalance(tb || []); setLoading(false); });
  }, []);

  const totalDebit = trialBalance.reduce((s: number, r: any) => s + Number(r.total_debit_cents || 0), 0);
  const totalCredit = trialBalance.reduce((s: number, r: any) => s + Number(r.total_credit_cents || 0), 0);
  const isBalanced = totalDebit === totalCredit;

  const tabStyle = (active: boolean) => ({
    padding: '0.6rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
    background: active ? 'rgba(59,130,246,0.9)' : 'transparent',
    color: active ? '#fff' : '#71717a',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Accounting Ledger
        </h1>
        <p style={{ color: '#71717a', marginBottom: '2rem' }}>Double-entry journal entries and trial balance</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(24,24,27,0.8)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          <button style={tabStyle(activeTab === 'journals')} onClick={() => setActiveTab('journals')}>📒 Journal Entries</button>
          <button style={tabStyle(activeTab === 'trial-balance')} onClick={() => setActiveTab('trial-balance')}>⚖️ Trial Balance</button>
        </div>

        {loading ? <p style={{ color: '#71717a' }}>Loading...</p> : activeTab === 'journals' ? (
          <div style={{ background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(63,63,70,0.25)', color: '#71717a', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Reference</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>No journal entries yet. Journal entries are auto-generated from POS sales.</td></tr>
                ) : journals.map((j: any) => (
                  <tr key={j.id} style={{ borderTop: '1px solid rgba(63,63,70,0.3)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#818cf8' }}>{j.ref || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{j.journal_type}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#71717a' }}>{j.date}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ background: j.status === 'POSTED' ? '#10b98120' : '#f59e0b20', color: j.status === 'POSTED' ? '#10b981' : '#f59e0b', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem' }}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Debits', value: `$${(totalDebit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#3b82f6' },
                { label: 'Total Credits', value: `$${(totalCredit / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: '#8b5cf6' },
                { label: 'Balance Status', value: isBalanced ? '✓ Balanced' : '⚠ Unbalanced', color: isBalanced ? '#10b981' : '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.4)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '0.25rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(63,63,70,0.25)', color: '#71717a', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Code</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Account</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Debit</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Credit</th>
                    <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>No accounts yet. Create accounts in the Chart of Accounts first.</td></tr>
                  ) : trialBalance.map((r: any) => (
                    <tr key={r.code} style={{ borderTop: '1px solid rgba(63,63,70,0.3)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{r.code}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#71717a', fontSize: '0.8rem' }}>{r.account_type}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#3b82f6' }}>${(Number(r.total_debit_cents) / 100).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#8b5cf6' }}>${(Number(r.total_credit_cents) / 100).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: Number(r.net_cents) >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        ${(Math.abs(Number(r.net_cents)) / 100).toFixed(2)}{Number(r.net_cents) < 0 ? ' CR' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
