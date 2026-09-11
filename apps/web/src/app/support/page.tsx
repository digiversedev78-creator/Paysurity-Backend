import React from 'react';

export const metadata = { title: 'Support | PaySurity' };

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050508] pt-32 pb-20 text-white font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight">How can we <span className="text-blue-500">help?</span></h1>
        <p className="text-xl text-zinc-400 mb-12">Search our knowledge base or contact our 24/7 merchant support team.</p>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
          <p className="text-zinc-400 mb-4">For immediate assistance with your POS or merchant account, please reach out to us:</p>
          <ul className="text-zinc-300 space-y-2 font-medium">
            <li>Email: support@paysurity.com</li>
            <li>Phone: 1-800-PAY-SURE</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
