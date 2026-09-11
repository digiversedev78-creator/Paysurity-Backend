import React from 'react';
import Link from 'next/link';

// Fallback to localhost if DASHBOARD_URL isn't fully bound in the env at runtime
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] bg-gradient-to-br from-[#0A0A0A] via-[#050508] to-[#111827] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[30%] h-[30%] rounded-full bg-green-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto w-full bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 md:p-14 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center">
        {/* Animated Checkmark Concept */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <svg className="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
          Application Received!
        </h1>
        
        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
          Your initial details have been captured securely. To complete your account setup and submit your KYC documents, please proceed to your secure Merchant Dashboard.
        </p>

        <div className="space-y-4">
          <Link 
            href={`${DASHBOARD_URL}/onboarding`}
            className="block w-full px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-500 transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] hover:-translate-y-1"
          >
            Continue to Secure Onboarding &rarr;
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            We've also sent a secure magic link to your email to resume this process later.
          </p>
        </div>
      </div>
    </main>
  );
}
