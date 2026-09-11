'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

// ── Environment abstraction — CRITICAL for staging/prod alignment ──────────────
// Set NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.paysurity.com in staging .env
// Fallback to localhost:4001 for local development only
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001';
const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || 'https://wallet.paysurity.com';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:4004';


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
          <Link href="/features" className="hover:text-white transition-colors duration-300">Merchant Services</Link>
          <Link href={WALLET_URL} className="hover:text-white transition-colors duration-300">Wallet</Link>
          <Link href={ADMIN_URL} className="hover:text-white transition-colors duration-300">Admin</Link>
          <Link href="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link>
          <Link href="/products" className="hover:text-white transition-colors duration-300">Product Demos</Link>
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
          <Link href="/features" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Merchant Services</Link>
          <Link href={WALLET_URL} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Wallet</Link>
          <Link href={ADMIN_URL} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Admin</Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors">About</Link>
          <Link href={`${DASHBOARD_URL}/login`} onClick={() => setIsMenuOpen(false)} className="px-6 py-3 border border-[#8b5cf6] text-[#8b5cf6] rounded-md hover:bg-[#8b5cf6] hover:text-white transition-all">Merchant Portal</Link>
          <Link href={`${DASHBOARD_URL}/signup`} onClick={() => setIsMenuOpen(false)} className="px-8 py-3 bg-[#10b981] text-white rounded-md hover:bg-[#0d9d6e] transition-colors font-semibold">Start Free Trial</Link>
        </div>
      )}
    </>
  );
}
