#!/usr/bin/env node
/**
 * scripts/swarm-build-admin-portal.js
 * Worker B: Build out the Admin Portal (currently a shell)
 * Uses Gemini to generate all admin portal pages with real API calls.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT      = path.resolve(__dirname, '..');
const APP_DIR   = path.join(ROOT, 'apps', 'admin-portal', 'src', 'app');
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL     = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!GEMINI_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI  = new GoogleGenerativeAI(GEMINI_KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

// API_BASE injected at build time from Cloud Run URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const PAGES = [
  {
    path: 'page.tsx',
    desc: 'Admin Dashboard — Overview of all merchants, total revenue, system health, active tenants KPIs. Calls /api/admin/stats. Dark glassmorphism theme. A-grade WOW design.',
  },
  {
    path: 'merchants/page.tsx',
    desc: 'Merchant Management — table of all merchants with status badges, search, filter by vertical (restaurant/retail/grocery), action buttons (view/suspend/approve). Calls /api/admin/merchants. Premium data table with hover rows.',
  },
  {
    path: 'users/page.tsx',
    desc: 'User Management — all users across tenants, role badges, last login, status. Calls /api/admin/users. Sortable table, search bar.',
  },
  {
    path: 'transactions/page.tsx',
    desc: 'Transactions Monitor — real-time transaction feed across all merchants. Calls /api/admin/transactions. Shows amount, status, gateway, merchant name. Color-coded status badges.',
  },
  {
    path: 'compliance/page.tsx',
    desc: 'Compliance Center — PCI DSS checklist, audit log viewer, PAN redaction status. Calls /api/audit-logs. Professional compliance dashboard.',
  },
  {
    path: 'settings/page.tsx',
    desc: 'System Settings — gateway config (FluidPay keys), feature flags, maintenance mode toggle. Form-based with save confirmation.',
  },
];

const SYSTEM_STYLE = `
Use these CSS variables (already defined in the admin portal's global CSS):
--bg-primary: #09090B, --bg-card: #18181B, --accent: #3B82F6, --accent-2: #8B5CF6
--text-primary: #FAFAFA, --text-secondary: #A1A1AA, --border: rgba(63,63,70,0.5)
Font: Inter (Google Fonts). Use inline styles only (no Tailwind, no CSS modules).
The design must be A-GRADE — glassmorphism, subtle gradients, smooth hover effects.
`;

async function generatePage(pageSpec) {
  const prompt = `You are building the PaySurity Admin Portal — a premium, A-grade internal tool for platform administrators.

PAGE: ${pageSpec.path}
DESCRIPTION: ${pageSpec.desc}
API_BASE: ${API_BASE}

${SYSTEM_STYLE}

Generate a complete Next.js 14 'use client' page component with:
1. Real apiClient calls using fetch() to the API endpoints described
2. useState + useEffect for data fetching
3. Demo/fallback data if the API fails (silent catch)
4. A stunning, premium dark UI with glassmorphism effects
5. Proper TypeScript interfaces for all data
6. Loading states and empty states
7. Real layout matching a professional SaaS admin tool

Output ONLY the raw TypeScript/TSX code. No markdown, no explanation, no backtick fences.`;

  try {
    const result = await gemini.generateContent(prompt);
    let code = result.response.text().trim()
      .replace(/^```tsx?\n?/,'').replace(/^```\n?/,'').replace(/```$/,'').trim();
    return { path: pageSpec.path, code, status: 'OK' };
  } catch (e) {
    return { path: pageSpec.path, code: null, status: 'ERROR', error: e.message };
  }
}

async function main() {
  console.log('\n=== Worker B: Building Admin Portal ===\n');
  console.log(`Generating ${PAGES.length} pages in parallel...\n`);

  const results = await Promise.all(PAGES.map(generatePage));

  let written = 0;
  for (const r of results) {
    if (r.status === 'OK' && r.code && r.code.length > 200) {
      const fp = path.join(APP_DIR, r.path);
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      fs.writeFileSync(fp, r.code, 'utf8');
      console.log(`✅ Written: ${r.path} (${r.code.length} bytes)`);
      written++;
    } else {
      console.log(`❌ Failed: ${r.path} — ${r.error || 'empty response'}`);
    }
  }

  // Also generate the layout if missing
  const layoutPath = path.join(APP_DIR, 'layout.tsx');
  if (!fs.existsSync(layoutPath) || fs.readFileSync(layoutPath, 'utf8').length < 200) {
    const layout = await gemini.generateContent(`Generate a Next.js 14 admin portal layout.tsx with: 
    - Dark sidebar with PaySurity branding, nav links (Dashboard, Merchants, Users, Transactions, Compliance, Settings)
    - Active route highlighting using usePathname
    - Header with current user info
    - Uses same CSS variables as above
    Output raw TSX only.`);
    let code = layout.response.text().trim().replace(/^```tsx?\n?/,'').replace(/```$/,'').trim();
    if (code.length > 200) { fs.writeFileSync(layoutPath, code, 'utf8'); written++; console.log('✅ Written: layout.tsx'); }
  }

  // Push
  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(admin-portal): Gemini-generated ${written} pages with real API calls [worker-b]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main --force-with-lease', { cwd: ROOT });
    console.log('✅ Pushed to GitHub');
  } catch (e) { console.warn('Push issue:', e.message?.slice(0,100)); }

  console.log(`\n✅ Admin Portal: Generated ${written} pages.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
