'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { BotKnowledge } from '../types/storefront';

export interface TenantBotMessage {
  role: 'bot' | 'user';
  text: string;
}

interface TenantBotProps {
  botName: string;
  accent: string;
  knowledge: BotKnowledge;
  products?: any[]; // Allow bot to access dynamic product catalog
}

/**
 * Context-isolated reply builder.
 */
function buildReply(input: string, k: BotKnowledge, products?: any[]): string {
  const lower = input.toLowerCase();

  // 1. Dynamic Catalog checking FIRST
  if (products && products.length > 0) {
    const productMatch = products.find(p => lower.includes(p.name.toLowerCase()));
    if (productMatch) {
      return `Yes, we have **${productMatch.name}** available! It is priced at $${productMatch.price}. ${productMatch.description ? productMatch.description : ''} You can order it directly through our catalog!`;
    }
  }

  // 2. Specialty keywords — check FIRST so "tell me about biryani" gets a specific response
  if (k.specialties) {
    const matched = k.specialties.find(s => lower.includes(s.toLowerCase()));
    if (matched) {
      const highlight = k.menuHighlights?.find(h => h.toLowerCase().includes(matched.toLowerCase()));
      if (highlight) return `${highlight} is one of our most popular dishes! ${k.menuHighlights && k.menuHighlights.length > 1 ? `Other favourites include: ${k.menuHighlights.filter(h => h !== highlight).slice(0, 3).join(', ')}.` : ''} Tap any menu item above to add it to your order. ⭐`;
      return `${matched.charAt(0).toUpperCase() + matched.slice(1)} is one of our specialties at ${k.businessName}! Check the menu above to order. ⭐`;
    }
  }

  // 3. FAQ matching — fuzzy word overlap
  if (k.faqs) {
    const words = lower.split(/\s+/).filter(w => w.length > 3);
    for (const faq of k.faqs) {
      const qWords = faq.q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.some(w => qWords.includes(w))) return faq.a;
    }
  }

  // 4. Halal / dietary
  if (/halal|haram|certified|islamic|zabiha|zabihah|pork|alcohol/.test(lower)) {
    if (k.halal === true)  return `Yes! Everything at ${k.businessName} is 100% HMS-Certified Halal — no exceptions. 🌙`;
    if (k.halal === false) return `We are not a halal-certified establishment. Please contact us for specific dietary requirements.`;
    return `Please contact us directly for halal certification details.`;
  }

  // 5. Catering / events
  if (/cater|event|party|wedding|reception|bulk|tray|large order/.test(lower)) {
    return k.cateringInfo ?? `We offer catering services! Please call ${k.phone ?? 'us'} to discuss your event. We typically require 48–72 hours notice.`;
  }

  // 6. Hours
  if (/hour|open|close|timing|when/.test(lower)) {
    return k.hours ? `Our hours are: **${k.hours}** 🕐` : `Please call us for current hours: ${k.phone ?? 'see footer'}.`;
  }

  // 7. Location / address / directions
  if (/address|location|where|directions|map|find|nearby/.test(lower)) {
    return k.address ? `We're located at **${k.address}** — come visit us! 📍` : `Please see the contact section for our location.`;
  }

  // 8. Phone / contact
  if (/phone|call|contact|number|reach/.test(lower)) {
    return k.phone ? `You can reach us at **${k.phone}** — we're happy to help! 📞` : `Please see the footer for our contact information.`;
  }

  // 9. Generic menu / food
  if (/menu|special|recommend|popular|best|dish|food|eat|order|what do/.test(lower)) {
    if (k.menuHighlights?.length) {
      return `Our most popular items at ${k.businessName}: **${k.menuHighlights.slice(0, 5).join(', ')}**. Browse the full menu above to order! 🍽️`;
    }
    return `Browse our full menu above — it's updated live. Everything is made fresh! 🍽️`;
  }

  // 10. Default
  return `Hi! I'm the AI assistant for **${k.businessName}**. I can help with menu questions, hours, directions, catering enquiries, and more. What would you like to know? 😊`;
}

