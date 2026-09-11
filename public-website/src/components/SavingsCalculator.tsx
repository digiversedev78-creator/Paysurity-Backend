'use client';
import React, { useState } from 'react';

export default function SavingsCalculator() {
  const [volume, setVolume] = useState<number>(50000);
  const [feePercent, setFeePercent] = useState<number>(2.9);

  // PaySurity Interchange++ Logic
  // Assumes blended Visa/MasterCard interchange of 1.15% plus basic network assessments (0.10%)
  // Effective base: 1.25%
  const networkCost = 1.25; 
  // PaySurity markup reduces at higher tiers
  let markup = 0.50;
  if (volume > 100000) markup = 0.35;
  if (volume > 250000) markup = 0.20;
  if (volume >= 500000) markup = 0.10;

  const paySurityEffectiveRate = networkCost + markup;
  const currentMonthlyCost = volume * (feePercent / 100);
  const paySurityMonthlyCost = volume * (paySurityEffectiveRate / 100);
  const monthlySavings = Math.max(0, currentMonthlyCost - paySurityMonthlyCost);
  const annualSavings = monthlySavings * 12;

  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden w-full mx-auto my-12">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Inputs */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <h3 className="text-3xl font-black text-white mb-2">Zero Markup Calculator</h3>
            <p className="text-gray-400 text-sm leading-relaxed">PaySurity gives you the Cash Discount Program, which, minimizes your Merchant-Fees/ overheads, Hence, more Profit for you. PaySurity gives you direct access to super savings. See your exact savings.</p>
          </div>

          <div className="w-full h-48 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/40">
            <img
              src="https://images.unsplash.com/photo-1556742208-999815fca738?auto=format&fit=crop&w=600&q=80"
              alt="Business owner reviewing savings on payment terminal"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-8 bg-[#1e293b]/50 p-6 rounded-2xl border border-gray-700/50">
            <div>
              <label className="flex justify-between text-sm font-semibold text-gray-300 mb-4">
                <span>Monthly Volume</span>
                <span className="text-emerald-400 font-mono text-lg">${volume.toLocaleString()}</span>
              </label>
              <input 
                type="range" 
                min="10000" 
                max="500000" 
                step="5000" 
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-semibold text-gray-300 mb-4">
                <span>Current Effective Fee</span>
                <span className="text-emerald-400 font-mono text-lg">{feePercent.toFixed(2)}%</span>
              </label>
              <input 
                type="range" 
                min="1.5" 
                max="4.5" 
                step="0.1" 
                value={feePercent} 
                onChange={(e) => setFeePercent(Number(e.target.value))}
                className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Outputs */}
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-gray-700 shadow-xl rounded-2xl p-8 flex flex-col justify-center text-center relative relative">
          <div className="mb-10">
            <h4 className="text-gray-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Estimated Annual Savings</h4>
            <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              ${annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-emerald-500/80 font-medium text-sm mt-4 tracking-wide">+ ${monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} monthly back in your pocket</p>
          </div>

          <div className="space-y-5 border-t border-gray-700/50 pt-8">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <span className="text-gray-400 text-sm font-medium">Your Current Cost</span>
              <span className="text-red-400/80 font-mono font-medium">${currentMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} / mo</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-200 text-sm font-bold">PaySurity Wholesale (0% Markup)</span>
              <span className="text-emerald-400 font-mono font-bold">${paySurityMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} / mo</span>
            </div>
          </div>

          <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001'}/signup`} className="mt-10 block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-400 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.6)] hover:-translate-y-1">
            Claim Your 0% Rate
          </a>
        </div>
      </div>
    </div>
  );
}
