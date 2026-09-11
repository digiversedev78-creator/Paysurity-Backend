'use client';
import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ErpInventoryPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [whForm, setWhForm] = useState({ name: '', locationType: 'INTERNAL' });
  const [txForm, setTxForm] = useState({ productId: '', sourceWh: '', destWh: '', qty: '', lotNumber: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = () => {
    Promise.all([
      fetch(`${API_BASE}/v1/erp/stock`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/v1/erp/warehouses`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([s, w]) => { setStock(s || []); setWarehouses(w || []); setLoading(false); });
  };

  useEffect(fetchData, []);

  const handleCreateWarehouse = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/v1/erp/warehouses`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(whForm) });
      if (!r.ok) throw new Error();
      setMessage({ type: 'success', text: `Warehouse "${whForm.name}" created.` });
      setShowWarehouseForm(false);
      setWhForm({ name: '', locationType: 'INTERNAL' });
      fetchData();
    } catch { setMessage({ type: 'error', text: 'Failed to create warehouse.' }); }
    finally { setSaving(false); setTimeout(() => setMessage(null), 4000); }
  };

  const handleTransfer = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/v1/erp/stock-moves`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...txForm, qty: Number(txForm.qty) }) });
      if (!r.ok) throw new Error();
      setMessage({ type: 'success', text: 'Stock transfer completed.' });
      setShowTransferForm(false);
      setTxForm({ productId: '', sourceWh: '', destWh: '', qty: '', lotNumber: '' });
      fetchData();
    } catch { setMessage({ type: 'error', text: 'Stock transfer failed.' }); }
    finally { setSaving(false); setTimeout(() => setMessage(null), 4000); }
  };

  const inputStyle = { background: '#09090b', border: '1px solid rgba(63,63,70,0.6)', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#fafafa', width: '100%', fontSize: '0.9rem' };
  const btnPrimary = { background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 700, cursor: 'pointer' };

  const warehouseMap = Object.fromEntries(warehouses.map((w: any) => [w.id, w.name]));

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Inventory Manager</h1>
            <p style={{ color: '#71717a' }}>{warehouses.length} warehouses · {stock.length} stock quants</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowWarehouseForm(!showWarehouseForm)} style={{ ...btnPrimary, background: 'rgba(63,63,70,0.4)', color: '#fafafa' }}>
              🏭 New Warehouse
            </button>
            <button onClick={() => setShowTransferForm(!showTransferForm)} style={btnPrimary}>
              ↔ Transfer Stock
            </button>
          </div>
        </div>

        {message && (
          <div style={{ background: message.type === 'success' ? '#10b98120' : '#ef444420', border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`, borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', color: message.type === 'success' ? '#10b981' : '#ef4444' }}>
            {message.text}
          </div>
        )}

        {showWarehouseForm && (
          <div style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Create Warehouse</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input style={inputStyle} placeholder="Warehouse Name" value={whForm.name} onChange={e => setWhForm({ ...whForm, name: e.target.value })} />
              <select style={inputStyle} value={whForm.locationType} onChange={e => setWhForm({ ...whForm, locationType: e.target.value })}>
                {['INTERNAL', 'VENDOR', 'CUSTOMER', 'TRANSIT', 'VIRTUAL_LOSS'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleCreateWarehouse} disabled={saving || !whForm.name} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating...' : 'Create'}</button>
          </div>
        )}

        {showTransferForm && (
          <div style={{ background: 'rgba(24,24,27,0.95)', border: '1px solid rgba(63,63,70,0.5)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Stock Transfer</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input style={inputStyle} placeholder="Product ID (UUID)" value={txForm.productId} onChange={e => setTxForm({ ...txForm, productId: e.target.value })} />
              <select style={inputStyle} value={txForm.sourceWh} onChange={e => setTxForm({ ...txForm, sourceWh: e.target.value })}>
                <option value="">From Warehouse</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select style={inputStyle} value={txForm.destWh} onChange={e => setTxForm({ ...txForm, destWh: e.target.value })}>
                <option value="">To Warehouse</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <input style={inputStyle} placeholder="Qty" type="number" value={txForm.qty} onChange={e => setTxForm({ ...txForm, qty: e.target.value })} />
            </div>
            <button onClick={handleTransfer} disabled={saving || !txForm.productId || !txForm.sourceWh || !txForm.destWh || !txForm.qty} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? 'Transferring...' : 'Transfer'}</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.4)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(63,63,70,0.3)', fontWeight: 700 }}>Warehouses ({warehouses.length})</div>
            {loading ? <p style={{ padding: '1.5rem', color: '#71717a' }}>Loading...</p> : warehouses.length === 0 ? (
              <p style={{ padding: '1.5rem', color: '#71717a', textAlign: 'center' }}>No warehouses yet. Create one above.</p>
            ) : warehouses.map((w: any) => (
              <div key={w.id} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(63,63,70,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{w.name}</span>
                <span style={{ background: '#3b82f620', color: '#3b82f6', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem' }}>{w.location_type}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(24,24,27,0.9)', border: '1px solid rgba(63,63,70,0.4)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(63,63,70,0.3)', fontWeight: 700 }}>Stock Levels ({stock.length})</div>
            {loading ? <p style={{ padding: '1.5rem', color: '#71717a' }}>Loading...</p> : stock.length === 0 ? (
              <p style={{ padding: '1.5rem', color: '#71717a', textAlign: 'center' }}>No stock records. Transfer inventory to populate.</p>
            ) : stock.map((q: any) => (
              <div key={q.id} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(63,63,70,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#71717a' }}>{q.product_id?.slice(0, 8)}…</span>
                  <span style={{ fontWeight: 700, color: Number(q.quantity) > 0 ? '#10b981' : '#ef4444' }}>{q.quantity} units</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2px' }}>
                  {warehouseMap[q.warehouse_id] || q.warehouse_id?.slice(0, 8)}
                  {q.lot_number ? ` · Lot: ${q.lot_number}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