export default function TenantBot({ botName, accent, knowledge, products }: TenantBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<TenantBotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [teaserVisible, setTeaserVisible] = useState(false);
  const [teaserMounted, setTeaserMounted] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null!);
  const inputRef = useRef<HTMLInputElement>(null!);

  // Auto-scroll to latest message
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Focus input when panel opens (accessibility)
  useEffect(() => { if (open && isAwake) setTimeout(() => inputRef.current?.focus(), 120); }, [open, isAwake]);

  // Lazy initialize chat on first open
  const startChat = useCallback(() => {
    if (messages.length > 0 || !isAwake) return;
    setMessages([{
      role: 'bot',
      text: `Hi! 👋 I'm **${botName}** — your personal assistant for ${knowledge.businessName}. Ask me about our menu, hours, catering, or anything else!`,
    }]);
  }, [messages.length, botName, knowledge.businessName, isAwake]);

  // Show teaser bubble after 4 s delay
  useEffect(() => {
    if (open || teaserDismissed) return;
    const show = setTimeout(() => {
      setTeaserVisible(true);
      setTimeout(() => setTeaserMounted(true), 30);
    }, 4000);
    return () => clearTimeout(show);
  }, [open, teaserDismissed]);

  // Auto-hide teaser after 10 s
  useEffect(() => {
    if (!teaserVisible) return;
    const hide = setTimeout(() => {
      setTeaserMounted(false);
      setTimeout(() => setTeaserVisible(false), 400);
    }, 10000);
    return () => clearTimeout(hide);
  }, [teaserVisible]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', text }]);
    setLoading(true);
    // Simulate response latency
    await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
    const reply = buildReply(text, knowledge, products);
    setMessages(p => [...p, { role: 'bot', text: reply }]);
    setLoading(false);
  }, [input, loading, knowledge, products]);

  const dismissTeaser = useCallback(() => {
    setTeaserMounted(false);
    setTimeout(() => { setTeaserVisible(false); setTeaserDismissed(true); }, 400);
  }, []);

  const handleOpen = useCallback(() => {
    const newState = !open;
    setIsAwake(true);
    setOpen(newState);
    dismissTeaser();
    if (newState && messages.length === 0) startChat();
  }, [open, messages.length, dismissTeaser, startChat]);

  const accentGlow = `0 8px 32px ${accent}55`;

  return (
    <>
      {/* ── Teaser Bubble ──────────────────────────────────────────────── */}
      {teaserVisible && !open && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-6 z-[1001] w-72"
          style={{
            transform: teaserMounted ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.95)',
            opacity: teaserMounted ? 1 : 0,
            transition: 'all 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/85 backdrop-blur-xl">
            {/* Teaser header */}
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: `${accent}dd` }}>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white text-xs font-black shrink-0">AI</div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{botName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />
                  <span className="text-green-300 text-[10px] font-medium">Online · Always available</span>
                </div>
              </div>
              <button
                onClick={dismissTeaser}
                aria-label="Dismiss chat bubble"
                className="ml-auto text-white/40 hover:text-white transition text-lg leading-none shrink-0"
              >×</button>
            </div>
            {/* Teaser body */}
            <div className="px-4 py-3">
              <p className="text-white/80 text-sm leading-snug">
                Need help? Ask about our menu, hours, or catering! 👋
              </p>
            </div>
            <div className="px-4 pb-3">
              <button
                onClick={handleOpen}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 active:scale-95 relative overflow-hidden group"
                style={{ background: accent }}
              >
                <span className="relative z-10">Chat now →</span>
                <span className="absolute inset-0 bg-white/20 animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        aria-label={open ? `Close ${botName}` : `Open ${botName}`}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-[1002] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: open ? '#1e293b' : accent, boxShadow: open ? 'none' : accentGlow }}
      >
        {/* Pulsing glow ring — only when closed */}
        {!open && (
          <span
            className="absolute inset-0 rounded-full"
            style={{ animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite', backgroundColor: `${accent}44` }}
          />
        )}
        {open
          ? <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        }
      </button>

      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label={`${botName} chat assistant`}
          aria-modal="false"
          className="fixed bottom-24 right-6 z-[1001] w-[380px] max-h-[540px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          style={{ background: 'linear-gradient(180deg, #0c0c10 0%, #050508 100%)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}ee 0%, ${accent}99 100%)` }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-xs shadow-inner shrink-0">AI</div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm truncate">{botName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
                <span className="text-emerald-300 text-[10px] font-medium">Context-aware · {knowledge.businessName}</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'bot'
                      ? 'bg-white/[0.06] text-gray-200 border border-white/[0.05] rounded-tl-none'
                      : 'text-white rounded-tr-none'
                  }`}
                  style={m.role === 'user' ? { background: `linear-gradient(135deg, ${accent}, ${accent}bb)` } : {}}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] border border-white/[0.05] px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  {[0, 160, 320].map(d => (
                    <span
                      key={d}
                      className="w-2 h-2 rounded-full bg-white/30"
                      style={{ animation: `pulse 1.2s ease-in-out ${d}ms infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-4 py-3 border-t border-white/[0.07] flex gap-2 flex-shrink-0 bg-black/30">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={`Ask ${knowledge.businessName} anything…`}
              aria-label="Type your message"
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ background: accent }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Branding footer */}
          <div className="text-center text-[9px] text-white/15 py-1.5 border-t border-white/[0.04] tracking-wider uppercase">
            Powered by PaySurity AI Platform
          </div>
        </div>
      )}
    </>
  );
}