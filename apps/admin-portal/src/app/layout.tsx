import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GOD MODE | PaySurity Command Center',
  description: 'Tier-1 SOC2-compliant super admin gateway — internal use only',
};

// Nav items definition — single source of truth
const NAV_SECTIONS = [
  {
    label: 'Core Operations',
    links: [
      { href: '/',                  icon: '⬡', label: 'God View Dashboard'    },
      { href: '/merchants',         icon: '🏛', label: 'KYB Underwriting'      },
      { href: '/tenants',           icon: '🏢', label: 'Tenant Matrix'         },
      { href: '/security',          icon: '🛡', label: 'Audit & Security'      },
      { href: '/sub-super-admin',   icon: '💠', label: 'Operator Console'      },
    ],
  },
  {
    label: 'Compliance',
    links: [
      { href: '/tickets',           icon: '🎫', label: 'CSR Workspace'         },
      { href: '/disputes',          icon: '⚖',  label: 'Dispute Queue'         },
      { href: '/flags',             icon: '🚩', label: 'Risk Flags'            },
    ],
  },
];


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-[#050506] text-zinc-100 scanlines font-sans selection:bg-red-500/30">
        {/* ── Background Effects ────────────────────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 dot-grid-admin opacity-40" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full glow-point" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-900/5 blur-[100px] rounded-full" />
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="w-64 flex flex-col border-r border-white/[0.05] bg-[#0d0d0f]/95 backdrop-blur-xl shrink-0 z-10 relative">
          {/* Wordmark */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-white/[0.05]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-black shadow-[0_0_15px_rgba(220,38,38,0.4)]">P</div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight">PaySurity</p>
              <p className="text-red-500 text-[10px] font-mono uppercase tracking-[0.25em] leading-none mt-0.5 font-bold">GOD MODE</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-6">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold px-3 mb-2">{section.label}</p>
                <div className="space-y-0.5">
                  {section.links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all duration-200 group"
                    >
                      <span className="text-lg w-6 text-center opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform">{link.icon}</span>
                      <span className="font-medium tracking-tight">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Session Footer */}
          <div className="px-5 py-4 border-t border-white/[0.05] bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-900/40 border border-red-500/20 flex items-center justify-center text-red-400 text-[10px] font-black shadow-inner">SA</div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-200 font-bold truncate">Super Admin</p>
                <p className="text-[9px] text-zinc-600 font-mono tracking-tighter truncate">SEC-CLEARANCE-L5</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" title="Session active" />
            </div>
          </div>
        </aside>

        {/* ── Main Content ───────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent z-10 relative">
          {/* Top bar */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/[0.05] bg-[#0d0d0f]/60 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">Platform Authority Hub</span>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">Confidential</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Live indicator */}
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE NODE: US-EAST-1
              </div>
              <button className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto p-8 custom-scrollbar">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
