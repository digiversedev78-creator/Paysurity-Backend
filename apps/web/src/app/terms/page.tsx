import React from 'react';

export const metadata = { title: 'Terms of Service | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Terms of Service</h1>
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using PaySurity services, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Modifications</h2>
            <p>We reserve the right to modify or discontinue the service with or without notice to the user.</p>
          </section>
          <p className="text-sm text-zinc-600 mt-12 pt-8 border-t border-zinc-800">Last updated: Q3 2026</p>
        </div>
      </div>
    </main>
  );
}
