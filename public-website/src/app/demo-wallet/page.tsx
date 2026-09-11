
'use client';
import React, { useState } from 'react';

const WALLET_SCREENS = [
  {
    id: 'employer',
    title: 'Employer Digital Ledger',
    icon: '💼',
    color: '#0ea5e9',
    screens: [
      {
        name: 'Dashboard',
        header: 'Corporate Treasury',
        balance: '$248,500.00',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 hover:border-sky-500/50 transition-colors">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Payroll Pool</p>
                <p className="text-sm font-bold">$120.4k</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 hover:border-sky-500/50 transition-colors">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Tax Reserve</p>
                <p className="text-sm font-bold">$42.1k</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest px-1">Upcoming Disbursements</p>
              {[
                { name: 'Bi-Weekly Payroll', date: 'Apr 25', amount: '-$84,200', status: 'Approved' },
                { name: 'Vendor: Ashiana Coll.', date: 'Apr 24', amount: '-$12,500', status: 'Pending' },
              ].map((tx, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white">{tx.name}</p>
                    <p className="text-[10px] text-white/40">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-sky-400">{tx.amount}</p>
                    <p className="text-[8px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded uppercase font-black">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'employee',
    title: 'Employee Wage Access',
    icon: '👤',
    color: '#10b981',
    screens: [
      {
        name: 'Wallet',
        header: 'Your Earnings',
        balance: '$3,420.50',
        content: (
          <div className="space-y-4">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl rotate-12 transition-transform group-hover:rotate-0 duration-500">💳</div>
              <p className="text-[10px] text-white/70 uppercase font-bold">Available for Withdrawal</p>
              <p className="text-2xl font-black text-white">$1,240.00</p>
              <button className="mt-4 w-full bg-white text-emerald-600 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors">Instant Pay</button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest px-1">Recent Activity</p>
              {[
                { name: 'Wage Access', date: 'Today', amount: '+$400.00', status: 'Paid' },
                { name: 'GrocerEase Store', date: 'Yesterday', amount: '-$82.40', status: 'Success' },
              ].map((tx, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white">{tx.name}</p>
                    <p className="text-[10px] text-white/40">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-white'}`}>{tx.amount}</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'family',
    title: 'Family Finance Control',
    icon: '👨‍👩‍👧‍👦',
    color: '#f59e0b',
    screens: [
      {
        name: 'Parent View',
        header: 'Family Admin',
        balance: '$1,850.00',
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest px-1">Sub-Accounts</p>
              {[
                { name: 'Leo (Child)', limit: '$50.00', spent: '$32.40', color: 'bg-amber-500' },
                { name: 'Mia (Child)', limit: '$100.00', spent: '$0.00', color: 'bg-purple-500' },
              ].map((child, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${child.color}`} />
                      <p className="text-xs font-bold text-white">{child.name}</p>
                    </div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Update ⚙️</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${child.color}`} style={{ width: `${(parseFloat(child.spent.slice(1)) / parseFloat(child.limit.slice(1))) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] italic">
                    <span className="text-white/40">Spent: {child.spent}</span>
                    <span className="text-white/60 font-bold">Limit: {child.limit}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full border-2 border-dashed border-white/10 py-3 rounded-2xl text-[10px] text-white/30 font-black uppercase tracking-widest hover:border-amber-500/50 hover:text-white/50 transition-all">Add Dependent Wallet</button>
          </div>
        )
      }
    ]
  }
];

export default function DemoWalletPage() {
  const [activeTab, setActiveTab] = useState(WALLET_SCREENS[0].id);
  const activeSet = WALLET_SCREENS.find(s => s.id === activeTab) || WALLET_SCREENS[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Narrative & Perspective */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-[0.2em] uppercase text-white/50">
            Shareholder Asset Review · Mobile UX
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic">
            Physical Wallet / <span className="text-white/20">Digital Ledger</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl leading-relaxed font-medium">
            The PaySurity Digital Wallet ecosystem is architected for compartmentalized financial sovereignty. 
            Toggle between personas to experience how we bridge corporate treasury with household liquidity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            {WALLET_SCREENS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-6 rounded-[2rem] border transition-all duration-500 ${
                  activeTab === tab.id 
                  ? 'bg-white/10 border-white/20 scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.05)]' 
                  : 'bg-transparent border-white/5 hover:border-white/10 grayscale opacity-50'
                }`}
              >
                <span className="text-4xl mb-3">{tab.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: The Device Frame */}
        <div className="relative flex-shrink-0">
          {/* External Shadow/Glow */}
          <div className="absolute inset-0 bg-white/20 blur-[120px] rounded-[3rem] opacity-20 animate-pulse pointer-events-none" />
          
          {/* Main Frame */}
          <div className="relative w-[340px] h-[680px] bg-[#0c0c0c] border-[8px] border-[#222] rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ring-1 ring-white/10">
            
            {/* Status Bar */}
            <div className="h-10 px-8 flex justify-between items-center pt-2">
              <span className="text-[10px] font-bold">9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2.5 border border-white/20 rounded-[2px] relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-white m-[1px] w-[80%]" />
                </div>
                <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center p-[2px]">
                   <div className="w-full h-full bg-white rounded-full opacity-60" />
                </div>
              </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-bottom duration-700">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{activeSet.screens[0].header}</h2>
                  <p className="text-3xl font-black italic tracking-tighter">{activeSet.screens[0].balance}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">🔔</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {activeSet.screens[0].content}
              </div>

              {/* Mobile Tab Bar */}
              <div className="h-16 mt-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-around px-2">
                 {['🏠', '📊', '🌀', '⚙️'].map((icon, i) => (
                   <div key={i} className={`text-xl opacity-${i === 0 ? '100' : '30'} cursor-pointer hover:opacity-100 transition-opacity`}>{icon}</div>
                 ))}
              </div>
            </div>

            {/* Home Indicator */}
            <div className="h-10 flex justify-center items-center pb-2">
              <div className="w-32 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Decorative Floating Elements */}
          <div className="absolute -top-12 -right-12 w-32 h-32 border border-white/10 rounded-full border-dashed animate-spin-slow opacity-20 pointer-events-none" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}
