import React from 'react';

export const metadata = { title: 'POS System | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Next-Gen <span className="text-blue-500">POS System</span></h1>
        <p className="text-xl text-zinc-400 mb-12">Lightning-fast, intuitive, and built for your industry.</p>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-4">Hardware meets Software</h2>
            <p className="text-zinc-400 mb-6">Our point of sale system integrates perfectly with your kitchen displays, online ordering, and back-office management. No extra tablets needed.</p>
            <a href="/savings-estimator" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors inline-block">Calculate Savings</a>
          </div>
        </div>
      </div>
    </main>
  );
}
