'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const PRODUCTS = [
  {
    id: 'pos',
    name: 'Smart POS System',
    icon: '🖥️',
    description: 'Lightning-fast point of sale for enterprise scale operations. Engineered to never go down.',
    color: 'from-blue-500 to-indigo-600',
    screens: [
      {
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
        title: 'Intuitive Checkout Flow',
        desc: 'Easily ring up customers, process split payments, and apply discounts through a clean, color-coded interface designed for minimal training time.'
      },
      {
        image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
        title: 'Real-Time Inventory Sync',
        desc: 'Every scan immediately deducts from your master inventory list across all locations, preventing stockouts and over-ordering.'
      }
    ]
  },
  {
    id: 'ordering',
    name: 'Online Ordering',
    icon: '📱',
    description: 'Fully branded digital storefronts with zero third-party commission fees.',
    color: 'from-emerald-400 to-teal-500',
    screens: [
      {
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
        title: 'Pixel-Perfect Mobile Experience',
        desc: 'Customers can place ahead-of-time orders right from their phone without needing to download any app.'
      },
      {
        image: 'https://images.unsplash.com/photo-1483137140003-ae073b395549?auto=format&fit=crop&w=1200&q=80',
        title: 'Direct POS Injection',
        desc: 'Online orders are fired directly into your kitchen printers or KDS instantly, avoiding dreaded tablet-juggling.'
      }
    ]
  },
  {
    id: 'processing',
    name: '0% Native Processing',
    icon: '💳',
    description: 'Legally embedded Cash Discount routing that shifts the cost of processing off your P&L.',
    color: 'from-purple-500 to-pink-600',
    screens: [
      {
        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
        title: 'Transparent Dual-Pricing',
        desc: 'Customer-facing displays clearly present the Cash Price vs. Card Price in full compliance with network rules.'
      },
      {
        image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80',
        title: 'Next-Day Funding Console',
        desc: 'Watch your deposits clear with 100% of your listed revenue hitting your bank account by the next morning.'
      }
    ]
  },
  {
    id: 'payroll',
    name: 'Automated Payroll',
    icon: '👥',
    description: 'Frictionless team management, time-clocking, and direct deposits baked straight into the ecosystem.',
    color: 'from-orange-400 to-red-500',
    screens: [
      {
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
        title: 'Integrated Time Clocks',
        desc: 'Staff clock in and out directly via the POS. Timesheets are automatically generated and pre-calculated for overtime.'
      },
      {
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        title: 'One-Click Direct Deposit',
        desc: 'Review timesheets and run payroll with an aggregate click. State/Federal tax withholding is handled autonomously.'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Live Analytics',
    icon: '📊',
    description: 'Enterprise-grade reporting that demystifies your sales data into actionable strategies.',
    color: 'from-cyan-400 to-blue-500',
    screens: [
      {
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        title: 'Command Center Dashboard',
        desc: 'Get an aerial view of your net sales, top moving items, and labor costs across all your registered locations.'
      },
      {
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        title: 'Predictive Trends',
        desc: 'Leverage machine learning to identify peak traffic hours and appropriately forecast your staffing needs.'
      }
    ]
  }
];

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const activeProduct = PRODUCTS.find((p) => p.id === selectedProduct);

  return (
    <div className={`${inter.className} min-h-screen bg-[#050508] text-white pt-24 pb-20 px-4 md:px-8`}>
      <div className="max-w-6xl mx-auto">
        {!activeProduct ? (
          // --- GRID VIEW: Tiles for All Products --- //
          <div className="animate-fade-in">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-widest mb-6 uppercase">
                PaySurity Ecosystem
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                Explore Our Products
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Everything you need to run your business profitably in one unified suite. Select a product to take a look inside.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => { window.scrollTo({ top: 0 }); setSelectedProduct(prod.id); }}
                  className="group relative flex flex-col items-start p-8 rounded-3xl bg-[#0a0f1c] border border-white/5 hover:border-white/20 transition-all duration-300 text-left overflow-hidden h-full"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${prod.color} transition-opacity duration-300`} />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${prod.color} shadow-lg shadow-white/5`}>
                    {prod.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{prod.name}</h3>
                  <p className="text-gray-400 leading-relaxed mb-8 flex-grow">{prod.description}</p>
                  
                  <div className="flex items-center text-sm font-bold text-white uppercase tracking-widest group-hover:text-blue-400 transition-colors mt-auto">
                    View Demo <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // --- DETAIL VIEW: Specific Product Demo --- //
          <div className="animate-fade-in relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-all mb-12"
            >
              <span>←</span> Back to All Products
            </button>

            <div className="flex items-center gap-6 mb-16 border-b border-white/10 pb-12">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl bg-gradient-to-br ${activeProduct.color} shadow-2xl`}>
                {activeProduct.icon}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                  {activeProduct.name}
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                  {activeProduct.description}
                </p>
              </div>
            </div>

            <div className="space-y-24">
              {activeProduct.screens.map((screen, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Screen Image */}
                  <div className="w-full md:w-3/5 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] group">
                    <img 
                      src={screen.image} 
                      alt={screen.title}
                      className="w-full h-[350px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </div>
                  {/* Explanation */}
                  <div className="w-full md:w-2/5 space-y-6">
                    <div className="inline-block px-3 py-1 rounded border border-white/10 bg-white/5 text-gray-400 text-xs font-mono font-semibold tracking-widest uppercase mb-2">
                       Interface {idx + 1}
                    </div>
                    <h3 className="text-3xl font-black text-white">{screen.title}</h3>
                    <p className="text-lg text-gray-400 leading-relaxed border-l-2 border-blue-500 pl-4 py-1">
                      {screen.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-32 text-center p-12 bg-gradient-to-b from-[#0a0f1c] to-[#050508] border border-white/10 rounded-3xl relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 filter blur-[80px] bg-gradient-to-br ${activeProduct.color}`}></div>
               <div className="relative z-10">
                 <h4 className="text-2xl md:text-3xl font-black text-white mb-6">Ready to upgrade your {activeProduct.name}?</h4>
                 <p className="text-gray-400 mb-8 max-w-lg mx-auto">Get free activation when you complete your application today.</p>
                 <Link href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001'}/signup`} className="inline-block bg-white text-black font-black uppercase tracking-widest text-sm px-10 py-5 rounded-xl hover:scale-105 transition-all shadow-xl">
                   Start Setup Now
                 </Link>
               </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
