'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useCart, slugId } from '../../../../context/CartContext';
import TenantStorefrontLayout from '../../../../components/TenantStorefrontLayout';
import { storefrontConfig as config } from '../config';

interface MenuItem {
  name: string;
  displayPrice: number;
  desc: string;
  imageUrl?: string;
  isSignature?: boolean;
  isVeg?: boolean;
}

const FoodPhotoPlaceholder: React.FC<{ name: string }> = ({ name }) => {
  const emojis = ['🍛','🍲','🍜','🍚','🌶️','🍗','🍖','🍤','🥞','🥐','🍦','☕','🥛','🍪','🥨','🍏','🍊'];
  const colors = [
    'bg-gradient-to-br from-red-600 to-orange-500',
    'bg-gradient-to-br from-green-600 to-lime-500',
    'bg-gradient-to-br from-purple-600 to-pink-500',
    'bg-gradient-to-br from-blue-600 to-cyan-500',
    'bg-gradient-to-br from-yellow-600 to-orange-400',
    'bg-gradient-to-br from-teal-600 to-blue-500',
    'bg-gradient-to-br from-fuchsia-600 to-rose-500',
  ];
  const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return Math.abs(h); };
  return (
    <div className={`w-full h-32 rounded-t-lg flex items-center justify-center text-4xl mb-4 ${colors[hash(name + 'color') % colors.length]}`}>
      <span role="img" aria-label={name}>{emojis[hash(name) % emojis.length]}</span>
    </div>
  );
};

const MenuItemCard: React.FC<{ item: MenuItem; onAddToCart: (item: MenuItem) => void }> = ({ item, onAddToCart }) => (
  <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-100 flex flex-col h-full">
    {item.imageUrl
      ? <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" loading="lazy" />
      : <FoodPhotoPlaceholder name={item.name} />
    }
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-lg font-bold text-[#8B0000] leading-tight flex-1 italic tracking-tight">{item.name}</h3>
        <p className="text-xl font-black text-[#F59E0B] shrink-0">${item.displayPrice.toFixed(2)}</p>
      </div>
      <p className="text-sm text-gray-500 mb-4 flex-grow leading-relaxed">{item.desc}</p>
      <button
        onClick={() => onAddToCart(item)}
        className="mt-auto bg-[#8B0000] text-white py-3 px-6 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#b91c1c] transition-all duration-200 shadow-md active:scale-95"
      >
        + Add to Cart
      </button>
    </div>
  </div>
);

function CateringContent() {
  const { addItem, openCart } = useCart();
  const [cateringItems, setCateringItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    guestCount: '',
    notes: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-44gyeebm6a-uc.a.run.app';
    fetch(`${API_URL}/api/public/microsite/houseofbiryanirestaurant/menu`, { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        const data = json?.success ? json.data : (Array.isArray(json) ? json : []);
        const filtered = data.filter((i: any) => i.category === 'Catering').map((i: any) => ({
          name: i.name,
          displayPrice: parseFloat(i.displayPrice ?? i.basePrice ?? 0),
          desc: i.description ?? '',
          imageUrl: i.imageUrl,
        }));
        setCateringItems(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: slugId(item.name),
      name: item.name,
      price: item.displayPrice,
      imageUrl: item.imageUrl,
      category: 'Catering',
    });
    openCart();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      // Simulate/actual API call
      await new Promise(r => setTimeout(r, 1000));
      setFormStatus('success');
      setFormMessage('Thank you for your inquiry! We will contact you shortly.');
      setFormData({ name: '', email: '', phone: '', eventDate: '', guestCount: '', notes: '' });
    } catch (err) {
      setFormStatus('error');
      setFormMessage('Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <TenantStorefrontLayout config={config} hideHero={true}>
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-7xl font-black italic text-[#8B0000] mb-4 tracking-tighter uppercase">
            Catering & Events
          </h1>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Premium Service · Chicago, IL</p>
        </div>

        <div className="bg-amber-50 border-l-8 border-amber-500 p-8 mb-16 rounded-r-3xl shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="text-5xl">📢</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-amber-900 mb-1 italic">Important Ordering Notice</h3>
            <p className="text-amber-800/80 text-sm">48-hour advance notice and 25% deposit required for all catering orders. Custom menu options available upon request.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black text-gray-900 mb-8 border-b-2 border-amber-500 pb-3 italic">
              Specialty Trays
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-80" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cateringItems.map(item => (
                  <MenuItemCard key={item.name} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="sticky top-24">
              <div className="bg-[#8B0000] rounded-[3rem] p-10 text-white shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
                
                <h2 className="text-3xl font-black mb-2 italic tracking-tighter relative z-10">Plan Your Event</h2>
                <p className="text-white/40 text-[10px] mb-10 uppercase tracking-[0.3em] font-black relative z-10">Inquiry Form</p>
                
                {formStatus === 'success' ? (
                  <div className="bg-white/10 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/20 text-center relative z-10">
                    <p className="text-xl font-black mb-4 italic">Request Sent!</p>
                    <p className="text-white/70 text-sm">{formMessage}</p>
                    <button onClick={() => setFormStatus('idle')} className="mt-6 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition">Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Organizer Name" />
                    </div>
                    <div className="space-y-2">
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Email Address" />
                    </div>
                    <div className="space-y-2">
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Phone Number" />
                    </div>
                    <div className="space-y-2">
                      <input required type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 h-28 resize-none transition-all" placeholder="Event Details..." />
                    </div>
                    <button type="submit" disabled={formStatus === 'submitting'} className="w-full bg-amber-500 text-[#8B0000] py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-50">
                      {formStatus === 'submitting' ? 'Sending...' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </TenantStorefrontLayout>
  );
}

export default function CateringPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-black italic text-4xl text-gray-200 uppercase tracking-tighter animate-pulse">Loading Catering...</div>}>
      <CateringContent />
    </Suspense>
  );
}