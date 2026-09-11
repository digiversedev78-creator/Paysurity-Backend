'use client';
import React from 'react';
import TenantBot from '../../components/TenantBot';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://paysurity-dashboard-44gyeebm6a-uc.a.run.app';
const SUPER_ADMIN_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || 'https://paysurity-admin-portal-44gyeebm6a-uc.a.run.app';
const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || '/demo-wallet';

const HUB_BOT_KNOWLEDGE = {
  businessName: 'PaySurity Platform',
  description: 'Global fintech operating system for specialized retail, restaurant, and grocery verticals.',
  address: 'Global Operations',
  phone: 'Demo Environment',
  menuHighlights: ['Sovereign Partitioning', 'Real-time Settlement', 'AI Assistant', 'Multi-tenant RLS'],
  specialties: ['fintech', 'pos', 'erp', 'payroll'],
  faqs: [
    { q: 'What is Sovereign Partitioning?', a: 'It is our proprietary architectural pattern that ensures total data and session isolation between tenants at the database and client-side storage layers.' },
    { q: 'How does the AI assistant work?', a: 'Each tenant has a customized AI agent (TenantBot) that understands their specific menu, policies, and catering details.' },
    { q: 'Is the pricing live?', a: 'Yes, all pricing is pulled in real-time from the hardened Drizzle-ORM backend.' },
  ],
};

