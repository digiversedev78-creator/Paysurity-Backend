'use client';

/**
 * Super-Admin God-View: Global Price Change Feed
 *
 * /admin/super/price-god-view
 *
 * Shows ALL price changes across ALL tenants.
 * Allows cross-tenant price overrides via PATCH /api/admin/price/:id.
 * The acting_admin_id is injected server-side — not from this form.
 */
import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface PriceLogEntry {
  id: string;
  item_id: string;
  tenant_id: string;
  item_name: string;
  resolved_item_name?: string;
  old_price_cents: number;
  new_price_cents: number;
  changed_by: string;
  changed_by_role: string;
  acting_admin_id?: string;
  override_reason?: string;
  source: string;
  created_at: string;
}

interface OverrideFormState {
  itemId: string;
  targetTenantId: string;
  itemDisplayName: string;
  currentPrice: number;
}

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

// ── Super-Admin Override Modal ────────────────────────────────────────────────
function AdminOverrideModal({
  form,
  onClose,
  onSaved,
}: {
  form: OverrideFormState;
  onClose: () => void;
  onSaved: (logId: string) => void;
}) {
  const [newCents, setNewCents]     = useState(form.currentPrice);
  const [reason, setReason]         = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleOverride = async () => {
    if (!Number.isInteger(newCents) || newCents < 0) {
      setError('Price must be a non-negative integer (cents).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/price/${form.itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetTenantId:  form.targetTenantId, // ← required by super-admin endpoint
          new_price_cents: newCents,
          override_reason: reason || undefined,
          // NOTE: acting_admin_id is NOT sent — it is FORCED server-side from the admin JWT
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      onSaved(json.audit?.log_entry_id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'linear-gradient(145deg, #0f0c1a, #1a0f2e)', border: '1px solid rgba(251,113,133,0.3)', borderRadius: 24, padding: 36, width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <div>
            <h3 style={{ color: '#f5f3ff', fontSize: 20, fontWeight: 900, margin: 0 }}>Super-Admin Override</h3>
            <p style={{ color: '#fb7185', fontSize: 12, margin: '3px 0 0', fontWeight: 600 }}>CROSS-TENANT PRICE MUTATION · IMMUTABLE AUDIT TRAIL</p>
          </div>
        </div>

        <div style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>
            Item: <strong style={{ color: '#f5f3ff' }}>{form.itemDisplayName}</strong><br />
            Tenant: <code style={{ color: '#fb7185', fontSize: 11 }}>{form.targetTenantId}</code>
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>NEW PRICE (CENTS)</label>
          <input type="number" min={0} step={1} value={newCents} onChange={e => setNewCents(Math.round(Number(e.target.value)))}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1e1b2e', border: '1px solid rgba(251,113,133,0.25)', color: '#f5f3ff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
            = <strong style={{ color: '#c084fc' }}>{cents(newCents)}</strong>
            &nbsp;·&nbsp;was {cents(form.currentPrice)}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#a78bfa', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>OVERRIDE REASON (RECOMMENDED)</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="e.g. Promotional event approved by board Q2-2026"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#1e1b2e', border: '1px solid rgba(167,139,250,0.2)', color: '#f5f3ff', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
          <p style={{ margin: 0, color: '#7c3aed', fontSize: 12, fontWeight: 600 }}>
            🔒 Your Admin ID will be recorded server-side in acting_admin_id.<br />
            This field cannot be overridden or omitted by the API consumer.
          </p>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 12px' }}>⚠ {error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleOverride} disabled={saving} style={{ flex: 2, padding: 14, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #dc2626, #9f1239)', color: '#fff', fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Executing Override…' : `⚡ Override to ${cents(newCents)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SuperAdminPriceGodView() {
  const [log, setLog]               = useState<PriceLogEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [override, setOverride]     = useState<OverrideFormState | null>(null);
  const [since, setSince]           = useState('');
  const [toast, setToast]           = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (since) params.set('since', since);
      const res = await fetch(`${API_BASE}/admin/price/global-log?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setLog(json.data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [since]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  const overrideCount = log.filter(e => e.acting_admin_id).length;
  const tenantCount   = new Set(log.map(e => e.tenant_id)).size;

  return (
    <div style={{ minHeight: '100vh', background: '#08050f', color: '#f5f3ff', fontFamily: "'Inter', sans-serif" }}>
      {override && (
        <AdminOverrideModal
          form={override}
          onClose={() => setOverride(null)}
          onSaved={(logId) => {
            setOverride(null);
            showToast(`⚡ Override executed · Audit entry: ${logId?.slice(0, 8)}…`);
            fetchLog();
          }}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg, #dc2626, #9f1239)', color: '#fff', padding: '14px 24px', borderRadius: 14, fontWeight: 700, zIndex: 100, boxShadow: '0 8px 24px rgba(220,38,38,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ padding: '24px 40px', borderBottom: '1px solid rgba(251,113,133,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #08050f 0%, #140d20 100%)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>
            ⚡ <span style={{ color: '#fb7185' }}>God-View</span> · Price Feed
          </h1>
          <p style={{ margin: '4px 0 0', color: '#7c3aed', fontSize: 13, fontWeight: 600 }}>
            Super-Admin · ALL tenants · ALL items · Immutable audit trail
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input type="datetime-local" value={since.slice(0, 16)} onChange={e => setSince(e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{ padding: '10px 14px', borderRadius: 10, background: '#1a1020', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: 13 }} />
          <button onClick={fetchLog} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)', color: '#fb7185', fontWeight: 700, cursor: 'pointer' }}>↺ Refresh</button>
        </div>
      </header>

      {/* Stats */}
      <div style={{ padding: '24px 40px', display: 'flex', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {[
          { label: 'Total Changes', value: log.length, color: '#c084fc' },
          { label: 'Admin Overrides', value: overrideCount, color: '#fb7185' },
          { label: 'Merchants Affected', value: tenantCount, color: '#34d399' },
          { label: 'Tenant-Admin Changes', value: log.length - overrideCount, color: '#a78bfa' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, background: '#0f0c1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ margin: '0 0 6px', color: '#4b5563', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Global Log Table */}
      <div style={{ padding: 40 }}>
        {loading && <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>⏳ Loading global price feed…</div>}
        {error && <div style={{ textAlign: 'center', padding: 80, color: '#f87171' }}>⚠ {error}<br /><small>Is the API running? Is your admin session active?</small></div>}

        {!loading && !error && (
          <div style={{ background: '#0a0811', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0f0c1a' }}>
                  {['Item', 'Tenant', 'Before', 'After', 'Δ', 'Actor', 'Role', 'Override?', 'When', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#7c3aed', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map(entry => {
                  const d = entry.new_price_cents - entry.old_price_cents;
                  const isAdminOverride = !!entry.acting_admin_id;
                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: isAdminOverride ? 'rgba(251,113,133,0.03)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px', color: '#f5f3ff', fontWeight: 600, maxWidth: 200 }}>{entry.resolved_item_name || entry.item_name}</td>
                      <td style={{ padding: '12px 16px' }}><code style={{ color: '#4b5563', fontSize: 10 }}>{entry.tenant_id?.slice(0, 8)}…</code></td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{cents(entry.old_price_cents)}</td>
                      <td style={{ padding: '12px 16px', color: '#c084fc', fontWeight: 700 }}>{cents(entry.new_price_cents)}</td>
                      <td style={{ padding: '12px 16px', color: d >= 0 ? '#34d399' : '#f87171', fontWeight: 700 }}>{d >= 0 ? '+' : ''}{cents(d)}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: 11 }}>{entry.changed_by?.slice(0, 10)}…</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: isAdminOverride ? 'rgba(251,113,133,0.12)' : 'rgba(124,58,237,0.12)', color: isAdminOverride ? '#fb7185' : '#a78bfa' }}>
                          {entry.changed_by_role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {isAdminOverride ? (
                          <span title={`Admin: ${entry.acting_admin_id}\nReason: ${entry.override_reason || 'none'}`} style={{ color: '#fb7185', fontSize: 16 }}>⚡</span>
                        ) : (
                          <span style={{ color: '#4b5563' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#4b5563', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(entry.created_at).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => setOverride({ itemId: entry.item_id, targetTenantId: entry.tenant_id, itemDisplayName: entry.resolved_item_name || entry.item_name, currentPrice: entry.new_price_cents })}
                          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'rgba(251,113,133,0.1)', color: '#fb7185', fontWeight: 700, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>
                          ⚡ Override
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {log.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: '#4b5563' }}>No price changes recorded yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
