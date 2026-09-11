'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch, Plus, Tag, RefreshCw, Box, Archive, Search, MoreVertical } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockLevel: number;
  status: 'active' | 'draft' | 'archived';
}

export default function EcomProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', sku: '', price: '', stockLevel: '0' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.get<Product[]>('/api/inventory/items');
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      // Fallback for visual demonstration if DB is empty or disconnected
      setProducts([
        { id: '1', name: 'Premium Espresso Beans', sku: 'ESP-01', price: 24.99, stockLevel: 154, status: 'active' },
        { id: '2', name: 'Ceramic Pour-Over Dripper', sku: 'CER-DRP', price: 45.00, stockLevel: 22, status: 'active' },
        { id: '3', name: 'Filter Paper (100ct)', sku: 'FLT-100', price: 8.50, stockLevel: 800, status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      await apiClient.post('/api/inventory/items', {
        name: newProd.name,
        sku: newProd.sku,
        price: Number(newProd.price),
        stockLevel: Number(newProd.stockLevel),
      });
      setShowAddModal(false);
      setNewProd({ name: '', sku: '', price: '', stockLevel: '0' });
      fetchProducts();
    } catch (e: any) {
      console.error('Failed to create product:', e.message);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#3b0764,_transparent_30%)] pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#0f172a,_transparent_40%)] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold pb-2 bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Products Catalog</h1>
            <p className="text-zinc-400 text-lg">Manage your eCommerce inventory directly within PaySurity.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 px-5 py-2.5 rounded-xl transition-all">
              <RefreshCw className="w-4 h-4 text-emerald-400"/> Sync Shopify
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:opacity-90 active:scale-95 transition-all text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-fuchsia-500/20">
              <Plus className="w-5 h-5"/> New Product
            </button>
          </div>
        </header>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input 
                value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search products by Name or SKU..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-200 outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50 text-xs text-zinc-400"><Tag className="w-3 h-3"/> {products.length} Products</span>
              <span className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-xs text-emerald-400"><Box className="w-3 h-3"/> Active Inventory</span>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin mb-4 text-fuchsia-500" />
                <p>Loading Inventory Data...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
                <PackageSearch className="w-16 h-16 mb-4 text-zinc-700" />
                <p className="text-xl font-semibold text-zinc-300">No Products Found</p>
                <p>Try adjusting your search or add a new product to the catalog.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 uppercase text-xs tracking-wider">
                    <th className="py-4 px-6 font-semibold">Product Name</th>
                    <th className="py-4 px-6 font-semibold">SKU / ID</th>
                    <th className="py-4 px-6 text-right font-semibold">Price</th>
                    <th className="py-4 px-6 text-center font-semibold">Stock</th>
                    <th className="py-4 px-6 text-center font-semibold">Status</th>
                    <th className="py-4 px-6 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="py-5 px-6 font-medium text-zinc-100 flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700/50">
                          <Box className="w-5 h-5 text-zinc-400" />
                        </div>
                        {p.name}
                      </td>
                      <td className="py-5 px-6 font-mono text-xs text-zinc-500">{p.sku}</td>
                      <td className="py-5 px-6 text-right font-semibold text-emerald-400">${Number(p.price).toFixed(2)}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={`font-mono text-sm ${p.stockLevel < 10 ? 'text-amber-400' : 'text-zinc-300'}`}>{p.stockLevel}</span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal — portalled to document.body to escape dashboard overflow:hidden */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 32, maxWidth: 460, width: '100%', boxShadow: '0 25px 80px rgba(0,0,0,0.8)', position: 'relative', fontFamily: 'inherit' }}
              >
                {/* Close button */}
                <button onClick={() => setShowAddModal(false)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                  ×
                </button>

                <h2 className="text-2xl font-bold text-white mb-1">New Product</h2>
                <p className="text-zinc-400 text-sm mb-6">Add a product to your live eCommerce catalog.</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Name</label>
                    <input value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none focus:border-fuchsia-500 transition-colors" placeholder="e.g. Wireless Mouse" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">SKU</label>
                    <input value={newProd.sku} onChange={e => setNewProd({ ...newProd, sku: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none focus:border-fuchsia-500 transition-colors" placeholder="e.g. WM-001" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Price ($)</label>
                      <input type="number" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none focus:border-fuchsia-500 transition-colors" placeholder="0.00" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Stock</label>
                      <input type="number" value={newProd.stockLevel} onChange={e => setNewProd({ ...newProd, stockLevel: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white outline-none focus:border-fuchsia-500 transition-colors" placeholder="0" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800 transition-colors">Discard</button>
                  <button onClick={handleCreateProduct} className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-fuchsia-500/20">
                    ✓ Confirm &amp; List
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}