export default function InvestorLaunchpad() {
  const JOURNEYS = [
    {
      category: "1. The Public Facing Hub (Marketing & Onboarding)",
      description: "Phase 1: Prospective merchants discover PaySurity and begin the integrated application lifecycle.",
      items: [
        {
          name: 'PaySurity Public Website',
          path: '/',
          description: 'Main landing page — marketing hero, feature showcase, and investor narrative.',
          icon: '🌐',
          badge: 'Public',
        },
        {
          name: 'Merchant Sign-Up Funnel',
          path: '/apply',
          description: 'Integrated application wizard for new merchant provisioning and KYB.',
          icon: '📝',
          badge: 'Onboarding',
        },
      ],
    },
    {
      category: "2. Enterprise Command Center (Staff Approval & Ops)",
      description: "Phase 2: Global administrators approve applications, provision tenants, and monitor platform health.",
      items: [
        {
          name: 'Super Admin God-View',
          path: SUPER_ADMIN_URL,
          description: 'Global health monitoring, tenant activation, and platform-wide operations.',
          icon: '🌍',
          badge: 'Control',
        },
        {
          name: 'Onboarding Manual',
          path: '/super-admin-manual',
          description: 'Technical guide for manual merchant activation and provisioning.',
          icon: '📖',
          badge: 'Technical',
        },
      ],
    },
    {
      category: "3. Merchant Owner Hub (Business Setup)",
      description: "Phase 3: Store owners manage their digital identity, configure menus, and track revenue.",
      items: [
        {
          name: 'Merchant Dashboard',
          path: `${DASHBOARD_URL}/dashboard`,
          description: 'Live performance metrics, revenue tracking, and order analytics.',
          icon: '📊',
          badge: 'Operations',
        },
        {
          name: 'Menu & Product Management',
          path: `${DASHBOARD_URL}/dashboard/menu`,
          description: 'Real-time database updates for storefront items and inventory pricing.',
          icon: '🍽️',
          badge: 'Catalogue',
        },
      ],
    },
    {
      category: "4. Consumer-Facing Storefronts (Desktop/Mobile Web)",
      description: "Phase 4: Branded, high-conversion microsites where end-users browse and place orders.",
      items: [
        {
          name: 'House of Biryani — Storefront',
          path: '/restaurant/house-of-biryani',
          description: 'Premium restaurant microsite with 13 categories and full menu.',
          icon: '🍛',
          badge: 'Restaurant',
        },
        {
          name: 'Ashiana Collections',
          path: '/retail/ashiana',
          description: 'Apparel vertical — live DB catalog with complex variant support.',
          icon: '👗',
          badge: 'Retail',
        },
        {
          name: 'Tawakkul Restaurant',
          path: '/restaurant/tawakkul-restaurant',
          description: 'HMS-Certified Halal Pakistani & Indian vertical.',
          icon: '🕌',
          badge: 'Halal',
        },
        {
          name: 'Grand Tobacco Hub',
          path: '/tobacco/grand-tobacco-hub',
          description: 'Retail storefront with integrated ZKP age-gate at checkout.',
          icon: '🔖',
          badge: 'Smoke Shop',
        },
        {
          name: 'GrocerStore (Grocery Site)',
          path: '/grocery/grocerease',
          description: 'Live grocery storefront demo with inventory and local delivery flow.',
          icon: '🧺',
          badge: 'Grocery',
        },
      ],
    },
    {
      category: "5. POS Hub (On-Site Fulfillment)",
      description: "Phase 5: High-speed cashier interfaces for in-person transactions and order fulfillment.",
      items: [
        {
          name: 'Restaurant POS',
          path: `${DASHBOARD_URL}/pos`,
          description: 'Full-service dining terminal with table mapping and multi-tender.',
          icon: '🍽️',
          badge: 'POS',
        },
        {
          name: 'Retail POS',
          path: `${DASHBOARD_URL}/retail-pos`,
          description: 'SKU-master terminal with barcode and inventory sync.',
          icon: '🏪',
          badge: 'POS',
        },
        {
          name: 'GrocerEase (Grocery POS)',
          path: `${DASHBOARD_URL}/grocery-pos`,
          description: 'Specialized grocery terminal with scale integration and EBT support.',
          icon: '🛒',
          badge: 'POS',
        },
      ],
    },
    {
      category: "6. The Consumer Wallet (Payment & Ledger)",
      description: "Phase 6: The transaction lifecycle settles into the PaySurity ledger and consumer wallet ecosystem.",
      items: [
        {
          name: 'Employer & Employee Wallet',
          path: WALLET_URL,
          description: 'B2B funds management: Payroll, wage access, and corporate spending.',
          icon: '💼',
          badge: 'Employer',
        },
        {
          name: 'Parent & Child Wallet',
          path: WALLET_URL,
          description: 'B2C family funds: Allowance management and child spending controls.',
          icon: '👨‍👩‍👧‍👦',
          badge: 'Family',
        },
        {
          name: 'Standard Wallet View',
          path: WALLET_URL,
          description: 'General consumer interface for QR pay and P2P transfers.',
          icon: '📱',
          badge: 'Mobile',
        },
      ],
    },
    {
      category: "7. Integrated Payroll & Disbursements",
      description: "Phase 7: Efficient wage distribution and tax compliance built directly on the PaySurity ledger.",
      items: [
        {
          name: 'Payroll Admin Portal',
          path: `${DASHBOARD_URL}/payroll`,
          description: 'Automated wage calculation, withholding, and direct disbursement engine.',
          icon: '🏦',
          badge: 'Enterprise',
        },
        {
          name: 'Ledger Settlement View',
          path: SUPER_ADMIN_URL,
          description: 'Real-time visibility into cross-tenant fund movements and liquidity.',
          icon: '⚖️',
          badge: 'Accounting',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-sans overflow-x-hidden selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-20 py-12">

        {/* Header Section */}
        <header className="text-center space-y-4">
          <div className="inline-block px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-[0.2em] uppercase">
            Confidential Shareholder Interface
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            Shareholder Demo/ <span className="text-blue-500 font-black">PaySurity Fintech Asset Inventory</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
            The multi-vertical global payment operating system. Final audit configuration.
          </p>
        </header>

        {/* Persona Navigation Matrix */}
        <section className="pt-12 space-y-24">
          {JOURNEYS.map((journey, jIdx) => (
            <div key={jIdx} className="space-y-6">
              <div className="flex flex-col items-start space-y-2 border-l-4 border-blue-500 pl-6">
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {journey.category}
                </h2>
                <p className="text-zinc-500 text-sm font-medium">
                  {journey.description}
                </p>
              </div>

              <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`}>
                {journey.items.map((vert: any, idx) => (
                  <a
                    key={idx}
                    href={vert.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-all duration-200 shadow-xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-3xl">
                        {vert.icon}
                      </div>
                      <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-400 rounded uppercase tracking-widest">
                        {vert.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {vert.name}
                    </h3>

                    <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                      {vert.description}
                    </p>

                    <div className="text-blue-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      Access Environment <span>→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="text-center text-zinc-600 text-xs pt-8 border-t border-zinc-900 space-y-1">
          <p>PaySurity Confidential · Demo Environment · Not for distribution</p>
          <p>All data is synthetic or seeded from real merchant menus for demonstration purposes.</p>
        </footer>
      </div>
      <TenantBot knowledge={HUB_BOT_KNOWLEDGE} accent="#3b82f6" botName="Platform Assistant" />
    </div>
  );
}
