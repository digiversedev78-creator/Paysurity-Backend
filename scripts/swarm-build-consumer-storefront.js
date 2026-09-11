#!/usr/bin/env node
/**
 * scripts/swarm-build-consumer-storefront.js
 * Worker C: Build the Consumer-Facing Storefront (currently a shell)
 * Public-facing pages: browse merchants, order food, track order, loyalty.
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT      = path.resolve(__dirname, '..');
const APP_DIR   = path.join(ROOT, 'apps', 'consumer-storefront', 'src', 'app');
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL     = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!GEMINI_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI  = new GoogleGenerativeAI(GEMINI_KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const PAGES = [
  {
    path: 'page.tsx',
    desc: `Consumer Home — Hero section with "Order from BistroBeast" CTA, featured restaurants grid, search bar. 
    Vibrant food-app aesthetic (warm oranges/reds on dark bg). Reads from /api/merchants/public. 
    WOW design — like a premium DoorDash/Uber Eats clone.`,
  },
  {
    path: 'menu/[merchantId]/page.tsx',
    desc: `Restaurant Menu Page — shows merchant name, hero image (use gradient placeholder), menu items in category groups. 
    Each item has name, description, price, "+Add to Cart" button. Reads /api/menu-items?merchantId=X. 
    Cart slides in from the right. Premium food app UX.`,
  },
  {
    path: 'cart/page.tsx',
    desc: `Cart & Checkout — cart items list, quantity controls, subtotal/tax/total. 
    Payment section: card input fields (styled, with Visa/MC icons), "Place Order" button POSTs to /api/orders. 
    Shows order confirmation on success. Clean, trust-inspiring design.`,
  },
  {
    path: 'orders/[orderId]/page.tsx',
    desc: `Order Tracking — live order status tracker (Received → Preparing → Ready → Done), 
    order details, estimated time. Reads /api/orders/:id. 
    Progress bar with animated pulse. Premium UX.`,
  },
  {
    path: 'loyalty/page.tsx',
    desc: `Loyalty Program — customer's points balance, tier badge (Bronze/Silver/Gold), 
    recent points history, available rewards to redeem. Reads /api/loyalty/me. 
    Gamified design with gold accents and animations.`,
  },
  {
    path: 'auth/login/page.tsx',
    desc: `Consumer Login — email+password form, "Continue as Guest" option, branded with PaySurity/BistroBeast. 
    POSTs to /api/auth/login. JWT stored in localStorage. Redirects to home on success. 
    Premium glassmorphism card on food-themed background.`,
  },
];

async function generatePage(pageSpec) {
  const prompt = `You are building the PaySurity Consumer Storefront — a public-facing food ordering app for BistroBeast restaurant.
Design language: premium food delivery app (think Uber Eats premium edition).
Colors: warm dark bg #0F0A00, orange accent #F97316, gold #EAB308, card bg rgba(255,255,255,0.05)
Font: 'Plus Jakarta Sans' from Google Fonts

PAGE: ${pageSpec.path}
DESCRIPTION: ${pageSpec.desc}
API_BASE: ${API_BASE}

Requirements:
1. 'use client'; Next.js 14 component
2. Real fetch() calls to the described API endpoints
3. useState + useEffect with loading skeletons
4. Premium A-grade UI — this is customer-facing, must WOW users
5. Full TypeScript interfaces for all data shapes
6. Mobile-responsive design using inline styles
7. Demo/fallback data if API fails

Output ONLY raw TSX/TypeScript code. No markdown, no explanation.`;

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
  console.log('\n=== Worker C: Building Consumer Storefront ===\n');

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
      console.log(`❌ Failed: ${r.path} — ${r.error || 'empty'}`);
    }
  }

  // Layout + global styles
  const layoutPrompt = `Generate a Next.js 14 consumer storefront layout.tsx for a food ordering app.
Features: sticky top nav with BistroBeast logo, cart icon with item count badge, login button.
Bottom: simple footer with "Powered by PaySurity".
Premium dark design with warm orange accents. Output raw TSX only.`;
  const lr = await gemini.generateContent(layoutPrompt);
  let lCode = lr.response.text().trim().replace(/^```tsx?\n?/,'').replace(/```$/,'').trim();
  if (lCode.length > 200) {
    const lp = path.join(APP_DIR, 'layout.tsx');
    fs.writeFileSync(lp, lCode, 'utf8');
    written++; console.log('✅ Written: layout.tsx');
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(consumer-storefront): Gemini-generated ${written} pages [worker-c]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main --force-with-lease', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch (e) { console.warn(e.message?.slice(0,100)); }

  console.log(`\n✅ Consumer Storefront: ${written} pages written.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
