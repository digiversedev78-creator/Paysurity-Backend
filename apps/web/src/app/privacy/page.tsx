import React from 'react';

export const metadata = { title: 'Privacy Policy | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Privacy Policy</h1>
        <div className="space-y-8 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information to provide better services to our users. This includes account details, payment transaction data, and usage metrics on our platforms.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Information</h2>
            <p>The data collected is strictly used to operate, maintain, and improve the PaySurity ecosystem. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p>We implement industry-standard encryption and security protocols to protect your sensitive financial information.</p>
          </section>
          <p className="text-sm text-zinc-600 mt-12 pt-8 border-t border-zinc-800">Last updated: Q3 2026</p>
        </div>
      </div>
    </main>
  );
}
