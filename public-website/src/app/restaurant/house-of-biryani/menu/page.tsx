'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

const FoodPhotoPlaceholder: React.FC<{ name: string; category?: string }> = ({ name, category }) => {
  const getEmoji = (name: string, cat?: string) => {
    const n = name.toLowerCase();
    const c = cat?.toLowerCase() || '';
    if (n.includes('biryani') || n.includes('rice')) return '🍛';
    if (n.includes('naan') || n.includes('roti') || n.includes('bread')) return '🫓';
    if (n.includes('chicken') || n.includes('mutton') || n.includes('goat') || n.includes('meat')) return '🍗';
    if (n.includes('fish') || n.includes('shrimp') || n.includes('seafood')) return '🍤';
    if (n.includes('paneer') || n.includes('veg') || n.includes('daal')) return '🥗';
    if (n.includes('lassi') || n.includes('tea') || n.includes('soda') || n.includes('water') || c.includes('drinks')) return '🥤';
    if (n.includes('meetha') || n.includes('kheer') || n.includes('jamun') || c.includes('sweet')) return '🍧';
    if (c.includes('paan')) return '🍃';
    
    const emojis = ['🍛','🍲','🍜','🍚','🌶️','🍗','🍖','🍤','🥞','🥐','🍦','☕','🥛','🍪','🥨','🍏','🍊'];
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return Math.abs(h); };
    return emojis[hash(name) % emojis.length];
  };

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
      <span role="img" aria-label={name}>{getEmoji(name, category)}</span>
    </div>
  );
};

const MenuItemCard: React.FC<{ item: MenuItem; category?: string; onAddToCart: (item: MenuItem) => void }> = ({ item, category, onAddToCart }) => (
  <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl border border-gray-100 flex flex-col h-full">
    {item.imageUrl
      ? <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" loading="lazy" />
      : <FoodPhotoPlaceholder name={item.name} category={category} />
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

const MenuCategorySection: React.FC<{ category: MenuCategory; onAddToCart: (item: MenuItem) => void; categoryRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>> }> = ({ category, onAddToCart, categoryRefs }) => {
  const id = category.name.replace(/\s+/g, '-').toLowerCase();
  return (
    <div id={id} ref={el => { categoryRefs.current[id] = el; }} className="mb-14 pt-4 scroll-mt-28">
      <h2 className="text-3xl font-black text-gray-900 mb-6 border-b-2 border-amber-500 pb-3 italic">
        {category.name}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {category.items.map(item => (
          <MenuItemCard key={item.name} item={item} category={category.name} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
};

function MenuContent() {
  const { items: cartItems, addItem, removeItem, updateQuantity, total, count, isOpen: isCartOpen, openCart, closeCart } = useCart();
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const searchParams = useSearchParams();
  const catFilter = searchParams.get('cat');

  useEffect(() => {
    setLoadingMenu(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-44gyeebm6a-uc.a.run.app';
    fetch(`${API_URL}/api/public/microsite/houseofbiryanirestaurant/menu`, { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        const data = json?.success ? json.data : (Array.isArray(json) ? json : []);
        const filteredData = catFilter 
          ? data.filter((i: any) => i.category?.toLowerCase().includes(catFilter.toLowerCase()))
          : data;
        
        const grouped = filteredData.reduce((acc: Record<string, MenuCategory>, item: any) => {
          const cat = item.category || 'Specials';
          if (!acc[cat]) acc[cat] = { name: cat, items: [] };
          acc[cat].items.push({
            name: item.name,
            displayPrice: parseFloat(item.displayPrice ?? item.basePrice ?? 0),
            desc: item.description ?? '',
            imageUrl: item.imageUrl,
            isSignature: item.isFeatured ?? item.isSignature ?? false,
            isVeg: item.isVegetarian ?? item.isVeg ?? false,
          });
          return acc;
        }, {});
        setMenuData(Object.values(grouped));
      })
      .catch(console.error)
      .finally(() => setLoadingMenu(false));
  }, [catFilter]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: slugId(item.name),
      name: item.name,
      price: item.displayPrice,
      imageUrl: item.imageUrl,
      category: catFilter ?? undefined,
    });
    openCart();
  };

  const scrollToCategory = (name: string) => {
    const id = name.replace(/\s+/g, '-').toLowerCase();
    categoryRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <TenantStorefrontLayout config={config} hideHero={true}>
      <nav className="sticky top-16 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-3 py-3">
          {menuData.map(cat => (
            <button key={cat.name} onClick={() => scrollToCategory(cat.name)} className="py-2 px-5 rounded-full text-[11px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-[#8B0000] hover:text-white transition-all whitespace-nowrap">
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-7xl font-black italic text-[#8B0000] mb-4 tracking-tighter uppercase">
            {catFilter ? `${catFilter} Menu` : 'Full Menu'}
          </h1>
          <p className="text-gray-400 text-sm font-medium">Authentic Hyderabadi Cuisine · Chicago, IL</p>
          {catFilter && (
            <Link href="/restaurant/house-of-biryani/menu" className="inline-block mt-6 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition">
              ← View All Categories
            </Link>
          )}
        </div>

        {loadingMenu ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-[2.5rem] h-80 shadow-sm" />)}
          </div>
        ) : (
          <div className="space-y-16">
            {menuData.map(cat => (
              <MenuCategorySection key={cat.name} category={cat} onAddToCart={handleAddToCart} categoryRefs={categoryRefs} />
            ))}
          </div>
        )}
      </main>
    </TenantStorefrontLayout>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center font-black italic text-4xl text-gray-200 uppercase tracking-tighter animate-pulse">Loading Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}