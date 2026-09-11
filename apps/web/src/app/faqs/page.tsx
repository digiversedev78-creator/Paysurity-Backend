import React from 'react';

export const metadata = { title: 'FAQs | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Frequently Asked <span className="text-blue-500">Questions</span></h1>
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">How long does it take to get approved?</h3>
            <p className="text-zinc-400">Most merchant accounts are approved instantly or within 24 hours.</p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Is there a setup fee?</h3>
            <p className="text-zinc-400">No, there are zero setup fees and zero hidden costs.</p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Do you provide hardware?</h3>
            <p className="text-zinc-400">Yes, we provide fully integrated POS terminals for our merchants.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
