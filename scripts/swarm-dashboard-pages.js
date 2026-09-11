#!/usr/bin/env node
/**
 * scripts/swarm-dashboard-pages.js
 * Worker Pool 3: Complete remaining merchant dashboard pages
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT     = path.resolve(__dirname, '..');
const DASH_DIR = path.join(ROOT, 'apps/merchant-dashboard/src/app/dashboard');
const KEY      = process.env.GEMINI_API_KEY;
const MODEL    = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_URL  = process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-111328865246.us-central1.run.app';

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

const DESIGN_SYSTEM = `
Dark dashboard design system:
--bg: #09090b, --card: #18181b, --border: rgba(63,63,70,0.5)
--accent-blue: #3b82f6, --accent-purple: #8b5cf6, --accent-green: #10b981
--accent-orange: #f97316, --text: #fafafa, --muted: #71717a
Font: Inter (Google Fonts). Use inline styles. NO Tailwind.
All cards: background:'rgba(24,24,27,0.8)', border:'1px solid rgba(63,63,70,0.5)', borderRadius:12, padding:24
Premium glassmorphism, subtle gradients, smooth hover effects.
`;

const PAGES = [
  {
    route: 'analytics',
    title: 'Analytics & Insights',
    description: `Analytics dashboard with:
    - Revenue over time line chart (Canvas/SVG-based, no chart library needed — draw manually or use simple bar rects)
    - Top menu items by revenue (horizontal bar chart)
    - Orders by hour heat map
    - Customer retention rate KPI
    - Average order value trend
    Fetches: /api/analytics/revenue, /api/analytics/top-items, /api/analytics/peak-hours
    Date range picker: Today, 7 days, 30 days, Custom
    Demo fallback data with realistic restaurant numbers.`,
  },
  {
    route: 'payroll',
    title: 'Payroll',
    description: `Payroll management page:
    - Employee list with hours worked this period, hourly rate, gross pay
    - Run payroll button → POST /api/payroll/runs
    - Payroll history table (date, employee count, total amount, status)
    - Export to CSV button
    Fetches: /api/employees, /api/payroll/runs
    Color-coded status: pending/processing/paid/failed`,
  },
  {
    route: 'reports',
    title: 'Reports',
    description: `Business reports page:
    - Daily summary: orders count, revenue, avg ticket, busiest hour
    - Tax collected report (by month)
    - Sales by category pie chart (SVG-based)
    - Export buttons (CSV/PDF placeholder)
    Fetches: /api/reports/daily-summary, /api/reports/tax
    Professional report layout, print-friendly styling.`,
  },
  {
    route: 'loyalty',
    title: 'Loyalty Program',
    description: `Loyalty program management:
    - Total enrolled members count KPI
    - Points issued vs redeemed this month
    - Top members leaderboard table (name, tier badge, points balance)
    - Recent redemptions feed
    - Configure: points per dollar, redemption threshold
    Fetches: /api/loyalty/members
    Tier badges: Bronze/Silver/Gold with respective colors.`,
  },
  {
    route: 'catering',
    title: 'Catering Orders',
    description: `Catering order management dashboard:
    - Upcoming catering orders calendar/list view
    - Order cards: customer name, event date, guest count, items summary, status badge, total
    - Actions: Confirm, Request Deposit, Mark Paid, Cancel
    - 48-hour notice warning for new requests
    - Revenue from catering this month KPI
    Fetches: /api/catering-orders
    Status badges: pending (orange), confirmed (blue), deposit_paid (purple), fulfilled (green).`,
  },
  {
    route: 'notifications',
    title: 'Notifications',
    description: `Notification center:
    - Unread notifications list with type icons (order, payment, review, system)
    - Mark all read button
    - Notification templates (email/SMS) list with edit icons
    - Send test notification form
    Fetches: /api/notifications (use demo data fallback)
    Real-time feel with animated unread badge.`,
  },
];

async function generatePage(page) {
  const prompt = `Create a premium Next.js 14 'use client' merchant dashboard page.

Route: /dashboard/${page.route}
Title: ${page.title}
API Base: ${API_URL}

${DESIGN_SYSTEM}

Page requirements:
${page.description}

Technical constraints & Anti-Hallucination rules:
1. 'use client'; strictly at the very top.
2. useState + useEffect for all data fetching.
3. Strongly typed TypeScript interfaces for the API response.
4. If no data exists yet, provide an ultra-premium Empty State with helpful messaging.
5. Apply deep glassmorphism specifically matching PaySurity aesthetic: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
6. ALWAYS simulate fetch requests via standard fetch wrapper patterns, gracefully falling back to mocked constants if the backend returns 404/500 to keep the dashboard intact.
7. Charts: If recharts is used, use PIE_COLORS arrays or neon gradients (purple: #8B5CF6, blue: #3B82F6, emerald: #10B981).
8. NO random CSS frameworks; use ONLY Tailwind CSS.
9. ONLY respond with pure typescript text in one complete raw block. No markdown \\\`\\\`\\\` wrappers. No comments.`;

  try {
    const result = await g.generateContent(prompt);
    const code = result.response.text().trim()
      .replace(/^```tsx?\n?/,'').replace(/^```\n?/,'').replace(/```$/,'').trim();
    return { route: page.route, code, status: 'OK' };
  } catch(e) {
    return { route: page.route, code: null, status: 'ERR', err: e.message };
  }
}

async function main() {
  console.log('\n=== Worker Pool 3: Dashboard Pages ===\n');
  console.log(`Generating ${PAGES.length} pages in parallel...\n`);

  const results = await Promise.all(PAGES.map(generatePage));

  let written = 0;
  for (const r of results) {
    if (r.status === 'OK' && r.code && r.code.length > 200) {
      const dir = path.join(DASH_DIR, r.route);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'page.tsx'), r.code, 'utf8');
      console.log(`✅ /dashboard/${r.route} (${r.code.length} bytes)`);
      written++;
    } else {
      console.log(`❌ /dashboard/${r.route}: ${r.err || 'empty'}`);
    }
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(dashboard): ${written} new pages — analytics/payroll/reports/loyalty/catering/notifications [worker-pool-3]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0,80)); }

  console.log(`\n✅ Worker Pool 3 done: ${written} dashboard pages.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
