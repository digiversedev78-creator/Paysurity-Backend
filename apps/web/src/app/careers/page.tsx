import React from 'react';

export const metadata = { title: 'Careers | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">Join Our <span className="text-blue-500">Mission</span></h1>
        <p className="text-xl text-zinc-400 mb-12">Help us build the future of financial infrastructure for merchants.</p>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
          <p className="text-zinc-500 mb-6">We are currently updating our job board. Please check back soon or send your resume to careers@paysurity.com.</p>
          <div className="flex gap-4">
             <a href="mailto:careers@paysurity.com" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors">Email Resume</a>
          </div>
        </div>
      </div>
    </main>
  );
}
