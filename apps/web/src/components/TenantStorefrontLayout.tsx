'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

import { StorefrontProps, CarouselSlide } from '../types/storefront';
import TenantBot from './TenantBot';
import { useCart } from '../context/CartContext';


// --- Mini Carousel -------------------------------------------------------------
// Behaviour:
//  • Auto-advances every 4 seconds — always, no hover-pause
//  • Clicking ‹ › or a dot resets the timer (5 s gap) then resumes auto-advance
//  • Clicking a card navigates to its page via Next.js Link (no carousel state change)
//  • A thin animated progress bar shows time-to-next-advance
function TenantCarousel({ slides, accent }: { slides: CarouselSlide[]; accent: string }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoMs = 5000;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => { p += 1; setProgress(p); }, autoMs / 100);
    intervalRef.current = setInterval(() => {
      setActive(i => (i + 1) % slides.length);
      setProgress(0);
      p = 0;
    }, autoMs);
  }, [slides.length]);

  useEffect(() => { startAutoPlay(); return () => { clearInterval(intervalRef.current!); clearInterval(progressRef.current!); }; }, [startAutoPlay]);

  return (
    <div className="w-full relative overflow-visible py-12 perspective-[1500px]">
      <div className="relative h-[480px] md:h-[600px] flex items-center justify-center preserve-3d">
        {slides.map((s, i) => {
          const diff = i - active;
          const absDiff = Math.abs(diff);
          const isActive = i === active;
          
          // Dramatic Scaling and Depth Logic
          let x = diff * 120; // Horizontal shift
          let rotateY = diff * -15; // Perspective rotation
          let scale = isActive ? 1.25 : 0.85 - (absDiff * 0.1); // Strong contrast for active card
          let z = isActive ? 150 : -absDiff * 400; // Deep Z-space push
          let opacity = 1 - (absDiff * 0.35);

          if (absDiff > 2) opacity = 0;

          return (
            <Link key={i} href={s.href}
              className="absolute w-[280px] sm:w-[420px] aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)] transition-all duration-1000 ease-[cubic-bezier(0.2,0,0,1)] border-[4px] border-white/10 group active:scale-95"
              style={{
                opacity,
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex: isActive ? 500 : 100 - absDiff,
                filter: isActive ? 'none' : 'blur(2px) brightness(0.6)',
              }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10" />
              
              {/* Category Name Overlay (from Sketch) */}
              <div className="absolute top-10 left-8 z-20">
                 <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase mb-1">{s.subtitle}</p>
                 <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none group-hover:translate-x-2 transition-transform duration-500">{s.title}</h3>
              </div>

              {/* Tap to Order CTA (Bottom) */}
              <div className="absolute bottom-10 left-8 right-8 z-20">
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-2xl shadow-2xl">
                        {s.icon}
                    </div>
                    <div className={`px-5 py-2.5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        Order Now
                    </div>
                </div>
              </div>

              {/* Background with Parallel scrolling effect logic */}
              <div className="absolute inset-0 bg-zinc-950">
                 {s.imageUrl ? (
                     <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70" />
                 ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-zinc-800 to-black select-none">
                         <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-1000 opacity-20">{s.icon}</div>
                         <div className="text-[80px] font-black text-white/5 leading-none text-center">
                            {s.title.split(' ')[0]}
                         </div>
                    </div>
                 )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Branded Timeline Progress (from Sketch) */}
      <div className="max-w-[400px] mx-auto mt-12 space-y-6 px-6">
          <div className="flex items-center justify-center gap-6">
              <button onClick={() => setActive(i => (i - 1 + slides.length) % slides.length)} 
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex gap-3">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} 
                      className={`transition-all duration-500 rounded-full ${i === active ? 'w-8 h-1.5 bg-white' : 'w-2 h-1.5 bg-white/20'}`} />
                ))}
              </div>
              <button onClick={() => setActive(i => (i + 1) % slides.length)}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>
          </div>
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
      </div>
    </div>
  );
}

import { THEMES, EliteTierTheme } from '@paysurity/ui-components';

// --- Main Tenant Layout Component ----------------------------------------------
export default function TenantStorefrontLayout({ config, children, hideHero = false }: { config: StorefrontProps; children?: React.ReactNode; hideHero?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count, openCart, closeCart, isOpen } = useCart();
  const cartText = config.cartLabel || 'Cart';
  const CartIcon = cartText === 'Bag' ? '🛍️' : '🛒';

  const theme: EliteTierTheme = config.theme || 'CORE_DARK';
  const colors = THEMES[theme];

  useEffect(() => {
    // Inject theme variables into root for global access (e.g. for sub-components)
    const root = document.documentElement;
    root.style.setProperty('--ps-primary', colors.primary);
    root.style.setProperty('--ps-secondary', colors.secondary);
    root.style.setProperty('--ps-accent', colors.accent);
    root.style.setProperty('--ps-bg', colors.background);
    root.style.setProperty('--ps-bg-card', colors.card);
    root.style.setProperty('--ps-text-primary', colors.textPrimary);
    root.style.setProperty('--ps-text-secondary', colors.textSecondary);
    root.style.setProperty('--ps-text-muted', colors.textMuted);
    root.style.setProperty('--ps-border', colors.border);
    root.style.setProperty('--ps-gradient', colors.gradient);
  }, [colors]);

  return (
    <div className="min-h-screen antialiased transition-colors duration-500" style={{ backgroundColor: colors.background, color: colors.textPrimary }}>
      {/* --- NAVBAR ---------------------------------------------------- */}
      <nav className="fixed w-full top-0 z-50 shadow-xl"
        style={{ backgroundColor: colors.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href={`/restaurant/${config.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white">{config.name}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {config.navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-white/80 hover:text-white font-semibold text-sm transition-colors duration-200">
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => isOpen ? closeCart() : openCart()}
              className="relative p-2.5 rounded-full text-white transition-all duration-200 shadow hover:shadow-md flex items-center gap-2 px-4"
              style={{ backgroundColor: colors.accent, color: colors.primary }}
            >
              <span className="text-lg">{CartIcon}</span>
              <span className="font-bold text-sm" style={{ color: colors.primary }}>{cartText}</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
            {config.groupOrderLink && (
              <Link href={config.groupOrderLink} target="_blank"
                className="px-5 py-2.5 rounded-full font-bold text-xs bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
                👥 Start Group Order
              </Link>
            )}
            <Link href={config.primaryCTA.href}
              className="px-5 py-2 rounded-full font-bold text-sm transition-all duration-200 hover:opacity-90 shadow-lg border-2"
              style={{ borderColor: config.highlightColor, color: '#fff' }}>
              {config.primaryCTA.label}
            </Link>
          </div>

          {/* Hamburger + Mobile Cart */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => isOpen ? closeCart() : openCart()}
              className="relative p-2 rounded-full text-white transition focus:outline-none"
              style={{ backgroundColor: config.highlightColor, color: config.accentColor }}
            >
              <span className="text-lg">{CartIcon}</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
            <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 focus:outline-none"
            aria-label="Toggle menu">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-in fade-in slide-in-from-top-4 duration-300"
            style={{ backgroundColor: config.accentColor }}>
            {config.navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4 text-white font-bold hover:bg-white/10 transition active:scale-95">
                {l.label}
              </Link>
            ))}
            <div className="px-6 pt-3 pb-2">
              <Link href={config.primaryCTA.href} onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-5 py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95"
                style={{ backgroundColor: config.highlightColor, color: config.accentColor }}>
                {config.primaryCTA.label}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {!hideHero && (
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 md:pt-48 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-black">
          <img src={config.heroImageUrl} alt={config.name}
            className="w-full h-full object-cover opacity-80" />
          {config.heroOverlayOpacity !== undefined ? (
            <div className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${config.heroOverlayOpacity})` }} />
          ) : (
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, ${colors.background}cc, ${colors.background})` }} />
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          {/* Dynamic Headline logic from Sketch */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-10 duration-1000">
            <p className="text-xs font-black text-white/40 tracking-[0.4em] uppercase mb-4">
               {config.tenantType === 'Restaurant' ? 'Yummmmm Food for the Hangry' : 
                config.tenantType === 'Tobacco' ? 'Authentic Quality · Premium Taste' :
                config.tenantType === 'Grocery' ? 'Freshly Harvested · Daily Essentials' :
                'Premium Selection · Curated Quality'}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.9] text-white mb-6 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] italic">
              {config.name}
            </h1>
            <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-10 font-medium px-4">
              {config.description}
            </p>
            {config.allowSearch && (
              <div className="max-w-md mx-auto mb-10 relative">
                <input
                  type="text"
                  placeholder={`Search ${config.name}...`}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-12 py-4 text-white placeholder-white/40 focus:outline-none focus:bg-white/15 transition-all text-sm backdrop-blur-md"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
              </div>
            )}
            <div className="flex justify-center mb-4">
                 <Link href={config.primaryCTA.href}
                    className="group relative px-10 py-5 rounded-3xl overflow-hidden font-black text-[15px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95"
                    style={{ backgroundColor: config.highlightColor, color: config.accentColor }}>
                    <div className="relative z-10">{config.primaryCTA.label}</div>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>
            </div>
          </div>

          {/* --- PRODUCT / SERVICE CAROUSEL --- */}
          <div className="w-full">
            <p className="text-xs font-semibold text-white/20 tracking-widest uppercase mb-5">Browse Our Collection</p>
            <TenantCarousel slides={config.carousel} accent={config.accentColor} />
          </div>
        </div>
      </header>
      )}

      <main className={hideHero ? 'pt-16' : ''}>
        {children}
      </main>

      {/* Global AI Assistant Injection */}
      <TenantBot
        accent={config.accentColor}
        botName={config.specialty ? `${config.specialty} Bot` : (config.botName || 'Assistant')}
        knowledge={config.botKnowledge || {
          businessName: config.name,
          description: config.description,
          address: config.address,
          phone: config.phone,
        }}
      />

      {/* --- PROMO BANNER ------------------------------------------------ */}
      <section className="py-16 px-4 border-y"
        style={{ backgroundColor: `${config.accentColor}15`, borderColor: `${config.accentColor}30` }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-4 border"
            style={{ backgroundColor: `${config.highlightColor}20`, borderColor: `${config.highlightColor}40`, color: config.highlightColor }}>
            {config.promo.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: config.accentColor }}>{config.promo.headline}</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">{config.promo.body}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={config.promo.cta1.href}
              className="px-7 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition"
              style={{ backgroundColor: config.accentColor, color: '#fff' }}>
              {config.promo.cta1.label}
            </Link>
            <Link href={config.promo.cta2.href}
              className="px-7 py-3 rounded-full font-bold border-2 transition hover:opacity-80"
              style={{ borderColor: config.accentColor, color: config.accentColor }}>
              {config.promo.cta2.label}
            </Link>
          </div>
        </div>
      </section>

      {/* --- AI ASSISTANT CALLOUT ---------------------------------------- */}
      <section className="py-14 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-500 text-xs font-semibold mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI Assistant is online right now
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Have a Question?</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Ask about our menu, hours, catering, halal certification, Paan orders, or anything else — our AI answers instantly, 24/7.
          </p>
          <button
            onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Open chat assistant"]')?.click()}
            className="px-7 py-3 rounded-full font-bold text-white shadow-lg hover:opacity-90 transition flex items-center gap-2 mx-auto"
            style={{ backgroundColor: config.accentColor }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Ask the AI Assistant
          </button>
        </div>
      </section>

      {/* --- FOOTER ----------------------------------------------------- */}
      <footer className="py-12 px-4" style={{ backgroundColor: config.accentColor }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div>
            <h3 className="text-xl font-bold mb-4">{config.name}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{config.address}</p>
            <p className="text-white/70 text-sm mt-2">
              <a href={`tel:${config.phone}`} className="hover:text-white transition">{config.phone}</a>
            </p>
            <p className="text-white/70 text-sm mt-1">
              <a href={`mailto:${config.email}`} className="hover:text-white transition">{config.email}</a>
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {config.navLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 hover:text-white text-sm transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Hours</h3>
            {config.botKnowledge?.hours ? (
              <div className="text-white/70 text-sm space-y-1">
                {config.botKnowledge.hours.split('·').map((line, i) => (
                  <p key={i}>{line.trim()}</p>
                ))}
              </div>
            ) : (
              <p className="text-white/70 text-sm">Contact us for hours</p>
            )}
            <p className="text-white/50 text-xs mt-6">
              Powered by <a href="https://paysurity-public-website-44gyeebm6a-uc.a.run.app" className="underline hover:text-white transition">PaySurity</a>
            </p>
            <p className="text-white/40 text-xs mt-1">&copy; {new Date().getFullYear()} {config.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
