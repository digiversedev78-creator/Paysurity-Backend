'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle, Search, AlertCircle, X, Camera, Upload } from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import PhotoEnhancer from '../../../components/PhotoEnhancer';

const DEMO_TENANT_ID = 'test-tenant-123';

interface MenuItem { id: string; name: string; category: string; basePrice: number; active: boolean; image?: string; tenantId: string; }
interface MenuItemFormState { name: string; category: string; basePrice: number; active: boolean; image: string; }

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const calculateDisplayPrice = (basePriceCents: number) => basePriceCents * 1.05 * 1.20;

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Appetizers', 'Mains', 'Desserts', 'Beverages']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MenuItemFormState>({ name: '', category: '', basePrice: 0, active: true, image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rawPhoto, setRawPhoto] = useState<string | null>(null); // intercept before enhancer
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = await apiClient.get<MenuItem[]>(`/menu/items?tenantId=${DEMO_TENANT_ID}`);
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (err: any) {
      // Fallback mocks for UI Demonstration if API fails
      setMenuItems([
        { id: '1', name: 'Wagyu Burger', category: 'Mains', basePrice: 1800, active: true, tenantId: DEMO_TENANT_ID, image: '🍔' },
        { id: '2', name: 'Truffle Fries', category: 'Appetizers', basePrice: 850, active: true, tenantId: DEMO_TENANT_ID, image: '🍟' },
        { id: '3', name: 'Matcha Latte', category: 'Beverages', basePrice: 550, active: false, tenantId: DEMO_TENANT_ID, image: '🍵' },
      ]);
      console.warn('Using mock data, fetch failed:', err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [menuItems, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    const payload = { ...formData, basePrice: Math.round(formData.basePrice), tenantId: DEMO_TENANT_ID };
    try {
      if (isEditing && editingItemId) {
        await apiClient.put(`/menu/items/${editingItemId}`, payload);
      } else {
        await apiClient.post('/menu/items', payload);
      }
      setIsModalOpen(false); setFormData({ name: '', category: '', basePrice: 0, active: true, image: '' }); setIsEditing(false); setEditingItemId(null);
      await fetchData();
    } catch (err: any) {
      setError(`Failed to save: ${err.message}`);
    } finally { setLoading(false); }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({ name: item.name, category: item.category, basePrice: item.basePrice, active: item.active, image: item.image || '' });
    setIsEditing(true); setEditingItemId(item.id); setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    setLoading(true);
    try { await apiClient.delete(`/menu/items/${id}?tenantId=${DEMO_TENANT_ID}`); await fetchData(); }
    catch (err: any) { setError('Failed to delete item.'); }
    finally { setLoading(false); }
  };

  const toggleActive = async (item: MenuItem) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
    try { await apiClient.put(`/menu/items/${item.id}`, { ...item, active: !item.active }); }
    catch (err) { setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, active: item.active } : i)); }
  };

  return (
    <div className="min-h-screen bg-[#09090B] p-6 lg:p-10 font-sans text-zinc-100 flex flex-col gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Menu Engineering</h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-lg">Optimize your offerings, adjust dynamic pricing, and control item availability instantly.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input type="text" placeholder="Search menu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <button onClick={() => { setIsEditing(false); setFormData({ name: '', category: '', basePrice: 0, active: true, image: '' }); setIsModalOpen(true); }} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-semibold rounded-xl transition-all flex items-center gap-2 text-sm whitespace-nowrap">
            <Plus size={18} /> Add Item
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} /> <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Grid */}
      {loading && menuItems.length === 0 ? (
        <div className="flex h-64 items-center justify-center border border-white/10 rounded-2xl bg-white/5"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map(item => (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-2xl border transition-all duration-300 relative group ${item.active ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-black/20 border-white/5 grayscale-[50%]'}`}>
                
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 shadow-inner flex items-center justify-center text-3xl overflow-hidden shrink-0">
                    {item.image ? (item.image.startsWith('http') ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/> : item.image) : <ImageIcon size={24} className="text-zinc-600"/> }
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                       <h3 className="text-lg font-bold text-zinc-100 truncate pr-2">{item.name}</h3>
                       <div onClick={() => toggleActive(item)} className={`w-10 h-5 rounded-full relative cursor-pointer shrink-0 transition-colors ${item.active ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                         <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${item.active ? 'left-6' : 'left-1'}`} />
                       </div>
                     </div>
                     <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mt-1">{item.category}</p>
                     
                     <div className="mt-4 flex items-end justify-between">
                       <div>
                         <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-0.5">Base</p>
                         <p className="text-sm text-zinc-400 font-medium">{fmt(item.basePrice)}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-0.5">Retail</p>
                         <p className="text-xl font-black text-white">{fmt(calculateDisplayPrice(item.basePrice))}</p>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => handleEdit(item)} className="p-3 bg-white/10 hover:bg-indigo-500 rounded-xl text-white transition-colors shadow-lg"><Edit2 size={20}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-3 bg-white/10 hover:bg-rose-500 rounded-xl text-white transition-colors shadow-lg"><Trash2 size={20}/></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center border border-white/5 border-dashed rounded-3xl bg-white/[0.02]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="text-zinc-600" size={24}/></div>
              <h3 className="text-lg font-bold text-zinc-300">No items found</h3>
              <p className="text-zinc-500 text-sm mt-1">Try adjusting your search query or add a new item.</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-indigo-300">{isEditing ? 'Edit Item' : 'New Menu Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/10"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Item Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-white transition-colors" placeholder="e.g. Wagyu Burger" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Category</label>
                    <input type="text" list="categories" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-white transition-colors" placeholder="e.g. Mains" />
                    <datalist id="categories">{categories.map(c => <option key={c} value={c}/>)}</datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Base Cost (cents)</label>
                    <input type="number" required min="0" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)||0})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-white transition-colors" placeholder="1800" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Item Photo</label>
                  {/* Preview */}
                  {formData.image && (
                    <div className="w-full h-36 rounded-xl mb-3 overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center">
                      {formData.image.startsWith('http') || formData.image.startsWith('data:')
                        ? <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                        : <span className="text-5xl">{formData.image}</span>}
                    </div>
                  )}
                  {/* Mobile-first: Camera + Upload + URL */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Camera capture — on mobile opens phone camera directly */}
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = ev => setRawPhoto(ev.target?.result as string);
                        reader.readAsDataURL(f);
                      }} />
                    <button type="button" onClick={() => cameraRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 bg-black/40 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-zinc-300 hover:text-white text-sm font-semibold rounded-xl transition-all">
                      <Camera size={16} /> Take Photo
                    </button>
                    {/* File upload — opens photo library on mobile */}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = ev => setRawPhoto(ev.target?.result as string);
                        reader.readAsDataURL(f);
                      }} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="flex items-center justify-center gap-2 py-3 bg-black/40 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-zinc-300 hover:text-white text-sm font-semibold rounded-xl transition-all">
                      <Upload size={16} /> Upload
                    </button>
                  </div>
                  {/* URL or emoji fallback */}
                  <input type="text" value={formData.image.startsWith('data:') ? '' : formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-white transition-colors text-sm"
                    placeholder="or paste image URL / type an emoji 🍔" />
                </div>
                <div className="flex items-center gap-4 mt-2 p-4 border border-white/5 rounded-xl bg-white/[0.02]">
                  <div onClick={() => setFormData({...formData, active: !formData.active})} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${formData.active ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.active ? 'left-7' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-300">Item is active and available for sale</span>
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-bold rounded-xl transition-all flex items-center justify-center">
                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/> : <><CheckCircle size={18} className="mr-2"/> Save Item</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Photo Inspector overlay ── appears whenever a photo is taken/uploaded ── */}
      <AnimatePresence>
        {rawPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm"
            >
              <PhotoEnhancer
                src={rawPhoto}
                onAccept={(finalImg) => {
                  setFormData(prev => ({ ...prev, image: finalImg }));
                  setRawPhoto(null);
                }}
                onRetake={() => {
                  setRawPhoto(null);
                  // Re-open camera or file picker depending on last used
                  cameraRef.current?.click();
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}