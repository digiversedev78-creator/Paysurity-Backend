'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Box, MapPin, Package, Calendar, MoreVertical, ShieldCheck, XCircle, CreditCard, Receipt, FileText, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface OrderItem { id: string; name: string; quantity: number; amountCents: number; notes?: string; }
interface Order {
  id: string; customerName: string; customerEmail: string; shippingAddress: string;
  itemCount: number; amountCents: number; status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string; lastUpdatedAt: string; items: OrderItem[]; notes?: string; trackingNumber?: string; shippingCarrier?: string; refundAmountCents?: number;
}

const formatCurrency = (amountCents: number) => `$${(amountCents / 100).toFixed(2)}`;

const ALL_ORDER_STATUSES: Order['status'][] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Calendar },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: MapPin },
  DELIVERED: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: ShieldCheck },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: Receipt },
};

const getNextStatusOptions = (currentStatus: Order['status']): Order['status'][] => {
  switch (currentStatus) {
    case 'PENDING': return ['PROCESSING', 'CANCELLED'];
    case 'PROCESSING': return ['SHIPPED', 'DELIVERED', 'CANCELLED'];
    case 'SHIPPED': return ['DELIVERED', 'CANCELLED'];
    default: return [];
  }
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<Order['status'] | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const mockOrders: Order[] = useMemo(() => [
    { id: 'ORD-001', customerName: 'Alice Smith', customerEmail: 'alice@example.com', shippingAddress: '123 Main St, Anytown', itemCount: 2, amountCents: 2599, status: 'PENDING', createdAt: '2023-10-27T10:00:00Z', lastUpdatedAt: '2023-10-27T10:00:00Z', items: [{ id: '1', name: 'Wireless Mouse', quantity: 1, amountCents: 1599 }, { id: '2', name: 'Keyboard', quantity: 1, amountCents: 1000 }] },
    { id: 'ORD-002', customerName: 'Bob Johnson', customerEmail: 'bob@example.com', shippingAddress: '456 Oak Ave, Otherville', itemCount: 3, amountCents: 7550, status: 'PROCESSING', createdAt: '2023-10-26T14:30:00Z', lastUpdatedAt: '2023-10-27T09:00:00Z', items: [{ id: '3', name: 'Smartwatch', quantity: 1, amountCents: 5000 }, { id: '4', name: 'Screen Protector', quantity: 2, amountCents: 1275 }] },
    { id: 'ORD-003', customerName: 'Charlie Brown', customerEmail: 'charlie@example.com', shippingAddress: '789 Pine Ln, Somewhere', itemCount: 1, amountCents: 12000, status: 'SHIPPED', createdAt: '2023-10-25T08:15:00Z', lastUpdatedAt: '2023-10-26T16:00:00Z', items: [{ id: '5', name: 'Laptop Pro', quantity: 1, amountCents: 12000 }], trackingNumber: 'TRK123456789', shippingCarrier: 'FedEx' },
    { id: 'ORD-004', customerName: 'Diana Prince', customerEmail: 'diana@example.com', shippingAddress: '101 Wonder Ln, Themyscira', itemCount: 1, amountCents: 3500, status: 'DELIVERED', createdAt: '2023-10-24T18:45:00Z', lastUpdatedAt: '2023-10-25T11:30:00Z', items: [{ id: '6', name: 'Coffee Mug', quantity: 1, amountCents: 3500 }] },
  ], []);

  useEffect(() => {
    setTimeout(() => { setOrders(mockOrders); setLoading(false); }, 600);
  }, [mockOrders]);

  const filteredOrders = useMemo(() => selectedStatusFilter === 'ALL' ? orders : orders.filter(o => o.status === selectedStatusFilter), [orders, selectedStatusFilter]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, lastUpdatedAt: new Date().toISOString() } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const printSlip = (order: Order) => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(`<html><body style="font-family:sans-serif;padding:2rem;"><h2>Packing Slip #${order.id}</h2><p>${order.customerName}</p></body></html>`); w.document.close(); }
  };

  return (
    <div className="min-h-screen bg-[#09090B] p-6 lg:p-10 font-sans text-zinc-100 flex flex-col gap-8">
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">Order Management</h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-lg">Track, process, and fulfill customer requests in real-time across your global storefronts.</p>
        </div>
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg backdrop-blur-md items-center shadow-lg">
          <button onClick={() => setSelectedStatusFilter('ALL')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedStatusFilter === 'ALL' ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}>All</button>
          {ALL_ORDER_STATUSES.map(s => (
            <button key={s} onClick={() => setSelectedStatusFilter(s)} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedStatusFilter === s ? 'bg-indigo-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}>{STATUS_CONFIG[s].label}</button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative">
        <motion.div layout className="xl:col-span-2 flex flex-col gap-4">
          {loading ? (
             <div className="flex h-64 items-center justify-center border border-white/10 rounded-2xl bg-white/5"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
          ) : (
             <AnimatePresence>
               {filteredOrders.map(order => (
                 <motion.div key={order.id} layoutId={`card-${order.id}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={() => setSelectedOrder(order)}
                   className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${selectedOrder?.id === order.id ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-xl ${STATUS_CONFIG[order.status].color.split(' ')[0]} border border-white/5 shadow-inner`}>
                        {(() => { const Icon = STATUS_CONFIG[order.status].icon; return <Icon size={24} className="opacity-80"/>; })()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-100">{order.customerName}</h3>
                        <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1"><Box size={14} /> #{order.id} <span className="mx-2">•</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{formatCurrency(order.amountCents)}</p>
                      <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${STATUS_CONFIG[order.status].color}`}>{order.status}</span>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          )}
        </motion.div>

        {/* View Details Sidebar */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="xl:col-span-1 bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-3xl sticky top-8 h-fit flex flex-col gap-6">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1 tracking-tight">Order Details</h2>
                    <p className="text-zinc-500 text-sm">{selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
               </div>

               <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-zinc-300"><MapPin size={18} className="text-indigo-400"/> {selectedOrder.shippingAddress}</div>
                  <div className="flex items-center gap-3 text-zinc-300"><CreditCard size={18} className="text-emerald-400"/> {formatCurrency(selectedOrder.amountCents)} Total</div>
               </div>

               <div>
                 <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">Line Items</h4>
                 <div className="space-y-3">
                   {selectedOrder.items.map(i => (
                     <div key={i.id} className="flex justify-between items-center text-sm p-3 border border-white/5 rounded-lg bg-black/20">
                       <span className="text-zinc-300"><span className="text-zinc-500 mr-2">{i.quantity}x</span> {i.name}</span>
                       <span className="font-medium">{formatCurrency(i.amountCents * i.quantity)}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-3">
                 {getNextStatusOptions(selectedOrder.status).map(s => (
                   <button key={s} onClick={() => updateOrderStatus(selectedOrder.id, s)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-xl text-sm font-semibold tracking-wide uppercase">
                     Mark as {s}
                   </button>
                 ))}
                 <button onClick={() => printSlip(selectedOrder)} className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all rounded-xl text-sm font-bold tracking-wide uppercase text-white flex items-center justify-center gap-2">
                   <FileText size={18}/> Print Packing Slip
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrdersPage;