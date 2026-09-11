'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 space-y-8 max-w-2xl px-4">
        {/* Animated Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl mb-4 relative group">
          <span className="text-5xl group-hover:scale-110 transition-transform duration-500">🛰️</span>
          <div className="absolute -top-1 -right-1">
             <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Module <span className="text-blue-500">In Transit</span>
          </h1>
          <p className="text-xl text-zinc-400 font-medium leading-relaxed">
            You&apos;ve discovered a core ecosystem node that is currently being provisioned in our 
            <span className="text-white"> Phase 2 Staging Pipeline</span>.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md">
           <p className="text-sm text-zinc-500 font-mono">
             [STATUS] SYNC_PENDING for this vertical segment. <br/>
             [TARGET] Q3 2026 Production Rollout.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/DEMOAPRIL2026" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all active:scale-95">
             Return to Shareholder Hub
          </Link>
          <Link href="/" className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-800 hover:bg-zinc-900 text-zinc-400 font-bold transition-all">
             Public Site Home
          </Link>
        </div>

        <p className="text-xs text-zinc-600 pt-8 uppercase tracking-[0.2em] font-bold">
          PaySurity Global Operating System · Enterprise Staging
        </p>
      </div>
    </div>
  );
}
