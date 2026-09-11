#!/usr/bin/env node
/**
 * scripts/swarm-public-website.js
 * Worker Pool 5: PaySurity.com Public Website Enhancement
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT, 'apps/public-website/src/app');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

const BRAND = `
PaySurity Brand:
- Tagline: "The Complete Payment & Business Platform"
- Colors: Dark bg #050508, brand gradient: from #3b82f6 to #8b5cf6 (blue→purple)
- Accent green: #10b981, Orange: #f97316
- Font: Inter (Google Fonts)
- Tone: Professional, modern, trustworthy, innovative
- Target: Restaurant owners, retailers, small business owners across USA
`;

const PAGES = [
  {
    route: 'page.tsx',
    title: 'PaySurity — The Complete Business Payment Platform',
    desc: `World-class homepage for PaySurity.com:
    HERO: Full viewport, dark bg with animated gradient mesh, large headline 
    "Grow Your Business with PaySurity" subhead "POS • Payments • Ordering • Payroll — All in One Platform"
    Two CTA buttons: "Start Free Trial" (green) + "Watch Demo" (outline)
    Animated number counters: 10,000+ Merchants | $2.5B Processed | 99.99% Uptime
    
    FEATURES SECTION: 3-column grid cards:
    • POS System — restaurant/retail/grocery vertical-specific
    • Online Ordering — branded microsite for every merchant
    • Payment Processing — FluidPay integrated, 0% markup for standard merchants
    • Payroll — automated employee payroll
    • Loyalty — built-in loyalty points engine
    • Analytics — real-time revenue insights
    
    SOCIAL PROOF: 3 testimonials from "restaurant owners", star ratings, logos
    
    VERTICALS SECTION: Restaurant, Retail, Grocery — each with screenshot placeholder + CTA
    
    PRICING SECTION: 3 tiers — Starter (free), Growth ($49/mo), Enterprise (custom)
    
    FOOTER: Full footer with links, social icons, PaySurity © 2026`,
  },
  {
    route: 'features/page.tsx',
    title: 'Features | PaySurity',
    desc: `Comprehensive features page:
    - POS System features section with screenshots/illustrations
    - Online ordering / microsite features
    - Payment processing (FluidPay gateway, multi-currency, instant settlements)  
    - Payroll features
    - Loyalty engine features
    - Admin dashboard features
    Premium visual design, feature comparison table at bottom.`,
  },
  {
    route: 'pricing/page.tsx',
    title: 'Pricing | PaySurity',
    desc: `Pricing page with 3 tiers:
    Starter: Free — 1 location, basic POS, up to 100 orders/month
    Growth: $49/mo — 3 locations, online ordering, loyalty, payroll up to 10 employees
    Enterprise: Custom — unlimited locations, white-label, dedicated support, API access
    
    Feature toggle: Monthly / Annual (20% off annual)
    FAQ accordion section
    "Start your 30-day free trial" banner at bottom`,
  },
  {
    route: 'restaurants/page.tsx',
    title: 'Restaurant POS System | PaySurity',
    desc: `Landing page specifically for restaurant owners:
    - Headline: "The Restaurant Management Platform That Boosts Revenue"
    - Features specific to restaurants: QR code table pay, online ordering, dine-in/takeout/delivery
    - Screenshots of BistroBeast POS interface (placeholder cards)
    - Case study: "House of Biryani increased orders by 40% in 3 months"
    - Testimonials from restaurant owners
    - CTA: "Get Your Restaurant Online in 24 Hours"`,
  },
  {
    route: 'restaurants/[slug]/page.tsx',
    title: 'Restaurant Microsite Template',
    desc: `Dynamic restaurant microsite page that reads tenant from URL slug.
    - Fetches: /api/microsite/settings?slug=[slug] for restaurant data
    - Shows: restaurant name, hero image, description, menu categories
    - Links to /restaurants/[slug]/menu and /restaurants/[slug]/order
    - This is the template used when houseofbiryanirestaurant.food forwards here
    - 'use client', fetches from API, shows restaurant branding`,
  },
  {
    route: 'about/page.tsx',
    title: 'About PaySurity',
    desc: `About page:
    - Mission statement: "Empowering every business with enterprise-grade payments"
    - Team section with 4-5 placeholder team member cards
    - Company stats: Founded 2024, Chicago IL, 10,000+ merchants
    - Values: Security first, merchant-centric, innovation
    - Hiring CTA section`,
  },
];

async function generatePage(page) {
  const prompt = `Create a premium Next.js 14 public website page for PaySurity.com.

Route: ${page.route}
Title: ${page.title}

Brand: ${BRAND}

Page content:
${page.desc}

Code requirements:
1. 'use client'; where needed (skip for static pages)
2. Premium A-GRADE design — this is the public face of PaySurity, must WOW visitors
3. Smooth CSS animations (keyframes, transitions)
4. Google Font: Inter
5. Mobile-first responsive with inline styles
6. All navigation links use Next.js Link and are actually clickable
7. SEO: proper <title>, <meta name='description'>, structured data where appropriate
8. No placeholder text like "Lorem ipsum" — use real compelling marketing copy
9. All buttons have distinct hover states

CRITICAL INSTRUCTION: Output ONLY raw TSX. Do not include markdown code block syntax (like \\\`\\\`\\\`tsx and \\\`\\\`\\\`). Do not include conversational filler like "Here is your component". Just the typescript code.`;

  try {
    const r = await g.generateContent(prompt);
    const code = r.response.text().trim().replace(/^```tsx?\n?/,'').replace(/^```\n?/,'').replace(/```$/,'').trim();
    return { route: page.route, code, status: 'OK' };
  } catch(e) {
    return { route: page.route, code: null, status: 'ERR', err: e.message };
  }
}

async function main() {
  console.log('\n=== Worker Pool 5: PaySurity.com Public Website ===\n');

  const results = await Promise.all(PAGES.map(generatePage));

  let written = 0;
  for (const r of results) {
    if (r.status === 'OK' && r.code && r.code.length > 200) {
      const fp = path.join(WEB_DIR, r.route);
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      fs.writeFileSync(fp, r.code, 'utf8');
      console.log(`✅ ${r.route} (${r.code.length} bytes)`);
      written++;
    } else {
      console.log(`❌ ${r.route}: ${r.err || 'empty'}`);
    }
  }

  // Generate global layout if missing
  const layoutPath = path.join(WEB_DIR, 'layout.tsx');
  if (!fs.existsSync(layoutPath) || fs.readFileSync(layoutPath,'utf8').length < 300) {
    const lr = await g.generateContent(`Create the root layout.tsx for paysurity.com public website.
Features:
- Sticky navigation bar: PaySurity logo + nav links (Features, Pricing, Restaurants, About, Login, "Get Started" CTA)
- Footer: company links, legal, social, "Powered by PaySurity © 2026"
- Google Font: Inter
- Dark theme background #050508
- Output raw TSX only.`);
    const lc = lr.response.text().trim().replace(/^```tsx?\n?/,'').replace(/```$/,'').trim();
    if (lc.length > 200) { fs.writeFileSync(layoutPath, lc, 'utf8'); written++; console.log('✅ layout.tsx'); }
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(website): ${written} paysurity.com pages — home/features/pricing/restaurants/about [worker-pool-5]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0,80)); }

  console.log(`\n✅ Worker Pool 5 done: ${written} public website pages.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
