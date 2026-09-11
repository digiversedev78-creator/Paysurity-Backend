import React from 'react';

export const metadata = { title: 'Press | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Press & <span className="text-blue-500">Media</span></h1>
        <p className="text-xl text-zinc-400 mb-12">Latest news, announcements, and media resources for PaySurity.</p>
        <div className="grid gap-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl hover:bg-zinc-900/50 transition-colors">
            <span className="text-blue-400 text-sm font-bold tracking-wider uppercase mb-2 block">Press Release</span>
            <h3 className="text-xl font-bold text-white mb-2">PaySurity Announces Next-Gen POS System</h3>
            <p className="text-zinc-500">Our revolutionary cloud-based point of sale system is now entering Phase 2 rollout.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
