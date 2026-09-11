'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

// ── Environment abstraction — CRITICAL for staging/prod alignment ──────────────
// Set NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.paysurity.com in staging .env
// Fallback to localhost:4001 for local development only
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001';


export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/DEMOAPRIL2026') || pathname?.startsWith('/restaurant')) {
    return null;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full z-50 py-4 px-6 md:px-12 flex items-center justify-between bg-[#050508] bg-opacity-80 backdrop-blur-sm shadow-lg">
        <Link href="/" className="text-2xl font-bold text-white relative z-10 flex-shrink-0">
          PaySurity
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"></span>
        </Link>

        {/* Desktop Nav — visible at lg+ (1024px) */}
        <div className="hidden lg:flex space-x-5 items-center text-gray-300 text-sm font-medium">
          <Link href="/savings-estimator" className="hover:text-white transition-colors duration-300">Savings Estimator</Link>
          <div className="relative group">
            <button className="hover:text-white transition-colors duration-300 flex items-center gap-1 focus:outline-none">
              Industry Solutions
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute left-0 mt-2 w-56 bg-[#0a0a0f] border border-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50">
              <span className="px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Core Operations</span>
              <Link href="/payroll" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">Payroll</Link>
              <Link href="/digital-wallets" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">Digital Wallets</Link>
              <Link href="/pos" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">POS Systems</Link>
              <Link href="/ecommerce" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">E-Commerce</Link>
              <div className="h-px bg-gray-800 my-1"></div>
              <span className="px-4 py-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Specialized Verticals</span>
              <Link href="/chiropractic" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">LumbarPay (Chiropractic)</Link>
              <Link href="/legal" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">PayFidavit (Legal)</Link>
              <Link href="/dental" className="px-4 py-2 hover:bg-gray-800 hover:text-white transition-colors">PayDental (Dental)</Link>
            </div>
          </div>
          <Link href="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors duration-300">Blog</Link>
          <Link href="/contact" className="hover:text-white transition-colors duration-300">Contact</Link>
          <Link href={`${DASHBOARD_URL}/login`} className="px-4 py-2 border border-[#8b5cf6] text-[#8b5cf6] rounded-md hover:bg-[#8b5cf6] hover:text-white transition-all duration-300">Merchant Portal</Link>
          <Link href={`${DASHBOARD_URL}/signup`} className="px-5 py-2 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors duration-300">Start Free Trial</Link>
        </div>

        {/* Hamburger — visible below lg (mobile + tablet) */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 focus:outline-none p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile / Tablet Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#050508] bg-opacity-97 z-40 flex flex-col items-center justify-center space-y-7 text-xl">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 text-gray-300 p-2"
            aria-label="Close menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Logo inside mobile menu */}
          <span className="text-2xl font-bold text-white mb-4">PaySurity</span>

          <Link href="/savings-estimator" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Savings Estimator</Link>
          <div className="flex flex-col items-center space-y-3">
            <span className="text-gray-500 font-bold uppercase text-sm tracking-wider">Industry Solutions</span>
            <Link href="/payroll" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">Payroll</Link>
            <Link href="/digital-wallets" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">Digital Wallets</Link>
            <Link href="/pos" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">POS Systems</Link>
            <Link href="/ecommerce" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors text-lg">E-Commerce</Link>
            <Link href="/chiropractic" onClick={() => setIsMenuOpen(false)} className="text-[#8b5cf6] hover:text-white transition-colors text-lg">LumbarPay</Link>
            <Link href="/legal" onClick={() => setIsMenuOpen(false)} className="text-[#8b5cf6] hover:text-white transition-colors text-lg">PayFidavit</Link>
            <Link href="/dental" onClick={() => setIsMenuOpen(false)} className="text-[#8b5cf6] hover:text-white transition-colors text-lg">PayDental</Link>
          </div>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          <Link href={`${DASHBOARD_URL}/login`} onClick={() => setIsMenuOpen(false)} className="px-6 py-3 border border-[#8b5cf6] text-[#8b5cf6] rounded-md hover:bg-[#8b5cf6] hover:text-white transition-all">Merchant Portal</Link>
          <Link href={`${DASHBOARD_URL}/signup`} onClick={() => setIsMenuOpen(false)} className="px-8 py-3 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors font-semibold">Start Free Trial</Link>
        </div>
      )}
    </>
  );
}
