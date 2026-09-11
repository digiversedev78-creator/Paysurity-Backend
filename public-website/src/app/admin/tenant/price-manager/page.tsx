'use client';

/**
 * Tenant-Admin Price & Inventory Manager — Finality Edition
 *
 * /admin/tenant/price-manager
 *
 * Capabilities:
 *   1. Browse catalog with live sentry badges (🔴 CRITICAL / ⚠ LOW / 🟡 WARN)
 *   2. Edit price (PATCH /merchant/items/:id/price)
 *   3. Edit apparel variant metadata (fabric, season, color, bridal_wear)
 *   4. Set per-item low_stock_threshold (PATCH /merchant/inventory/:id/threshold)
 *   5. Item change log panel — unified PRICE + METADATA + STOCK history
 */
import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RetailItem {
  id: string;
  name: string;
  price_cents: number;
  category: string;
  stock_quantity: number;
  low_stock_threshold: number;
  // from sentry scan
  severity?: 'CRITICAL' | 'LOW' | 'WARN' | null;
  stock_pct?: number;
}

interface ChangeLogEntry {
  id: string;
  item_name: string;
  change_type: string;
  changed_fields: Record<string, { old: any; new: any }> | null;
  old_price_cents: number;
  new_price_cents: number;
  changed_by: string;
  changed_by_role: string;
  created_at: string;
}

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

