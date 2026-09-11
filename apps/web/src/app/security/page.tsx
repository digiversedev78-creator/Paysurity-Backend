import React from 'react';

export const metadata = { title: 'Security | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Enterprise-Grade <span className="text-blue-500">Security</span></h1>
        <p className="text-xl text-zinc-400 mb-12">Your data and transactions are protected by bank-level encryption.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-3">PCI-DSS Compliant</h3>
            <p className="text-zinc-400">Our payment infrastructure exceeds Level 1 PCI compliance requirements.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
            <p className="text-zinc-400">All data is encrypted in transit and at rest using AES-256 protocols.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
