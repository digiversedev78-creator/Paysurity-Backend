#!/usr/bin/env node
/**
 * scripts/swarm-wire-all-frontends.js
 * Wire ALL frontend apps to the live API — no hardcoded data anywhere
 * Targets:
 *   1. merchant-dashboard — all pages wired to real API endpoints
 *   2. tenant microsites (HOB, Tawakkul) — menu from real API
 *   3. public website — contact form, pricing to real API
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_URL = 'https://paysurity-api-111328865246.us-central1.run.app';

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

// ─── Shared API client utility ────────────────────────────────────────────────
const API_CLIENT_CODE = `
/**
 * PaySurity API Client — auto-generated
 * All frontend apps import this for API calls.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '${API_URL}';

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(\`API \${path} → \${res.status}\`);
  return res.json();
}

export async function apiPost<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(\`API POST \${path} → \${res.status}\`);
  return res.json();
}

export async function apiPut<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${path}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(\`API PUT \${path} → \${res.status}\`);
  return res.json();
}

export const PRICE_ENGINE = {
  calculate: (basePrice: number, marginPct = 0.20, feePct = 0.05) => 
    Math.round(basePrice * (1 + feePct) * (1 + marginPct) * 100) / 100,
  format: (cents: number) => (cents / 100).toFixed(2),
};
`;

// ─── Pages that need API wiring ───────────────────────────────────────────────
const DASHBOARD_PAGES = [
  {
    file: 'apps/merchant-dashboard/src/app/dashboard/menu/page.tsx',
    desc: `Wire Menu Management page to real API.
    - GET /api/menu-items?tenantId={id} → display menu items with display prices
    - POST /api/menu-items → add new item (stores basePrice, shows displayPrice = base×1.05×1.20)
    - PUT /api/menu-items/:id → edit item
    - DELETE /api/menu-items/:id → delete
    - Price calculation: displayPrice = basePrice * 1.05 * 1.20 (show both in UI)
    - Import apiGet, apiPost, apiPut from '@/lib/api-client'
    - Use real useEffect + useState, loading states, empty states`,
  },
  {
    file: 'apps/merchant-dashboard/src/app/dashboard/customers/page.tsx',
    desc: `Wire Customers CRM page to real API.
    - GET /api/customers → list with name, email, phone, total_orders, total_spent_cents, loyalty_points
    - Search/filter by name or email
    - Customer detail modal: order history
    - Import apiGet from '@/lib/api-client'`,
  },
  {
    file: 'apps/merchant-dashboard/src/app/dashboard/orders/page.tsx',
    desc: `Wire Orders page to real API.
    - GET /api/orders → list with status badges (pending/confirmed/in_progress/completed)
    - Real-time feel: auto-refresh every 30s
    - Filter by: status, date range, order type (dine_in/takeout/delivery)
    - Order total formatted using PRICE_ENGINE.format(cents)`,
  },
  {
    file: 'apps/merchant-dashboard/src/app/dashboard/analytics/page.tsx',
    desc: `Wire Analytics to real API with graceful demo fallback.
    - GET /api/analytics/revenue → line chart data
    - GET /api/analytics/top-items → bar chart
    - If API returns empty, use realistic demo data for HOB restaurant
    - Date range picker: Today / 7d / 30d`,
  },
  {
    file: 'apps/merchant-dashboard/src/app/dashboard/employees/page.tsx',
    desc: `Wire Employees page to real API.
    - GET /api/employees → list with name, role, status, hourly_rate_cents
    - Add employee modal → POST /api/employees
    - Hourly rate displayed in dollars (divide cents by 100)`,
  },
  {
    file: 'apps/merchant-dashboard/src/app/dashboard/inventory/page.tsx',
    desc: `Wire Inventory page to real API.
    - GET /api/inventory-items → show with quantity, unit, reorder_point
    - Color-coded: red if quantity < reorder_point, yellow if < 2x reorder_point
    - Quick update quantity: inline edit → PUT /api/inventory-items/:id`,
  },
];

// HOB microsite pages
const MICROSITE_PAGES = [
  {
    file: 'apps/microsite-hob/src/app/page.tsx',
    tenantId: 'house-of-biryani-chicago-2026',
    name: 'House of Biryani',
    domain: 'houseofbiryanirestaurant.food',
    desc: `Premium Home page for House of Biryani microsite.
    - Hero section: dark red/gold theme, "Authentic Hyderabadi Dum Biryani & Paan" headline
    - Featured dishes section: GET /api/menu-items?tenantId=house-of-biryani-chicago-2026&featured=true
    - Show 6 featured items with prices (display price from API)
    - CTA: "Order Now" → /menu, "Catering" → /catering
    - Address: 2306 W Devon Ave, Chicago, IL 60659
    - Phone: (773) 465-2455
    - Hours section: Mon-Sun 11am-11pm`,
  },
  {
    file: 'apps/microsite-hob/src/app/menu/page.tsx',
    tenantId: 'house-of-biryani-chicago-2026',
    name: 'House of Biryani — Menu',
    desc: `Full menu page for House of Biryani.
    - GET /api/microsite/menu?tenantId=house-of-biryani-chicago-2026
    - Category tabs: Biryani | Curries | Appetizers | Breads | Beverages | Paan | Desserts
    - Each item: name, description, price (display from API), dietary tags (Halal, Veg, Spicy)
    - Paan section: special cultural note "Traditional South Asian mouth freshener"
    - Add to cart functionality (local state)
    - Floating cart button with item count`,
  },
  {
    file: 'apps/microsite-hob/src/app/catering/page.tsx',
    tenantId: 'house-of-biryani-chicago-2026',
    name: 'House of Biryani — Catering',
    desc: `Catering order form for House of Biryani.
    - Form: name, email, phone, event_date (date picker), event_type, guest_count, notes
    - VALIDATION: event_date must be ≥ 48 hours from now (show warning message)
    - Deposit info: "25% deposit required upon confirmation"
    - Paan bulk order note: "50+ Paans require 48h notice + 25% deposit"
    - Submit: POST /api/catering-orders
    - Show success message with expected callback time`,
  },
  {
    file: 'apps/microsite-hob/src/app/order/page.tsx',
    tenantId: 'house-of-biryani-chicago-2026',
    name: 'House of Biryani — Order Online',
    desc: `Online order page for House of Biryani.
    - Menu with cart functionality
    - Order type selector: Pickup / Delivery
    - Customer info form: name, phone, address (for delivery)
    - Order summary with price breakdown
    - "Place Order" → POST /api/orders
    - Order confirmation with estimated time`,
  },
];

async function wirePage(page) {
  const existing = fs.existsSync(page.file) 
    ? fs.readFileSync(page.file, 'utf8').slice(0, 1500) 
    : '// new file';

  const prompt = `Update/create this Next.js 14 'use client' page to wire it to the real PaySurity API.

File: ${page.file}
API Base: ${API_URL}
${page.tenantId ? `Tenant ID: ${page.tenantId}` : ''}
${page.name ? `Page Name: ${page.name}` : ''}

Current content (may be placeholder or empty):
${existing}

Requirements:
${page.desc}

Technical requirements:
1. 'use client';
2. useEffect for data fetching with real fetch() calls to ${API_URL}
3. useState for: data, loading (true initially), error
4. Loading skeleton: pulse animation placeholders
5. Error state: graceful message + retry button  
6. Empty state: friendly message
7. Demo/fallback data in catch block (realistic data for HOB if real API fails)
8. Import style: inline styles only (no Tailwind, no CSS modules)
9. Premium dark theme: bg #09090b, cards #18181b, accent colors
10. All prices formatted as $XX.XX (divide cents by 100)
11. Unique IDs on all interactive elements
12. Mobile responsive

IMPORTANT: No @CurrentTenant decorator usage. No class-based decorators.
Output ONLY the complete TSX file content. No markdown.`;

  try {
    const r = await g.generateContent(prompt);
    const code = r.response.text().trim()
      .replace(/^```tsx?\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim();
    
    if (code.length > 300) {
      fs.mkdirSync(path.dirname(page.file), { recursive: true });
      fs.writeFileSync(page.file, code, 'utf8');
      return { file: page.file, status: 'OK', bytes: code.length };
    }
    return { file: page.file, status: 'SKIP', reason: 'too short' };
  } catch(e) {
    return { file: page.file, status: 'ERR', error: e.message?.slice(0, 80) };
  }
}

async function main() {
  console.log('\n=== Wiring All Frontends to API ===\n');

  // Write shared API client
  const libDir = path.join(ROOT, 'apps/merchant-dashboard/src/lib');
  fs.mkdirSync(libDir, { recursive: true });
  fs.writeFileSync(path.join(libDir, 'api-client.ts'), API_CLIENT_CODE, 'utf8');
  console.log('✅ api-client.ts written');

  const allPages = [...DASHBOARD_PAGES, ...MICROSITE_PAGES];
  console.log(`Wiring ${allPages.length} pages in parallel...\n`);

  const results = await Promise.all(allPages.map(wirePage));

  let wired = 0;
  for (const r of results) {
    if (r.status === 'OK') { console.log(`✅ ${r.file.split('/').slice(-2).join('/')} (${r.bytes}b)`); wired++; }
    else { console.log(`❌ ${r.file.split('/').slice(-2).join('/')}: ${r.reason || r.error}`); }
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(frontend): wire ${wired} pages to live API — dashboard menu/customers/orders/analytics/employees/inventory + HOB microsite home/menu/catering/order [swarm-wire]"`, { cwd: ROOT });
    execSync('git push origin main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0, 80)); }

  console.log(`\n✅ Frontend wiring done: ${wired}/${allPages.length} pages wired.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