function severityChip(item: RetailItem) {
  if (!item.severity) return null;
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    CRITICAL: { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444', label: '🔴 OUT' },
    LOW:      { bg: 'rgba(251,113,133,0.12)', color: '#fb7185', label: '⚠ LOW' },
    WARN:     { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', label: '🟡 WARN' },
  };
  const s = cfg[item.severity];
  return (
    <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 800, background: s.bg, color: s.color, letterSpacing: '0.05em' }}>
      {s.label} · {item.stock_quantity}/{item.low_stock_threshold}
    </span>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditItemModal({ item, onClose, onSaved }: {
  item: RetailItem;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [tab, setTab]           = useState<'price'|'meta'|'stock'>('price');
  const [priceCents, setPrice]  = useState(item.price_cents);
  const [threshold, setThresh]  = useState(item.low_stock_threshold ?? 10);
  // Apparel meta fields
  const [size, setSize]         = useState('');
  const [color, setColor]       = useState('');
  const [newFabric, setFabric]  = useState('');
  const [newSeason, setSeason]  = useState('');
  const [bridal, setBridal]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string|null>(null);

  const save = async () => {
    setSaving(true); setError(null);
    try {
      if (tab === 'price') {
        const res = await fetch(`${API}/merchant/items/${item.id}/price`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_price_cents: priceCents }),
        });
        if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.message || `HTTP ${res.status}`); }
        const j = await res.json();
        onSaved(`✓ Price updated · Log: ${j.audit?.log_entry_id?.slice(0,8)}…`);
      } else if (tab === 'meta') {
        if (!size || !color) throw new Error('size and color are required to identify variant');
        const body: Record<string,any> = { size, color };
        if (newFabric) body.new_fabric = newFabric;
        if (newSeason) body.new_season = newSeason;
        body.new_bridal_wear = bridal;
        const res = await fetch(`${API}/merchant/items/${item.id}/variant-meta`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.message || `HTTP ${res.status}`); }
        const j = await res.json();
        const fields = Object.keys(j.audit?.changed_fields ?? {}).join(', ') || 'no changes';
        onSaved(`✓ Metadata updated [${fields}] · Log: ${j.audit?.log_entry_id?.slice(0,8)}…`);
      } else {
        const res = await fetch(`${API}/merchant/inventory/${item.id}/threshold`, {
          method: 'PATCH', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threshold }),
        });
        if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.message || `HTTP ${res.status}`); }
        const j = await res.json();
        onSaved(`✓ Threshold set to ${threshold} · Log: ${j.audit?.log_entry_id?.slice(0,8)}…`);
      }
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'price', label: '💰 Price'    },
    { id: 'meta',  label: '🏷 Metadata' },
    { id: 'stock', label: '📦 Sentry'   },
  ] as const;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', zIndex:80, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={onClose}>
      <div style={{ background:'linear-gradient(145deg,#0f0c1a,#1a142e)', border:'1px solid rgba(167,139,250,0.3)', borderRadius:24, padding:36, width:'100%', maxWidth:520 }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ color:'#f5f3ff', fontSize:18, fontWeight:900, margin:'0 0 4px' }}>{item.name}</h3>
        <p style={{ color:'#7c3aed', fontSize:12, margin:'0 0 20px' }}>{item.category}</p>

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, padding:'9px 0', borderRadius:10, border:'none', fontWeight:700, fontSize:12, cursor:'pointer',
                background: tab===t.id ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.05)',
                color: tab===t.id ? '#fff' : '#6b7280' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Price Tab */}
        {tab === 'price' && (
          <div>
            <label style={{ color:'#a78bfa', fontSize:11, fontWeight:700, letterSpacing:'0.1em', display:'block', marginBottom:8 }}>NEW PRICE (CENTS)</label>
            <input type="number" min={0} step={1} value={priceCents} onChange={e=>setPrice(Math.round(Number(e.target.value)))}
              style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'#1e1b2e', border:'1px solid rgba(167,139,250,0.2)', color:'#f5f3ff', fontSize:15, outline:'none', boxSizing:'border-box' }} />
            <p style={{ color:'#6b7280', fontSize:12, marginTop:6 }}>= <strong style={{ color:'#c084fc' }}>{cents(priceCents)}</strong> · was {cents(item.price_cents)}</p>
          </div>
        )}

        {/* Metadata Tab */}
        {tab === 'meta' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label:'SIZE (key)',  val:size,      set:setSize,   placeholder:'e.g. M' },
              { label:'COLOR (key)', val:color,     set:setColor,  placeholder:'e.g. Crimson Red' },
              { label:'NEW FABRIC',  val:newFabric, set:setFabric, placeholder:'e.g. Silk' },
              { label:'NEW SEASON',  val:newSeason, set:setSeason, placeholder:'e.g. Fall/Winter' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ color:'#a78bfa', fontSize:10, fontWeight:700, letterSpacing:'0.1em', display:'block', marginBottom:6 }}>{f.label}</label>
                <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, background:'#1e1b2e', border:'1px solid rgba(167,139,250,0.2)', color:'#f5f3ff', fontSize:13, outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="bridal" checked={bridal} onChange={e=>setBridal(e.target.checked)} style={{ width:16, height:16, accentColor:'#7c3aed' }} />
              <label htmlFor="bridal" style={{ color:'#a78bfa', fontSize:13, fontWeight:600 }}>Bridal Wear</label>
            </div>
            <p style={{ gridColumn:'1/-1', color:'#4b5563', fontSize:11, margin:0 }}>size + color identify the variant. Only filled fields are updated.</p>
          </div>
        )}

        {/* Stock / Sentry Tab */}
        {tab === 'stock' && (
          <div>
            <div style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
              <p style={{ margin:0, color:'#fbbf24', fontSize:13, fontWeight:600 }}>
                Current stock: <strong>{item.stock_quantity}</strong> units · Current threshold: <strong>{item.low_stock_threshold}</strong>
              </p>
            </div>
            <label style={{ color:'#a78bfa', fontSize:11, fontWeight:700, letterSpacing:'0.1em', display:'block', marginBottom:8 }}>LOW STOCK ALERT THRESHOLD</label>
            <input type="number" min={0} step={1} value={threshold} onChange={e=>setThresh(Math.round(Number(e.target.value)))}
              style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:'#1e1b2e', border:'1px solid rgba(251,191,36,0.25)', color:'#f5f3ff', fontSize:15, outline:'none', boxSizing:'border-box' }} />
            <p style={{ color:'#6b7280', fontSize:12, marginTop:6 }}>
              Alert fires when stock ≤ {threshold} · Severity: {item.stock_quantity === 0 ? '🔴 CRITICAL' : item.stock_quantity <= Math.floor(threshold * 0.5) ? '⚠ LOW' : '🟡 WARN'}
            </p>
          </div>
        )}

        {error && <p style={{ color:'#f87171', fontSize:13, margin:'12px 0 0' }}>⚠ {error}</p>}

        <div style={{ display:'flex', gap:12, marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1, padding:14, borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#94a3b8', fontWeight:700, cursor:'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex:2, padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', fontWeight:900, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TenantPriceManager() {
  const [items, setItems]       = useState<RetailItem[]>([]);
  const [log, setLog]           = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string|null>(null);
  const [editItem, setEdit]     = useState<RetailItem|null>(null);
  const [toast, setToast]       = useState<string|null>(null);
  const [logFilter, setLogFilter] = useState<string>('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 5000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, sentryRes, logRes] = await Promise.all([
        fetch(`${API}/tenant-admin/items`, { credentials: 'include' }),
        fetch(`${API}/merchant/inventory/low-stock?limit=100`, { credentials: 'include' }),
        fetch(`${API}/merchant/items/price-log?limit=100`, { credentials: 'include' }),
      ]);

      // Catalog
      const cat = catRes.ok ? await catRes.json() : { data: [] };
      const catalog: RetailItem[] = cat.data ?? [];

      // Merge sentry data
      const sentryData = sentryRes.ok ? (await sentryRes.json()).data ?? [] : [];
      const sentryMap = new Map(sentryData.map((s: any) => [s.id, s]));
      const merged = catalog.map((item: RetailItem) => ({
        ...item,
        ...(sentryMap.get(item.id) ?? {}),
      }));
      setItems(merged);

      // Log
      if (logRes.ok) { const lg = await logRes.json(); setLog(lg.data ?? []); }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = (msg: string) => { setEdit(null); showToast(msg); fetchAll(); };

  const critCount = items.filter(i => i.severity === 'CRITICAL').length;
  const lowCount  = items.filter(i => i.severity === 'LOW').length;
  const warnCount = items.filter(i => i.severity === 'WARN').length;

  const filteredLog = logFilter
    ? log.filter(e => e.change_type === logFilter)
    : log;

  return (
    <div style={{ minHeight:'100vh', background:'#0a0811', color:'#f5f3ff', fontFamily:"'Inter',sans-serif" }}>
      {editItem && <EditItemModal item={editItem} onClose={() => setEdit(null)} onSaved={handleSaved} />}

      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', padding:'14px 24px', borderRadius:14, fontWeight:700, zIndex:100 }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ padding:'24px 40px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:'#e9d5ff' }}>Price & Inventory Manager</h1>
          <p style={{ margin:'4px 0 0', color:'#7c3aed', fontSize:13, fontWeight:600 }}>Tenant Admin · Finality Edition · OP-POSRET-02 + OP-POSRET-03</p>
        </div>
        <button onClick={fetchAll} style={{ padding:'10px 20px', borderRadius:12, border:'1px solid rgba(124,58,237,0.35)', background:'rgba(124,58,237,0.1)', color:'#a78bfa', fontWeight:700, cursor:'pointer' }}>↺ Refresh</button>
      </header>

      {/* Sentry Summary */}
      {(critCount + lowCount + warnCount) > 0 && (
        <div style={{ padding:'16px 40px', background:'rgba(239,68,68,0.04)', borderBottom:'1px solid rgba(239,68,68,0.1)', display:'flex', gap:12 }}>
          {critCount > 0 && <span style={{ padding:'6px 14px', borderRadius:100, background:'rgba(239,68,68,0.12)', color:'#ef4444', fontWeight:700, fontSize:13 }}>🔴 {critCount} OUT OF STOCK</span>}
          {lowCount  > 0 && <span style={{ padding:'6px 14px', borderRadius:100, background:'rgba(251,113,133,0.12)', color:'#fb7185', fontWeight:700, fontSize:13 }}>⚠ {lowCount} LOW</span>}
          {warnCount > 0 && <span style={{ padding:'6px 14px', borderRadius:100, background:'rgba(251,191,36,0.1)', color:'#fbbf24', fontWeight:700, fontSize:13 }}>🟡 {warnCount} WARN</span>}
        </div>
      )}

      <div style={{ padding:40, maxWidth:1400, margin:'0 auto' }}>
        {loading && <div style={{ textAlign:'center', padding:80, color:'#6b7280' }}>⏳ Loading…</div>}
        {error   && <div style={{ textAlign:'center', padding:80, color:'#f87171' }}>⚠ {error}</div>}

        {!loading && !error && (
          <>
            {/* Catalog */}
            <section>
              <h2 style={{ color:'#a78bfa', fontSize:13, fontWeight:700, letterSpacing:'0.1em', marginBottom:16 }}>CATALOG — {items.length} ITEMS</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
                {items.map(item => (
                  <div key={item.id} style={{
                    background:'linear-gradient(145deg,#0f0c1a,#170e30)',
                    border: item.severity === 'CRITICAL' ? '1px solid rgba(239,68,68,0.3)' :
                            item.severity === 'LOW'      ? '1px solid rgba(251,113,133,0.25)' :
                            item.severity === 'WARN'     ? '1px solid rgba(251,191,36,0.2)' :
                                                           '1px solid rgba(124,58,237,0.12)',
                    borderRadius:16, padding:20,
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <span style={{ padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:700, background:'rgba(124,58,237,0.12)', color:'#a78bfa' }}>{item.category}</span>
                      {severityChip(item)}
                    </div>
                    <h3 style={{ margin:'0 0 4px', fontSize:14, fontWeight:800, color:'#f5f3ff', lineHeight:1.3 }}>{item.name}</h3>
                    <p style={{ margin:'0 0 12px', fontSize:22, fontWeight:900, color:'#c084fc' }}>{cents(item.price_cents)}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#4b5563', marginBottom:14 }}>
                      <span>Stock: {item.stock_quantity}</span>
                      <span>Alert: ≤{item.low_stock_threshold ?? 10}</span>
                    </div>
                    <button onClick={() => setEdit(item)} style={{ width:'100%', padding:'9px 0', borderRadius:9, border:'none', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:13 }}>
                      ✎ Edit
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Unified Change Log */}
            <section style={{ marginTop:48 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h2 style={{ color:'#a78bfa', fontSize:13, fontWeight:700, letterSpacing:'0.1em', margin:0 }}>ITEM CHANGE LOG — {filteredLog.length} ENTRIES</h2>
                <div style={{ display:'flex', gap:8 }}>
                  {['', 'PRICE', 'METADATA', 'STOCK'].map(f => (
                    <button key={f} onClick={() => setLogFilter(f)} style={{ padding:'5px 12px', borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer',
                      background: logFilter===f ? '#7c3aed' : 'rgba(255,255,255,0.05)', color: logFilter===f ? '#fff' : '#6b7280' }}>
                      {f || 'ALL'}
                    </button>
                  ))}
                </div>
              </div>
              {filteredLog.length === 0 ? (
                <p style={{ color:'#4b5563' }}>No change log entries yet.</p>
              ) : (
                <div style={{ background:'#0f0c1a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                        {['Item', 'Type', 'Changes', 'Actor', 'When'].map(h => (
                          <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'#7c3aed', fontWeight:700, fontSize:11, letterSpacing:'0.1em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLog.map(entry => {
                        const typeColor = entry.change_type === 'PRICE' ? '#c084fc' : entry.change_type === 'METADATA' ? '#34d399' : '#fbbf24';
                        return (
                          <tr key={entry.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding:'11px 16px', color:'#f5f3ff', fontWeight:600 }}>{entry.item_name}</td>
                            <td style={{ padding:'11px 16px' }}>
                              <span style={{ padding:'2px 8px', borderRadius:100, fontSize:10, fontWeight:800, background:'rgba(255,255,255,0.05)', color:typeColor }}>{entry.change_type}</span>
                            </td>
                            <td style={{ padding:'11px 16px', color:'#94a3b8', fontSize:11, maxWidth:280 }}>
                              {entry.changed_fields
                                ? Object.entries(entry.changed_fields).map(([k, v]) =>
                                    <span key={k} style={{ display:'inline-block', marginRight:6 }}>
                                      <strong style={{ color:'#a78bfa' }}>{k}</strong>: {String(v.old)} → <strong style={{ color:'#34d399' }}>{String(v.new)}</strong>
                                    </span>)
                                : entry.change_type === 'PRICE'
                                  ? <span>Price: {cents(entry.old_price_cents)} → <strong style={{ color:'#34d399' }}>{cents(entry.new_price_cents)}</strong></span>
                                  : '—'}
                            </td>
                            <td style={{ padding:'11px 16px', color:'#6b7280', fontFamily:'monospace', fontSize:10 }}>{entry.changed_by?.slice(0,10)}…</td>
                            <td style={{ padding:'11px 16px', color:'#4b5563', fontSize:10, whiteSpace:'nowrap' }}>{new Date(entry.created_at).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
