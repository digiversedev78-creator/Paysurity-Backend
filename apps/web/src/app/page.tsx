'use client';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { useState, useEffect, useRef, useCallback } from 'react';
import SavingsCalculator from '../components/SavingsCalculator';

// ── Environment abstraction (mirrors Navbar.tsx) — set NEXT_PUBLIC_DASHBOARD_URL in .env
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001';

const inter = Inter({ subsets: ['latin'] });

// ── Animated counter hook ─────────────────────────────────────────────────────
const useAnimatedNumber = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null!);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setCount(Math.floor(p * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return { count, ref };
};

// ── Feature carousel data ─────────────────────────────────────────────────────
const CAROUSEL_SLIDES = [
  {
    icon: '🖥️',
    title: 'Smart POS System',
    subtitle: 'Restaurants • Retail • Grocery',
    desc: 'Intuitive point-of-sale built for every vertical. Real-time inventory, order management and kitchen display — all in one tap.',
    color: 'from-blue-600 to-indigo-700',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    link: '/pos',
  },
  {
    icon: '📱',
    title: 'Online Ordering',
    subtitle: 'Your branded storefront',
    desc: 'Give customers a fully branded ordering experience. Seamlessly synced with your POS and back-office in real-time.',
    color: 'from-emerald-500 to-teal-700',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    link: '/restaurant',
  },
  {
    icon: '💳',
    title: '0% Markup Processing',
    subtitle: 'Cash Discount Program',
    desc: 'Keep more of every sale. Our Cash Discount model eliminates processing fees for most merchants — guaranteed.',
    color: 'from-purple-600 to-pink-700',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80',
    link: '/pricing',
  },
  {
    icon: '👥',
    title: 'Automated Payroll',
    subtitle: 'Accurate · On-time · Compliant',
    desc: 'Run payroll in minutes, not hours. Direct deposit, tax filings, and compliance baked in from day one.',
    color: 'from-orange-500 to-red-700',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    link: '/payroll',
  },
  {
    icon: '🎁',
    title: 'Loyalty Engine',
    subtitle: 'Drive repeat business',
    desc: 'Configurable points, tiers and rewards that bring customers back. Integrated directly into checkout — zero friction.',
    color: 'from-yellow-400 to-orange-600',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    link: '/products',
  },
  {
    icon: '📊',
    title: 'Live Analytics',
    subtitle: 'Insights that actually matter',
    desc: 'Real-time dashboards for sales, inventory and customer behavior. Know your business before the day is done.',
    color: 'from-cyan-500 to-blue-700',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    link: '/products',
  },
];

// ── Rotating words ────────────────────────────────────────────────────────────
const ROTATING_WORDS = [
  'Restaurant', 'Grocery Store', 'Apparel Boutique', 'Retail Shop',
  'Tobacco Shop', "Accountant's Office", "Lawyer's Office",
  "Dentist's Office", "Chiropractor's Office",
];

// ── Feature Carousel Component ────────────────────────────────────────────────
// UX Design decisions:
//  • Coverflow layout: center card 1.4× wider, elevated, full opacity — visual focus
//  • Side cards scaled 0.82, dimmed 0.55, translated inward so they overlap behind center
//  • Each card has a 200px image area (photo + gradient + dot pattern + large icon)
//  • Side cards show condensed content (no description) — reduces visual clutter
//  • Clicking a side card = "bring to center" (not navigate) — natural coverflow UX
//  • Clicking the CENTER card = navigate to feature page
//  • Auto-advances every 4.5 s, manual control pauses 5 s then resumes
//  • Thicker (3px) gradient progress bar — clearly visible against dark bg
//  • Larger (10px) dot targets — mobile accessible
function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoMs = 4000;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const pausedRef  = useRef(false);

  const clearAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    if (resumeRef.current)   clearTimeout(resumeRef.current);
  };

  const startAutoPlay = useCallback(() => {
    clearAll();
    pausedRef.current = false;
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 100 / (autoMs / 50);
      setProgress(Math.min(p, 100));
    }, 50);
    intervalRef.current = setInterval(() => {
      setActive(i => (i + 1) % CAROUSEL_SLIDES.length);
      setProgress(0);
      p = 0;
    }, autoMs);
  }, []);

  // Start on mount, cleanup on unmount
  useEffect(() => { startAutoPlay(); return clearAll; }, [startAutoPlay]);

  // Manual control: jump to slide index, pause 5 s then resume
  const goTo = useCallback((idx: number) => {
    setActive(idx);
    clearAll();
    pausedRef.current = true;
    setProgress(0);
    resumeRef.current = setTimeout(startAutoPlay, 5000);
  }, [startAutoPlay]);

  const goPrev = useCallback(() =>
    goTo((active - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length), [active, goTo]);

  const goNext = useCallback(() =>
    goTo((active + 1) % CAROUSEL_SLIDES.length), [active, goTo]);

  const getIdx = (offset: number) =>
    (active + offset + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;

  // Card component — shared by desktop and mobile
  const CardFace = ({
    slide, isFocus,
  }: { slide: (typeof CAROUSEL_SLIDES)[0]; isFocus: boolean }) => (
    <div
      className={`rounded-2xl overflow-hidden bg-zinc-900 border transition-all duration-500 ${
        isFocus
          ? 'border-white/20 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)]'
          : 'border-white/5 shadow-lg'
      }`}
    >
      {/* ── Image area ── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${slide.color} transition-all duration-500 ${
          isFocus ? 'h-52' : 'h-36'
        }`}
      >
        {/* Background photo */}
        <img
          src={(slide as any).image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
          loading="lazy"
        />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        {/* Icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            isFocus ? 'scale-110' : 'scale-90'
          }`}
        >
          <span className={`select-none drop-shadow-2xl transition-all duration-500 ${isFocus ? 'text-7xl' : 'text-5xl'}`}>
            {slide.icon}
          </span>
        </div>
        {/* Fade to card body */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-zinc-900 to-transparent" />
      </div>

      {/* ── Content area ── */}
      <div className={`transition-all duration-500 ${isFocus ? 'p-6' : 'p-4'}`}>
        <p className="text-[10px] font-bold text-white/35 tracking-[0.18em] uppercase mb-1">
          {slide.subtitle}
        </p>
        <h3
          className={`font-black text-white tracking-tight transition-all duration-500 ${
            isFocus ? 'text-xl mb-3' : 'text-base mb-0'
          }`}
        >
          {slide.title}
        </h3>
        {isFocus && (
          <div className="min-h-[110px]">
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{slide.desc}</p>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-200 transition-colors">
              Learn more <span>→</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full select-none">

      {/* ══ DESKTOP: Coverflow (center card wider + elevated + overlapping) ══ */}
      <div
        className="hidden md:grid items-center"
        style={{ gridTemplateColumns: '1fr 1.42fr 1fr', overflow: 'visible' }}
      >
        {/* Left card — click to bring to center */}
        <div
          className="relative z-10 cursor-pointer transition-all duration-500"
          style={{ transform: 'scale(0.82) translateX(52px)', opacity: 0.5 }}
          onClick={() => goTo(getIdx(-1))}
          role="button"
          aria-label="Previous slide"
        >
          <CardFace slide={CAROUSEL_SLIDES[getIdx(-1)]} isFocus={false} />
        </div>

        {/* Center card — click to navigate to feature page */}
        <a
          href={CAROUSEL_SLIDES[getIdx(0)].link}
          className="relative z-20 block transition-all duration-500 cursor-pointer"
          style={{ transform: 'translateY(-12px)', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))' }}
        >
          <CardFace slide={CAROUSEL_SLIDES[getIdx(0)]} isFocus={true} />
        </a>

        {/* Right card — click to bring to center */}
        <div
          className="relative z-10 cursor-pointer transition-all duration-500"
          style={{ transform: 'scale(0.82) translateX(-52px)', opacity: 0.5 }}
          onClick={() => goTo(getIdx(1))}
          role="button"
          aria-label="Next slide"
        >
          <CardFace slide={CAROUSEL_SLIDES[getIdx(1)]} isFocus={false} />
        </div>
      </div>

      {/* ══ MOBILE: Full-width center card with color peeks at edges ══ */}
      <div className="md:hidden relative">
        {/* Left color peek */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[10%] z-10 overflow-hidden rounded-r-2xl pointer-events-none"
          style={{ opacity: 0.45 }}
        >
          <div className={`h-full bg-gradient-to-br ${CAROUSEL_SLIDES[getIdx(-1)].color} rounded-r-2xl`} />
        </div>

        {/* Center card */}
        <div className="px-[12%]">
          <a href={CAROUSEL_SLIDES[getIdx(0)].link} className="block cursor-pointer">
            <CardFace slide={CAROUSEL_SLIDES[getIdx(0)]} isFocus={true} />
          </a>
        </div>

        {/* Right color peek */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[10%] z-10 overflow-hidden rounded-l-2xl pointer-events-none"
          style={{ opacity: 0.45 }}
        >
          <div className={`h-full bg-gradient-to-br ${CAROUSEL_SLIDES[getIdx(1)].color} rounded-l-2xl`} />
        </div>
      </div>

      {/* ══ Controls ══ */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:border-white/50 hover:bg-white/5 transition-all text-xl"
        >‹</button>

        <div className="flex gap-2.5 items-center">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-8 h-2.5 bg-blue-400'
                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={goNext}
          aria-label="Next"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:border-white/50 hover:bg-white/5 transition-all text-xl"
        >›</button>
      </div>

      {/* ══ Progress bar (3px, gradient fill) ══ */}
      <div className="mt-4 mx-auto max-w-[220px] h-[3px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400"
          style={{ width: `${progress}%`, transition: 'none' }}
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PaySurityHomePage() {
  const { count: merchantsCount, ref: merchantsRef } = useAnimatedNumber(10000);
  const { count: processedCount, ref: processedRef } = useAnimatedNumber(25, 2500);
  const { count: uptimeCount, ref: uptimeRef } = useAnimatedNumber(9999, 1500);

  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => { setWordIndex(i => (i + 1) % ROTATING_WORDS.length); setWordVisible(true); }, 400);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${inter.className} bg-[#050508] text-gray-200 antialiased`}>

      {/* ────────────────────────────────────────────────────────────
          HERO Section
      ──────────────────────────────────────────────────────────── */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-8 overflow-hidden z-10 pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80"
            alt="Modern merchant using a POS terminal"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/70 via-[#050508]/50 to-[#050508]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          {/* Headline */}
          <div className="mb-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-widest mb-6">
              🇺🇸 Trusted by 10,000+ U.S. Merchants
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 text-white">
              Grow Your{' '}
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 inline-block"
                style={{
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  opacity: wordVisible ? 1 : 0,
                  transform: wordVisible ? 'translateY(0)' : 'translateY(-12px)',
                }}
              >
                {ROTATING_WORDS[wordIndex]}
              </span>
              <br className="hidden md:block" />
              {' '}with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">
                PaySurity
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              POS &bull; Payments &bull; Online Ordering &bull; Payroll &mdash; All in One Platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-14">
              <Link href={`${DASHBOARD_URL}/signup`}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 text-base">
                Start Free Trial — No Card Needed
              </Link>
              <Link href="/products"
                className="px-8 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 hover:border-white/40 transition-all duration-200 flex items-center gap-2 text-base">
                <span className="text-blue-400">▶</span> Live Demo Tour
              </Link>
            </div>
          </div>

          {/* ── PRODUCT / SERVICE CAROUSEL ── */}
          <div className="w-full max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-4">What PaySurity Includes</p>
            <FeatureCarousel />
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────
          PROMO BANNER STRIP
      ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-14 px-4 overflow-hidden border-y border-white/5">
        {/* Glowing bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-blue-900/30" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-semibold tracking-widest mb-4">
            💰 ZERO PROCESSING FEES FOR MOST MERCHANTS
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Stop Paying 3% on Every Sale
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            PaySurity's Cash Discount Program legally passes processing costs to customers who choose to pay by card — you keep 100% of your revenue.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/savings-estimator"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-xl hover:opacity-90 transition-opacity">
              Calculate My Savings
            </Link>
            <Link href={`${DASHBOARD_URL}/signup`}
              className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition">
              Apply Now — Free
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          STATS
      ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { ref: merchantsRef, value: merchantsCount, suffix: '+', label: 'Active Merchants', color: 'text-blue-400' },
            { ref: processedRef, value: processedCount, suffix: 'M+', label: 'Processed Monthly', prefix: '$', color: 'text-emerald-400' },
            { ref: uptimeRef, value: uptimeCount, suffix: '%', label: 'Platform Uptime', prefix: '99.', color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className={`text-5xl font-black mb-2 ${stat.color}`}>
                {stat.prefix || ''}<span ref={stat.ref}>{stat.value.toLocaleString()}</span>{stat.suffix}
              </div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SAVINGS ESTIMATOR CTA (LEAD CAPTURE)
      ──────────────────────────────────────────────────────────── */}
      <section id="calculator" className="relative z-10 py-24 bg-[#0a0f1c] border-t border-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80')] opacity-[0.03] mix-blend-screen" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Discover Your Hidden Savings</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Merchants save an average of $8,400 annually simply by switching to our 0% markup platform. Get a custom, line-by-line savings analysis instantly.
          </p>
          <Link 
            href="/savings-estimator"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0a0f1c] font-black rounded-xl hover:scale-105 transition-transform duration-300 text-lg shadow-xl"
          >
            Calculate My Savings <span className="text-[#0a0f1c]">→</span>
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SOCIAL PROOF / TESTIMONIALS
      ──────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-3">Trusted by Businesses Nationwide</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-14">
            Hear directly from merchants who switched to PaySurity and never looked back.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah L.', biz: 'Owner, The Cozy Bistro', img: 'photo-1573496359142-b8d87734a5a2', quote: 'PaySurity completely transformed our restaurant operations. The POS is super fast, online ordering boosted our takeout by 30%, and payroll is a breeze.' },
              { name: 'Mark P.', biz: 'Proprietor, Urban Threads', img: 'photo-1507003211169-0a1dd7228f2d', quote: 'Switching to PaySurity was the best decision for our boutique. The integrated payments and loyalty program keep our customers coming back.' },
              { name: 'David R.', biz: 'Manager, Fresh Harvest Market', img: 'photo-1472099645785-5658abf4ff4e', quote: 'The analytics dashboard is a game-changer. We track sales in real-time and make quick decisions. Plus, the 0% markup on processing is fantastic!' },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <img src={`https://images.unsplash.com/${t.img}?auto=format&fit=crop&w=80&h=80&q=80`} alt={t.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/40" />
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.biz}</p>
                    <div className="flex text-yellow-400 text-sm mt-1">{'★★★★★'}</div>
                  </div>
                </div>
                <p className="text-gray-300 italic leading-relaxed text-sm">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          VERTICALS
      ──────────────────────────────────────────────────────────── */}
      <section id="verticals" className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-3">Solutions Tailored to Your Industry</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-14">
            PaySurity understands the unique challenges of every business vertical.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { img: 'photo-1517248135467-4c7edcad34c4', title: 'Restaurants', desc: 'From tableside ordering to kitchen display systems, PaySurity powers efficient restaurant operations.' },
              { img: 'photo-1555529669-e69e7aa0ba9a', title: 'Retail', desc: 'Manage inventory, sales, and customer data effortlessly with seamless checkout experiences.' },
              { img: 'photo-1542838132-92c53300491e', title: 'Grocery', desc: 'Handle high-volume transactions, weight-based items, EBT/SNAP, and complex inventory.' },
            ].map((v, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-full h-52 rounded-xl mb-6 overflow-hidden shadow-2xl">
                  <img src={`https://images.unsplash.com/${v.img}?auto=format&fit=crop&w=800&q=80`} alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-gray-300 mb-6 text-sm">{v.desc}</p>
                <Link href="/features" className="px-5 py-2 border border-white/20 text-gray-300 text-sm rounded-lg hover:bg-white/5 hover:text-white transition-all">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          PRICING
      ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 md:px-8 relative z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-3">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-14">No hidden fees. No surprises. Just powerful features.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: 'Free', period: '/ forever', color: 'text-emerald-400', cta: 'Get Started Free',
                href: `${DASHBOARD_URL}/signup?plan=starter`, highlight: false,
                features: ['Basic POS', 'Standard Processing', 'Limited Online Ordering', 'Basic Reporting'],
                missing: ['Payroll', 'Loyalty Program'],
              },
              {
                name: 'Growth', price: '$49', period: '/ month', color: 'from-blue-400 to-purple-500', cta: 'Choose Growth',
                href: `${DASHBOARD_URL}/signup?plan=growth`, highlight: true, badge: 'RECOMMENDED',
                features: ['Advanced POS', '0% Markup Processing', 'Full Online Ordering & Branding', 'Real-time Analytics', 'Automated Payroll', 'Built-in Loyalty Program'],
                missing: [],
              },
              {
                name: 'Enterprise', price: 'Custom', period: '/ quote', color: 'text-orange-400', cta: 'Contact Sales',
                href: '/contact', highlight: false,
                features: ['All Growth features', 'Dedicated Account Manager', 'Custom API Integrations', 'Priority 24/7 Support', 'White-label Solutions', 'Advanced Security & Compliance'],
                missing: [],
              },
            ].map((plan, i) => (
              <div key={i} className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-300 ${
                plan.highlight ? 'border-purple-500/60 bg-purple-500/5 shadow-xl shadow-purple-500/10' : 'border-white/10 bg-white/[0.02]'
              }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">{plan.badge}</div>
                )}
                <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                <p className={`text-5xl font-extrabold mb-6 ${plan.badge === undefined && i === 1 ? 'bg-clip-text text-transparent bg-gradient-to-r ' + plan.color : plan.color}`}>
                  {plan.price}<span className="text-lg font-normal text-gray-400">{plan.period}</span>
                </p>
                <ul className="text-sm text-gray-300 space-y-2.5 mb-8 flex-grow">
                  {plan.features.map(f => <li key={f} className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span>{f}</li>)}
                  {plan.missing.map(f => <li key={f} className="flex items-start gap-2"><span className="text-gray-600 mt-0.5">✗</span><span className="text-gray-600">{f}</span></li>)}
                </ul>
                <Link href={plan.href}
                  className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90'
                      : 'border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          AI ASSISTANT CALLOUT (guides users to try the floating bot)
      ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 relative z-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            PayBot is online right now
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Have Questions? Ask PayBot</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Our AI assistant can calculate your savings, answer pricing questions, walk you through features, or connect you with a real human — instantly.
          </p>
          <button
            onClick={() => { const btn = document.querySelector<HTMLButtonElement>('[aria-label="Open PayBot chat"]'); btn?.click(); }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 flex items-center gap-3 mx-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Talk to PayBot
          </button>
          <p className="text-xs text-gray-600 mt-3">Powered by Gemini AI · End-to-end encrypted · Always free to use</p>
        </div>
      </section>

    </div>
  );
}
