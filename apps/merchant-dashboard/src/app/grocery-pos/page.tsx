"use client";
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../lib/api-client';

interface GroceryItem { 
  id: string; name: string; sku: string; barcode: string; 
  stock_quantity: number; category: string; price_cents: number; image?: string;
  is_weighted: boolean; price_per_lb_cents: number;
  age_restricted: boolean;
}
interface CartItem extends GroceryItem { quantity: number; weight_oz?: number; line_cost_cents: number; }
interface PaymentSplit { method: string; amount_cents: number; paid: boolean; }

export default function GroceryPOSPage() {
  const [products, setProducts] = useState<GroceryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const [activeWeightedItem, setActiveWeightedItem] = useState<GroceryItem | null>(null);
  const [scaleMeasureOz, setScaleMeasureOz] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([]);
  const [splitAmountInput, setSplitAmountInput] = useState('');
  const [cashierAgeVerified, setCashierAgeVerified] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get<any>('/api/grocery/products');
        if (response && response.items) {
          setProducts(response.items);
          setTaxRate(response.taxRate || 0.0825);
        } else if (Array.isArray(response)) {
          setProducts(response);
        }
      } catch (error) {
        console.error('Failed to fetch grocery products:', error);
      }
    };
    fetchProducts();
  }, []);

  const triggerAgeVerification = useCallback(() => {
     if (!cashierAgeVerified) setAuthModalOpen(true);
  }, [cashierAgeVerified]);

  const processAddition = useCallback((item: GroceryItem, weightOz?: number) => {
    if (item.age_restricted && !cashierAgeVerified) {
       triggerAgeVerification();
       return; // Block adding until authorized
    }

    setCart(prev => {
      // If weighted, we always add a new line element
      if (item.is_weighted) {
          const w = weightOz || 0;
          const cost = Math.round((item.price_per_lb_cents / 16) * w);
          return [...prev, { ...item, quantity: 1, weight_oz: w, line_cost_cents: cost }];
      }

      const existing = prev.find(c => c.id === item.id && !c.is_weighted);
      if (existing) {
        if (existing.quantity >= item.stock_quantity) {
          alert(`Cannot oversell! Only ${item.stock_quantity} available.`);
          return prev;
        }
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1, line_cost_cents: (c.quantity + 1) * item.price_cents } : c);
      }
      
      if (item.stock_quantity <= 0) {
        alert("Item is out of stock!");
        return prev;
      }
      return [...prev, { ...item, quantity: 1, line_cost_cents: item.price_cents }];
    });
  }, [cashierAgeVerified, triggerAgeVerification]);

  const addToCart = useCallback((item: GroceryItem) => {
    if (item.is_weighted) {
        setActiveWeightedItem(item);
        setScaleMeasureOz('');
        setScaleModalOpen(true);
    } else {
        processAddition(item);
    }
  }, [processAddition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paymentModalOpen || scaleModalOpen || authModalOpen || processing) return;
      if (e.key === 'Enter') {
        const product = products.find(p => p.barcode === barcodeInput || p.sku === barcodeInput);
        if (product) addToCart(product);
        else if (barcodeInput.trim() !== '') alert('Barcode/SKU not found!');
        setBarcodeInput('');
      } else if (e.key.length === 1 && /[a-zA-Z0-9_-]/.test(e.key)) {
         if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            setBarcodeInput(prev => prev + e.key);
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [barcodeInput, products, paymentModalOpen, scaleModalOpen, authModalOpen, processing, addToCart]);

  const clearCart = () => { setCart([]); setCashierAgeVerified(false); };

  const subtotalCents = cart.reduce((sum, item) => sum + item.line_cost_cents, 0);
  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const splitTotalCents = paymentSplits.reduce((sum, split) => sum + split.amount_cents, 0);
  const balanceDueCents = totalCents - splitTotalCents;

  const handleAddSplit = (method: string) => {
    const amount = splitAmountInput ? Math.round(parseFloat(splitAmountInput) * 100) : balanceDueCents;
    if (amount <= 0 || amount > balanceDueCents) return;
    setPaymentSplits([...paymentSplits, { method, amount_cents: amount, paid: true }]);
    setSplitAmountInput('');
  };

  const handleCheckout = async () => {
    if (balanceDueCents > 0) return alert('Balance is strictly due!');
    setProcessing(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({ 
            itemId: item.id, name: item.name, 
            price_cents: item.price_cents, 
            quantity: item.quantity,
            is_weighted: item.is_weighted,
            price_per_lb_cents: item.price_per_lb_cents,
            weight_oz: item.weight_oz,
            age_restricted: item.age_restricted
        })),
        cashier_age_verified: cashierAgeVerified,
        subtotal_cents: subtotalCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        payments: paymentSplits.map(s => ({ amount_cents: s.amount_cents, method: s.method })),
      };

      const response = await apiClient.post<{ status: string }>('/api/grocery/orders', orderPayload);
      if (response && response.status === 'success') {
        alert('Grocery Checkout Completed Successfully!');
        clearCart();
        setPaymentModalOpen(false);
        setPaymentSplits([]);
        
        const fresh = await apiClient.get<any>('/api/grocery/products');
        if (fresh && fresh.items) setProducts(fresh.items);
      }
    } catch (error: any) {
      alert(`Checkout Error: ${error?.message || 'Transaction Failed'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <div className="flex-1 p-6 flex flex-col items-center border-r border-slate-300 relative">
        <div className="w-full flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">GrocerEase POS</h1>
           <div className="flex gap-4">
             {cashierAgeVerified && <div className="text-sm font-bold p-2 bg-green-100 text-green-800 rounded outline outline-green-500">✅ 21+ VERIFIED</div>}
             <div className="text-sm font-mono p-2 bg-gray-200 rounded">Scanner: {barcodeInput || 'WAITING'}</div>
           </div>
        </div>
        <div className="w-full grid grid-cols-4 gap-4 overflow-y-auto pb-24">
          {products.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="p-4 bg-white rounded-xl shadow cursor-pointer border hover:border-emerald-500 transition relative">
              {item.stock_quantity <= 0 && !item.is_weighted && <div className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-red-500">Out of Stock</div>}
              {item.age_restricted && <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] uppercase font-bold px-1 py-0.5 rounded">21+</div>}
              {item.is_weighted && <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] uppercase font-bold px-1 py-0.5 rounded">SCALE</div>}
              <div className="text-4xl mb-2 text-center">{item.image || '🍎'}</div>
              <div className="font-semibold text-sm truncate">{item.name}</div>
              <div className="text-gray-500 text-xs">Stock: {item.stock_quantity}</div>
              <div className="text-emerald-600 mt-2 font-bold">${((item.is_weighted ? item.price_per_lb_cents : item.price_cents) / 100).toFixed(2)}{item.is_weighted ? '/lb' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-96 bg-white flex flex-col flex-shrink-0 relative">
        <div className="p-6 pb-2 border-b"><h2 className="text-xl font-bold">Register Cart</h2></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <div>
                <div className="font-semibold">{item.name} {item.age_restricted && <span className="text-red-500 text-xs font-bold">[21+]</span>}</div>
                <div className="text-sm text-gray-500">
                  {item.is_weighted 
                     ? `${item.weight_oz} oz @ $${(item.price_per_lb_cents/100).toFixed(2)}/lb`
                     : `x${item.quantity} @ $${(item.price_cents/100).toFixed(2)}`
                  }
                </div>
              </div>
              <div className="font-bold whitespace-nowrap">${(item.line_cost_cents/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-100 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between mb-2"><span className="text-gray-600">Subtotal</span><span className="font-medium">${(subtotalCents / 100).toFixed(2)}</span></div>
          <div className="flex justify-between mb-2"><span className="text-gray-600">Tax</span><span className="font-medium">${(taxCents / 100).toFixed(2)}</span></div>
          <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-3 mb-6"><span>Total</span><span className="text-emerald-600">${(totalCents / 100).toFixed(2)}</span></div>
          <button onClick={() => setPaymentModalOpen(true)} disabled={cart.length === 0} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50">Charge ${(totalCents / 100).toFixed(2)}</button>
        </div>
      </div>

      {/* Scale Input Modal */}
      {scaleModalOpen && activeWeightedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2">Digital Scale</h3>
            <p className="text-gray-600 mb-6">Evaluating: {activeWeightedItem.name}</p>
            <input type="number" autoFocus placeholder="Weight (oz)" value={scaleMeasureOz} onChange={e => setScaleMeasureOz(e.target.value)} className="w-full text-center text-4xl py-4 border-2 border-emerald-500 rounded-xl mb-6 outline-none" />
            <div className="flex w-full gap-3">
               <button onClick={() => setScaleModalOpen(false)} className="flex-1 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
               <button 
                  onClick={() => {
                     const w = parseFloat(scaleMeasureOz);
                     if (w > 0) {
                        processAddition(activeWeightedItem, w);
                        setScaleModalOpen(false);
                     } else alert("Invalid weight");
                  }} 
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Confirm
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Verification Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-red-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 flex flex-col items-center shadow-2xl border-4 border-red-500">
            <div className="text-8xl mb-4">💳</div>
            <h3 className="text-4xl font-black text-red-600 mb-2 uppercase">Verify ID</h3>
            <p className="text-gray-800 text-lg text-center mb-8 font-semibold">You must verify that the customer is at least 21 years of age before selling restricted items.</p>
            <div className="flex w-full gap-4">
               <button onClick={() => { setAuthModalOpen(false); alert('Transaction Halted. Item rejected.'); }} className="flex-1 py-4 bg-gray-200 text-gray-800 font-bold text-xl rounded-xl hover:bg-gray-300">Reject</button>
               <button 
                  onClick={() => {
                     setCashierAgeVerified(true);
                     setAuthModalOpen(false);
                  }} 
                  className="flex-1 py-4 bg-red-600 text-white font-bold text-xl rounded-xl hover:bg-red-700 uppercase">Approve 21+</button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Tender Checkout Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b"><h3 className="text-2xl font-bold">Multi-Tender Checkout</h3></div>
            <div className="p-6 flex-1 text-center bg-gray-50">
              <div className="text-5xl font-black text-emerald-600 mb-2">${(balanceDueCents / 100).toFixed(2)}</div>
              <div className="text-sm text-gray-500 font-semibold uppercase">Remaining Balance</div>
            </div>
            <div className="p-6 border-b flex items-center justify-between">
              <input type="number" placeholder={(balanceDueCents / 100).toFixed(2)} className="flex-1 border py-3 px-4 outline-none text-lg" value={splitAmountInput} onChange={e => setSplitAmountInput(e.target.value)} disabled={balanceDueCents <= 0} />
              <div className="ml-4 flex gap-2">
                <button onClick={() => handleAddSplit('CASH')} disabled={balanceDueCents <= 0} className="bg-green-100 text-green-800 font-bold py-3 px-6 rounded-lg uppercase">Cash</button>
                <button onClick={() => handleAddSplit('CARD')} disabled={balanceDueCents <= 0} className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg uppercase">Card</button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button onClick={() => setPaymentModalOpen(false)} className="py-4 border rounded-xl font-bold">Return</button>
              <button disabled={balanceDueCents > 0 || processing} onClick={handleCheckout} className="py-4 bg-emerald-600 rounded-xl text-white font-bold disabled:opacity-50">Complete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
