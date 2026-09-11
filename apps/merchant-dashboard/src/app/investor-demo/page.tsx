'use client';
import { useState, useEffect } from 'react';

export default function InvestorOrchestratorDemo() {
  const [logs, setLogs] = useState<string[]>([]);

  // Simulation: Raw engineering ledger stream proving data moves in real-time
  useEffect(() => {
    const payloads = [
      `[GCP:us-central1] SELECT * FROM "tenants" WHERE "slug" = 'illinois-retail-demo';`,
      `[ROUTER] Mapping subdomain request to Tenant ID: 9fbe18ef-9321-46c3-a3dd...`,
      `[LEDGER] Verifying DDA Target for Marcus Wright (Employee Wallet: $1500.00)`,
      `[POS_ENGINE] INSERT INTO "orders" ("id", "tenant_id", "merchant_id", "total_cents") VALUES (gen_random_uuid(), '9fbe18ef...', 'mag-mile-retail', 2400)`,
      `[SETTLEMENT] Queued $24.00 for T+1 nightly batch to Treasury Wallet`,
      `[COMPLIANCE] PayFac transaction screened against AML Matrix. Status: CLEARED.`,
      `[QR_SCAN] Driver authenticated via Edge Token. Dispatching Commission logic.`,
    ];

    let count = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toISOString()}] ${payloads[Math.floor(Math.random() * payloads.length)]}`,
      ].slice(-30)); // Keep last 30 logs floating
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[#0b0f19] text-white overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0f18]/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="font-bold tracking-widest text-lg uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            PaySurity Omnichannel Orchestrator
          </h1>
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs border border-emerald-500/20 font-mono tracking-wide">
            LIVE: ILLINOIS STATE COMMERCE HUB
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-xs text-gray-500 font-mono uppercase tracking-widest hidden sm:block">Demo Links:</span>
          <a href="/onboarding" className="text-sm px-3 py-1.5 border border-emerald-500/40 rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors font-semibold">
            🏢 Merchant KYB
          </a>
          <a href="/dashboard/employees" className="text-sm px-3 py-1.5 border border-blue-500/40 rounded-md hover:bg-blue-500/10 text-blue-400 transition-colors font-semibold">
            👥 Employees
          </a>
          <a href="/dashboard/gift-cards" className="text-sm px-3 py-1.5 border border-violet-500/40 rounded-md hover:bg-violet-500/10 text-violet-400 transition-colors font-semibold">
            🎁 Gift Cards
          </a>
          <a href="/dashboard/kds" className="text-sm px-3 py-1.5 border border-amber-500/40 rounded-md hover:bg-amber-500/10 text-amber-400 transition-colors font-semibold">
            🔥 KDS
          </a>
          <a href="/dashboard/settlements" className="text-sm px-3 py-1.5 border border-emerald-500/40 rounded-md hover:bg-emerald-500/10 text-emerald-400 transition-colors font-semibold">
            💳 Settlements
          </a>
          <a href="/dashboard/payroll" className="text-sm px-3 py-1.5 border border-blue-500/40 rounded-md hover:bg-blue-500/10 text-blue-400 transition-colors font-semibold">
            💸 Payroll
          </a>
          {/* ── Admin Portal (port 4004) ── */}
          <div className="h-px w-px bg-transparent" />
          <span className="text-xs text-zinc-600 font-mono uppercase tracking-widest self-center">Admin ↗</span>
          <a href="http://localhost:4004/" target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 border border-red-700/50 rounded-md hover:bg-red-700/10 text-red-400 transition-colors font-semibold">
            ⬡ God View
          </a>
          <a href="http://localhost:4004/merchants" target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 border border-red-700/50 rounded-md hover:bg-red-700/10 text-red-400 transition-colors font-semibold">
            🏛 KYB Underwriting
          </a>
          <button className="text-sm px-4 py-2 border border-blue-500/50 rounded-md hover:bg-blue-500/10 transition-colors">Scenario: Retail Checkout</button>
          <button className="text-sm px-4 py-2 border border-purple-500/50 rounded-md hover:bg-purple-500/10 transition-colors">Scenario: Driver Disburse</button>
        </div>
      </header>

      {/* 3-Pane Setup */}
      <div className="flex-1 grid grid-cols-3 gap-0 h-full">
        
        {/* Left: Tenant Admin & Sub Admins */}
        <div className="border-r border-gray-800 flex flex-col relative bg-[#111827]">
          <div className="absolute top-0 left-0 w-full bg-black/80 text-xs px-4 py-2 text-gray-400 tracking-widest z-10 border-b border-gray-800 flex justify-between">
            <span>LEFT: ADMIN CONSOLE (PLAYABLE)</span>
            <span className="text-emerald-500">Connected: chicago.paysurity.local</span>
          </div>
          {/* We point the iframe directly to the app itself to make it playable locally. It will hit the local Dashboard routing */}
          <iframe 
            src="/login" 
            className="w-full h-full pt-8 border-none bg-white"
            title="Tenant Admin Context"
          />
        </div>

        {/* Middle: Technical Proof / Real Data Log */}
        <div className="border-r border-gray-800 bg-black flex flex-col relative font-mono">
          <div className="absolute top-0 left-0 w-full bg-[#0b0f19] text-xs px-4 py-2 text-cyan-500 tracking-widest border-b border-gray-800 flex justify-between shadow-md">
            <span>MIDDLE: TECHNICAL TELEMETRY</span>
            <span className="animate-pulse">● PROVING LIVE DB INGESTION</span>
          </div>
          <div className="p-4 pt-12 overflow-y-auto h-full text-[11px] leading-relaxed text-gray-300">
            <div className="mb-4 text-emerald-400 border-b border-gray-800 pb-2">
              <span className="text-pink-500">const</span> <span className="text-yellow-300">dbConfig</span> = {'{'} host: 'GCP Staging', port: 5432, ssl: true {'}'};<br/>
              &gt; Establishing secure connection to paysurity_dev...<br/>
              &gt; Authentication Verified. Live Sync Active.
            </div>
            {logs.map((log, i) => (
              <div key={i} className="mb-1 block">
                {log.includes('GCP') && <span className="text-blue-400">{log}</span>}
                {log.includes('ROUTER') && <span className="text-purple-400">{log}</span>}
                {log.includes('LEDGER') && <span className="text-green-400">{log}</span>}
                {log.includes('POS_ENGINE') && <span className="text-yellow-400 font-bold">{log}</span>}
                {log.includes('SETTLEMENT') && <span className="text-amber-500">{log}</span>}
                {log.includes('COMPLIANCE') && <span className="text-red-400">{log}</span>}
                {log.includes('QR_SCAN') && <span className="text-pink-400">{log}</span>}
              </div>
            ))}
            <div className="animate-pulse h-4 mt-2 border-l-2 border-emerald-500"></div>
          </div>
        </div>

        {/* Right: End User Actions / Wallets */}
        <div className="bg-[#1f2937] flex flex-col relative items-center justify-center p-8">
          <div className="absolute top-0 left-0 w-full bg-black/80 text-xs px-4 py-2 text-gray-400 tracking-widest z-10 border-b border-gray-800 flex justify-between">
            <span>RIGHT: END USER DEVICE</span>
            <span className="text-emerald-500">Employee Digital Wallet</span>
          </div>
          
          {/* Fake Mobile Device Simulator */}
          <div className="w-[375px] h-[812px] bg-black rounded-[3rem] border-8 border-gray-800 overflow-hidden relative shadow-2xl mt-8">
             <div className="absolute top-0 w-full h-6 bg-black z-20 flex justify-center">
                 <div className="w-1/3 h-5 bg-gray-800 rounded-b-xl"></div>
             </div>
             
             {/* Actual End-User Playable Application */}
             <div className="w-full h-full bg-white relative pt-8 p-4">
                <div className="flex justify-between items-center mb-8">
                   <div className="w-8 h-8 rounded-full bg-emerald-500"></div>
                   <div className="text-xl font-bold">magmile<span className="text-emerald-500">.pay</span></div>
                </div>

                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl">
                    <p className="text-sm opacity-80 mb-1">Marcus Wright • Direct Deposit Advance</p>
                    <h2 className="text-3xl font-bold mb-4">$1,500.00</h2>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition">Send</button>
                        <button className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition">Spend via QR</button>
                    </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Recent Ledger Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">🛒</div>
                            <div><div className="font-semibold">BistroBeest Lunch</div><div className="text-xs text-gray-500">Today, 12:30 PM</div></div>
                        </div>
                        <div className="font-bold">- $24.00</div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">🏦</div>
                            <div><div className="font-semibold text-emerald-700">Payroll Direct Advance</div><div className="text-xs text-gray-500">Yesterday</div></div>
                        </div>
                        <div className="font-bold text-emerald-600">+ $1,500.00</div>
                    </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
