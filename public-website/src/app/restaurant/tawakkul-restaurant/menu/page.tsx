'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storefrontConfig as config } from '../config';

// --- Type Definitions ---
interface MenuItem {
  name: string;
  displayPrice: number;
  desc: string;
  isSignature?: boolean;
  isVeg?: boolean;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface CartItem extends MenuItem {
  quantity: number;
}

// Legacy array removed. Menu data is now fetched from the live database.

// --- Helper for Premium Food Photography Placeholders ---
const foodEmojis = ['🍚', '🍗', '🍲', '🍜', '🌶️', '🍢', '🍮', '🥗', '🥘', '🥣'];
const getRandomEmoji = () => foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
const getRandomGradient = () => {
  const gradients = [
    'from-amber-200 to-orange-300',
    'from-emerald-200 to-lime-300',
    'from-blue-200 to-cyan-300',
    'from-purple-200 to-fuchsia-300',
    'from-rose-200 to-pink-300',
    'from-indigo-200 to-violet-300',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// --- Menu Item Card Component ---
const MenuItemCard = ({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem) => void }) => {
  const [emoji] = useState(getRandomEmoji());
  const [gradient] = useState(getRandomGradient());

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
        <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
        {item.isSignature && (
          <span className="absolute top-2 right-2 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-md">
            Signature
          </span>
        )}
        {item.isVeg !== undefined && (
          <span className={`absolute bottom-2 left-2 w-4 h-4 rounded-full flex items-center justify-center border-2 ${item.isVeg ? 'border-emerald-500' : 'border-red-500'} bg-white shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-zinc-800 mb-1">{item.name}</h3>
        <p className="text-sm text-zinc-600 h-12 overflow-hidden mb-2">{item.desc}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-bold text-amber-700">${item.displayPrice.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(item)}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-full hover:bg-amber-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Cart Sidebar Component ---
const CartSidebar = ({ cartItems, onUpdateItemQuantity, onRemoveItem }: {
  cartItems: CartItem[];
  onUpdateItemQuantity: (item: CartItem, quantity: number) => void;
  onRemoveItem: (item: CartItem) => void;
}) => {
  const total = cartItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0);

  return (
    <aside className="w-full lg:w-96 bg-zinc-100 p-6 border-l border-zinc-200 flex flex-col h-full sticky top-0">
      <h2 className="text-3xl font-bold text-zinc-800 mb-6 border-b pb-4 border-zinc-300">Your Cart</h2>
      {cartItems.length === 0 ? (
        <p className="text-zinc-600 text-center mt-8">Your cart is empty. Add some delicious food!</p>
      ) : (
        <ul className="flex-grow overflow-y-auto pr-2 -mr-2 mb-6">
          {cartItems.map((item) => (
            <li key={item.name} className="flex items-center justify-between py-3 border-b border-zinc-200 last:border-b-0">
              <div className="flex-grow">
                <p className="font-semibold text-zinc-800">{item.name}</p>
                <p className="text-sm text-zinc-600">${item.displayPrice.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateItemQuantity(item, item.quantity - 1)}
                  disabled={item.quantity === 1}
                  className="w-7 h-7 flex items-center justify-center bg-zinc-300 text-zinc-800 rounded-full hover:bg-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  -
                </button>
                <span className="font-medium text-zinc-800 w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateItemQuantity(item, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => onRemoveItem(item)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  aria-label={`Remove ${item.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4 border-t border-zinc-300">
        <div className="flex justify-between items-center text-xl font-bold text-zinc-800 mb-4">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Link href="/restaurant/tawakkul-restaurant/order" passHref>
          <button
            disabled={cartItems.length === 0}
            className="w-full py-3 bg-amber-600 text-white text-lg font-semibold rounded-lg hover:bg-amber-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-opacity-50"
          >
            Proceed to Checkout
          </button>
        </Link>
      </div>
    </aside>
  );
};

export default function MenuPage() {
  const [activeCategoryName, setActiveCategoryName] = useState<string>('');
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${API_URL}/api/public/microsite/tawakkul/menu`, { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
         if(json && json.success) {
            const grouped = json.data.reduce((acc: any, item: any) => {
               const cat = item.category || 'Specials';
               if(!acc[cat]) acc[cat] = { name: cat, items: [] };
               acc[cat].items.push({
                   name: item.name,
                   displayPrice: parseFloat(item.displayPrice || item.basePrice || item.display_price),
                   desc: item.description,
                   imageUrl: item.imageUrl,
                   isSignature: item.isSignature || false,
                   isVeg: item.isVeg || false,
               });
               return acc;
            }, {});
            const sortedData = Object.values(grouped) as MenuCategory[];
            setMenuData(sortedData);
            if (sortedData.length > 0) {
              setActiveCategoryName(sortedData[0].name);
            }
         }
      })
      .catch(console.error);
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.name === item.name);
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const handleUpdateItemQuantity = (itemToUpdate: CartItem, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.name !== itemToUpdate.name);
      }
      return prevItems.map((item) =>
        item.name === itemToUpdate.name ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleRemoveItem = (itemToRemove: CartItem) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.name !== itemToRemove.name));
  };

  const filteredMenuItems = menuData.find(
    (category) => category.name === activeCategoryName
  )?.items || [];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Header */}
      <header className="bg-zinc-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Tawakkul Restaurant
          </h1>
          <p className="text-xl md:text-2xl font-light text-amber-300">Our Delicious Menu</p>
        </div>
      </header>

      <div className="container mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-120px)] mt-8">
        {/* Main Content Area */}
        <main className="flex-grow p-4 lg:p-6 lg:pr-10">
          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap gap-3 sticky top-0 bg-zinc-50 pb-4 z-10 border-b border-zinc-200 -mt-4 pt-4 -mx-4 px-4 lg:mx-0 lg:px-0">
            {menuData.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategoryName(category.name)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200
                  ${activeCategoryName === category.name
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <section>
            <h2 className="text-3xl font-bold text-zinc-800 mb-6">{activeCategoryName}</h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => (
                <MenuItemCard key={item.name} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>



          {/* Catering Section */}
          <section className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-blue-800 mb-3 flex items-center">
              <span className="text-3xl mr-2">🎉</span> Catering Services
            </h2>
            <p className="text-blue-700 mb-2">
              Planning a special event? Tawakkul Restaurant offers exceptional catering services for all occasions.
              From intimate gatherings to grand celebrations, let us bring the taste of authenticity to your event.
            </p>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
              <p className="font-bold">Important Notice:</p>
              <p>We require a minimum of 48 hours notice for all catering orders to ensure the highest quality and freshest ingredients.</p>
            </div>
            <p className="mt-4 text-blue-700">Please contact us to discuss your catering needs and custom menus.</p>
          </section>

          {/* Price Note */}
          <div className="mt-12 p-4 bg-zinc-100 border-t border-zinc-200 text-sm text-zinc-600 rounded-lg">
            <p><strong>Price Note:</strong> Prices shown include 5% payment processing + 20% PaySurity platform margin. Base price is what the restaurant receives.</p>
          </div>
        </main>

        {/* Cart Sidebar */}
        <CartSidebar
          cartItems={cartItems}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          onRemoveItem={handleRemoveItem}
        />
      </div>
    </div>
  );
}