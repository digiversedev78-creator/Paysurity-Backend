#!/usr/bin/env node
/**
 * scripts/swarm-tenant-microsites.js
 * 
 * MEGA PARALLEL WORKER — Builds two complete tenant microsites:
 * 1. House of Biryani (houseofbiryanirestaurant.food)
 * 2. Tawakkul Restaurant (tawakkulrestaurantchicago.food on PaySurity)
 * 
 * Tasks (all parallel via Gemini):
 * - Seed SQL for each tenant
 * - Full microsite Next.js app for each
 * - Tenant Admin Panel (CRUD menu/items/prices/images)
 * - Price calculation engine (base + 5% fees + 20% PaySurity margin)
 * - POS ↔ microsite sync endpoints
 * - Canonical requirement doc updates
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT     = path.resolve(__dirname, '..');
const KEY      = process.env.GEMINI_API_KEY;
const MODEL    = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI  = new GoogleGenerativeAI(KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

// ─── Price calculation engine ──────────────────────────────────────────────────
// displayPrice = basePrice * (1 + 0.05) * (1 + 0.20) = basePrice * 1.26
function calcDisplayPrice(basePrice, marginPct = 0.20, processingFee = 0.05) {
  return Math.round(basePrice * (1 + processingFee) * (1 + marginPct) * 100) / 100;
}

// ─── Restaurant Data ────────────────────────────────────────────────────────────
const HOUSE_OF_BIRYANI = {
  slug: 'house-of-biryani',
  name: 'House of Biryani',
  domain: 'houseofbiryanirestaurant.food',
  address: '2306 W Devon Ave, Chicago, IL 60659',
  phone: '(773) 465-2455',
  cuisine: 'South Indian & Pakistani',
  description: 'Authentic Hyderabadi, South Indian & Pakistani cuisine. Famous for our signature Dum Biryani, Haleem, and fresh Paan.',
  tenantId: 'house-of-biryani-chicago-2026',
  heroColor: '#8B0000', // deep biryani red
  categories: [
    {
      name: 'Biryani',
      description: 'Aromatic slow-cooked dum biryani',
      items: [
        { name: 'Hyderabadi Goat Dum Biryani', base: 18.00, desc: 'Slow-cooked goat with aromatic basmati rice, saffron & dum spices', isSignature: true },
        { name: 'Hyderabadi Chicken Biryani', base: 14.00, desc: 'Tender chicken layered with fragrant basmati rice', isSignature: true },
        { name: 'Veg Biryani', base: 11.00, desc: 'Fresh vegetables and paneer in aromatic dum rice', isVeg: true },
        { name: 'Mutton Biryani', base: 20.00, desc: 'Slow-cooked mutton with rich spices and basmati rice' },
        { name: 'Egg Biryani', base: 12.00, desc: 'Fluffy eggs layered with biryani spices and basmati' },
      ],
    },
    {
      name: 'Haleem & Soups',
      description: 'Traditional slow-cooked dishes',
      items: [
        { name: 'Goat Haleem', base: 17.00, desc: 'Slow-cooked goat with lentils & wheat, garnished with fried onions & ginger', isSignature: true },
        { name: 'Chicken Haleem', base: 13.00, desc: 'Slow-cooked chicken with lentils, a protein-rich comfort dish' },
        { name: 'Paya Soup', base: 15.00, desc: 'Traditional trotters slow-cooked in aromatic spices' },
      ],
    },
    {
      name: 'Chicken Specials',
      description: 'Signature chicken dishes',
      items: [
        { name: 'Chicken 65', base: 18.00, desc: 'Crispy deep-fried chicken with South Indian spices and curry leaves' },
        { name: 'Chicken Manchurian', base: 18.00, desc: 'Indo-Chinese style chicken in tangy manchurian sauce' },
        { name: 'Butter Chicken', base: 15.00, desc: 'Creamy tomato-based curry with tender chicken' },
        { name: 'Chicken Tikka Masala', base: 16.00, desc: 'Grilled chicken in rich tikka masala gravy' },
        { name: 'Chilli Chicken', base: 16.00, desc: 'Spicy Indo-Chinese style fried chicken with bell peppers' },
        { name: 'Chilli Garlic Chicken', base: 16.00, desc: 'Fiery garlic-infused chicken tossed with green chillies' },
      ],
    },
    {
      name: 'Mutton & Seafood',
      description: 'Rich meat curries',
      items: [
        { name: 'Mutton Karahi', base: 20.00, desc: 'Tender mutton cooked in wok with tomatoes and spices' },
        { name: 'Mutton Korma', base: 20.00, desc: 'Rich mughlai-style mutton in creamy korma sauce' },
        { name: 'Fish Curry', base: 19.00, desc: 'Fresh fish in tangy South Indian coconut curry' },
        { name: 'Chilli Fish', base: 19.00, desc: 'Crispy fried fish tossed in Indo-Chinese chilli sauce' },
      ],
    },
    {
      name: 'Vegetarian',
      description: 'Fresh vegetarian dishes',
      items: [
        { name: 'Paneer Tikka Masala', base: 16.00, desc: 'Grilled paneer in rich tikka masala curry', isVeg: true },
        { name: 'Daal Fry', base: 9.00, desc: 'Tempered yellow lentils with cumin and garlic', isVeg: true },
        { name: 'Mix Veg Curry', base: 12.00, desc: 'Seasonal vegetables in aromatic sauce', isVeg: true },
        { name: 'Bhendi Masala', base: 11.00, desc: 'Crispy okra stir-fried with Indian spices', isVeg: true },
        { name: 'Alu Gobi', base: 11.00, desc: 'Potato and cauliflower with dry spices', isVeg: true },
      ],
    },
    {
      name: 'Grill & Tandoor',
      description: 'Clay oven specialties',
      items: [
        { name: 'Chicken Tikka Boti', base: 20.00, desc: 'Marinated chicken chargrilled in tandoor oven' },
        { name: 'Chicken Seekh Kebab', base: 17.00, desc: 'Minced chicken with herbs and spices, grilled on skewers' },
        { name: 'Tandoori Chicken (Half)', base: 17.00, desc: 'Classic tandoor-roasted half chicken with naan' },
        { name: 'Lamb Chops', base: 22.00, desc: 'Marinated lamb chops grilled to perfection (3 pieces)' },
      ],
    },
    {
      name: 'Breakfast (7AM–1:30PM)',
      description: 'Fresh South Indian breakfast',
      items: [
        { name: 'Masala Dosa', base: 8.99, desc: 'Crispy rice crepe filled with spiced potato masala, served with sambar & chutneys', isVeg: true },
        { name: 'Palak Cheese Dosa', base: 12.00, desc: 'Spinach and cheese stuffed crispy dosa', isVeg: true },
        { name: 'Omelette Dosa', base: 11.00, desc: 'Crispy dosa with spiced egg omelette filling' },
        { name: 'Idli Sambar (3 Pieces)', base: 7.00, desc: 'Steamed rice cakes with sambar and coconut chutney', isVeg: true },
        { name: 'Masala Chai', base: 2.00, desc: 'Traditional Indian spiced tea', isVeg: true },
      ],
    },
    {
      name: 'Breads & Rice',
      description: 'Fresh baked breads',
      items: [
        { name: 'Plain Naan', base: 2.50, desc: 'Soft leavened bread from tandoor oven', isVeg: true },
        { name: 'Garlic Naan', base: 3.00, desc: 'Buttered naan with roasted garlic and herbs', isVeg: true },
        { name: 'Paratha', base: 2.50, desc: 'Whole wheat layered flatbread', isVeg: true },
        { name: 'Steamed Basmati Rice', base: 3.00, desc: 'Fragrant long-grain basmati rice', isVeg: true },
      ],
    },
    {
      name: 'Drinks & Desserts',
      description: 'Traditional beverages and sweets',
      items: [
        { name: 'Mango Lassi', base: 5.00, desc: 'Refreshing yogurt-based mango smoothie', isVeg: true },
        { name: 'Masala Chai', base: 2.00, desc: 'Spiced Indian tea', isVeg: true },
        { name: 'Gulab Jamun (3 Pcs)', base: 5.00, desc: 'Soft milk-solid dumplings in rose-cardamom syrup', isVeg: true },
        { name: 'Fruit Cake Salad', base: 6.00, desc: 'Fresh seasonal fruits with cream', isVeg: true },
      ],
    },
    {
      name: 'Paan',
      description: 'Traditional betel leaf preparations — a South Asian after-meal tradition for mouth freshening and refreshment',
      paan_notice: '⚠️ Orders of 50+ Paans for special events require 48-hour advance notice and 25% prepayment.',
      items: [
        { name: 'Regular Sweet Paan (Meetha)', base: 1.50, desc: 'Classic betel leaf with gulkand, coconut, fennel seeds, tutti frutti and sweet fillings. A timeless after-meal refresher.', isTobaccoFree: true },
        { name: 'Saada Paan Khushboo', base: 1.50, desc: 'Fragrant plain paan with aromatic spices, chuna and katha — the traditional Saada preparation with a delightful khushboo (fragrance)', isTobaccoFree: true },
        { name: 'Raam Piyari', base: 1.50, desc: 'Special sweet paan blend named after a famous Paan preparation — with gulkand, rose petals, cardamom, and mixed sweet fillings', isTobaccoFree: true },
        { name: 'Minakshi', base: 1.50, desc: 'A delicately flavored paan with a unique blend of sweet coconut, saffron, and aromatic spices — named after the goddess of beauty', isTobaccoFree: true },
      ],
    },
    {
      name: 'Catering Menu',
      description: '⚠️ Minimum 48-hour advance notice required. Minimum 25% payment at time of order. Half-trays available at (full tray price ÷ 2) + $10.',
      isCatering: true,
      items: [
        { name: 'Mutton Biryani — Full Tray', base: 180.00, desc: 'Serves 20-25 guests. Fragrant dum mutton biryani with raita and salan. Half Tray: $100.', skipMargin: true },
        { name: 'Mutton Biryani — Half Tray', base: 100.00, desc: 'Serves 10-12 guests. Full Tray ÷ 2 + $10.', skipMargin: true },
        { name: 'Chicken Biryani — Full Tray', base: 125.00, desc: 'Serves 20-25 guests. Aromatic Hyderabadi chicken dum biryani. Half Tray: $72.50.', skipMargin: true },
        { name: 'Chicken Biryani — Half Tray', base: 72.50, desc: 'Serves 10-12 guests.', skipMargin: true },
        { name: 'Goat Haleem — Full Tray', base: 160.00, desc: 'Serves 20-25 guests. Slow-cooked Hyderabadi goat haleem. Half Tray: $90.', skipMargin: true },
        { name: 'Goat Haleem — Half Tray', base: 90.00, desc: 'Serves 10-12 guests.', skipMargin: true },
        { name: 'Chicken 65 — Full Tray', base: 180.00, desc: 'Serves 20-25 guests. Crispy deep-fried chicken 65 with curry leaves. Half Tray: $100.', skipMargin: true },
        { name: 'Chicken 65 — Half Tray', base: 100.00, desc: 'Serves 10-12 guests.', skipMargin: true },
        { name: 'Chicken Manchurian — Full Tray', base: 180.00, desc: 'Serves 20-25 guests. Indo-Chinese chicken manchurian. Half Tray: $100.', skipMargin: true },
        { name: 'Chicken Manchurian — Half Tray', base: 100.00, desc: 'Serves 10-12 guests.', skipMargin: true },
        { name: 'Veg Biryani — Full Tray', base: 120.00, desc: 'Serves 20-25 guests. Fresh vegetarian dum biryani. Half Tray: $70.', skipMargin: true },
        { name: 'Veg Biryani — Half Tray', base: 70.00, desc: 'Serves 10-12 guests.', skipMargin: true },
      ],
    },
  ],
};

const TAWAKKUL = {
  slug: 'tawakkul-restaurant',
  name: 'Tawakkul Restaurant',
  domain: 'tawakkulrestaurant.food', 
  address: '6410 N Claremont Ave, Chicago, IL 60659',
  phone: '(773) 743-5555',
  cuisine: 'Halal Pakistani & Indian, Hyderabadi',
  description: 'HMS-certified Halal Pakistani & Indian cuisine. Famous for our Hyderabadi Biryani, Karahi, and authentic street food.',
  tenantId: 'tawakkul-restaurant-chicago-2026',
  heroColor: '#1a472a', // Tawakkul green
  categories: [
    {
      name: 'Biryani',
      items: [
        { name: 'Hyderabadi Goat Dum Biryani', base: 18.00, desc: 'Authentic slow-cooked goat biryani with saffron and dum spices', isSignature: true },
        { name: 'Hyderabadi Chicken Biryani', base: 14.00, desc: 'Tender chicken layered with fragrant basmati and biryani masala', isSignature: true },
        { name: 'Chicken Biryani Family Pack', base: 42.00, desc: 'Chicken biryani with haleem, 2 roti, chicken 65 and dessert — feeds 4', isSignature: true },
      ],
    },
    {
      name: 'Curries',
      items: [
        { name: 'Butter Chicken', base: 14.00, desc: 'Classic creamy tomato butter chicken — Best Seller' },
        { name: 'Chicken Masala', base: 14.00, desc: 'Authentic South Asian spiced chicken curry' },
        { name: 'Mutton Karahi', base: 15.00, desc: 'Tender mutton cooked in wok with tomatoes and spices' },
        { name: 'Mutton Mughlai', base: 15.00, desc: 'Rich mughlai curry with aromatic spices' },
        { name: 'Paneer Masala', base: 14.00, desc: 'Fresh cottage cheese in spiced masala gravy', isVeg: true },
        { name: 'Bhendi Masala', base: 11.00, desc: 'Crispy okra in spiced masala', isVeg: true },
        { name: 'Alu-Gobi Masala', base: 11.00, desc: 'Potato and cauliflower with dry spices', isVeg: true },
        { name: 'Daal Tadka', base: 9.00, desc: 'Tempered yellow lentils with cumin and ghee', isVeg: true },
        { name: 'Mutton Fry (Talewa Gosht)', base: 19.00, desc: 'Pan-fried mutton with traditional spices' },
      ],
    },
    {
      name: 'Desi Chinese',
      description: 'Indo-Chinese fusion — Best Sellers',
      items: [
        { name: 'Chicken 65', base: 14.00, desc: 'Crispy spiced fried chicken — Best Seller' },
        { name: 'Chilly Chicken', base: 14.00, desc: 'Indo-Chinese chilli chicken with bell peppers' },
        { name: 'Chicken Noodles', base: 15.00, desc: 'Stir-fried Indo-Chinese chicken noodles — Best Seller' },
        { name: 'Chicken Fried Rice', base: 15.00, desc: 'Indo-Chinese style chicken fried rice' },
      ],
    },
    {
      name: 'Hyderabadi Specialties',
      items: [
        { name: 'Hyderabadi Haleem', base: 13.00, desc: 'Slow-cooked wheat and meat haleem with garnishes' },
      ],
    },
    {
      name: 'Grilled Specials',
      items: [
        { name: 'Chicken Tikka', base: 14.00, desc: 'Marinated chicken tikka grilled in tandoor' },
        { name: 'Lamb Chops', base: 12.00, desc: 'Tender marinated lamb chops grilled to perfection' },
      ],
    },
    {
      name: 'Appetizers & Sides',
      items: [
        { name: 'Samosa (4 Pieces Veg)', base: 8.00, desc: 'Crispy pastry filled with spiced potatoes and peas', isVeg: true },
        { name: 'Chicken Pakoda', base: 12.00, desc: 'Crispy battered chicken fritters with green chutney' },
        { name: 'Khatti Daal', base: 5.00, desc: 'Tangy tamarind-spiced lentil preparation', isVeg: true },
        { name: 'Paratha', base: 2.50, desc: 'Whole wheat flaky layered flatbread', isVeg: true },
      ],
    },
    {
      name: 'Desserts',
      items: [
        { name: 'Kaddu ka Halwa', base: 7.00, desc: 'Sweet pumpkin halwa with cardamom and nuts', isVeg: true },
        { name: 'Gajar ka Halwa', base: 7.00, desc: 'Carrot halwa with khoya and dry fruits', isVeg: true },
        { name: 'Gulab Jamun (3 Pcs)', base: 7.00, desc: 'Soft milk-solid dumplings in rose syrup', isVeg: true },
        { name: 'Rabdi', base: 7.00, desc: 'Thickened sweetened milk with cardamom and saffron', isVeg: true },
      ],
    },
  ],
};

// ─── Generate seed SQL for a restaurant ──────────────────────────────────────
function generateSeedSQL(restaurant) {
  const lines = [];
  const tenantId = restaurant.tenantId;
  const merchantId = `${restaurant.slug}-merchant-001`;
  const locationId = `${restaurant.slug}-location-001`;
  
  lines.push(`-- ============================================================`);
  lines.push(`-- SEED: ${restaurant.name}`);
  lines.push(`-- Domain: ${restaurant.domain}`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);  
  lines.push(`-- ============================================================`);
  lines.push(`BEGIN;`);
  lines.push(``);
  
  // Tenant
  lines.push(`INSERT INTO tenants (id, name, slug, plan_tier, status, settings, created_at)`);
  lines.push(`VALUES (`);
  lines.push(`  '${tenantId}',`);
  lines.push(`  '${restaurant.name}',`);
  lines.push(`  '${restaurant.slug}',`);
  lines.push(`  'growth',`);
  lines.push(`  'active',`);
  lines.push(`  '{"cuisine":"${restaurant.cuisine}","domain":"${restaurant.domain}","paysurity_margin":0.20,"processing_fee":0.05}'::jsonb,`);
  lines.push(`  NOW()`);
  lines.push(`) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, settings=EXCLUDED.settings;`);
  lines.push(``);
  
  // Users
  lines.push(`INSERT INTO users (id, tenant_id, email, password_hash, name, role, status)`);
  lines.push(`VALUES`);
  lines.push(`  ('${restaurant.slug}-owner-001', '${tenantId}', 'owner@${restaurant.domain}', '$2b$10$placeholder', '${restaurant.name} Owner', 'owner', 'active'),`);
  lines.push(`  ('${restaurant.slug}-manager-001', '${tenantId}', 'manager@${restaurant.domain}', '$2b$10$placeholder', 'Manager', 'manager', 'active'),`);
  lines.push(`  ('${restaurant.slug}-staff-001', '${tenantId}', 'staff@${restaurant.domain}', '$2b$10$placeholder', 'Staff', 'staff', 'active')`);
  lines.push(`ON CONFLICT (id) DO NOTHING;`);
  lines.push(``);
  
  // Merchant
  lines.push(`INSERT INTO merchants (id, tenant_id, business_name, slug, vertical, status, address, phone, settings)`);
  lines.push(`VALUES (`);
  lines.push(`  '${merchantId}',`);
  lines.push(`  '${tenantId}',`);
  lines.push(`  '${restaurant.name}',`);
  lines.push(`  '${restaurant.slug}',`);
  lines.push(`  'restaurant',`);
  lines.push(`  'active',`);
  lines.push(`  '${restaurant.address}',`);
  lines.push(`  '${restaurant.phone}',`);
  lines.push(`  '{"microsite_domain":"${restaurant.domain}","hero_color":"${restaurant.heroColor}","description":"${restaurant.description.replace(/'/g,"''")}"}'::jsonb`);
  lines.push(`) ON CONFLICT (id) DO UPDATE SET business_name=EXCLUDED.business_name, settings=EXCLUDED.settings;`);
  lines.push(``);
  
  // Location
  lines.push(`INSERT INTO merchant_locations (id, merchant_id, tenant_id, name, address, is_primary)`);
  lines.push(`VALUES ('${locationId}', '${merchantId}', '${tenantId}', 'Main Location', '${restaurant.address}', true)`);
  lines.push(`ON CONFLICT (id) DO NOTHING;`);
  lines.push(``);
  
  // Menu categories + items
  let catIdx = 0;
  let itemIdx = 0;
  for (const cat of restaurant.categories) {
    catIdx++;
    const catId = `${restaurant.slug}-cat-${String(catIdx).padStart(3,'0')}`;
    const pricingNote = cat.isCatering ? 
      'Catering: 48h notice + 25% prepayment required' : '';
    
    lines.push(`INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)`);
    lines.push(`VALUES (`);
    lines.push(`  '${catId}',`);
    lines.push(`  '${merchantId}',`);
    lines.push(`  '${tenantId}',`);
    lines.push(`  '${cat.name.replace(/'/g,"''")}',`);
    lines.push(`  '${(cat.description||'').replace(/'/g,"''")}${pricingNote}',`);
    lines.push(`  ${catIdx},`);
    lines.push(`  ${cat.isCatering ? 'true' : 'false'}`);
    lines.push(`) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;`);
    lines.push(``);
    
    for (const item of cat.items) {
      itemIdx++;
      const itemId = `${restaurant.slug}-item-${String(itemIdx).padStart(3,'0')}`;
      const displayPrice = item.skipMargin ? item.base : calcDisplayPrice(item.base);
      
      lines.push(`INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)`);
      lines.push(`VALUES (`);
      lines.push(`  '${itemId}',`);
      lines.push(`  '${catId}',`);
      lines.push(`  '${merchantId}',`);
      lines.push(`  '${tenantId}',`);
      lines.push(`  '${item.name.replace(/'/g,"''")}',`);
      lines.push(`  '${item.desc.replace(/'/g,"''")}',`);
      lines.push(`  ${Math.round(item.base * 100)},`);
      lines.push(`  ${Math.round(displayPrice * 100)},`);
      lines.push(`  true,`);
      lines.push(`  ${item.isVeg ? 'true' : 'false'},`);
      lines.push(`  ${item.isSignature ? 'true' : 'false'},`);
      lines.push(`  '{"is_tobacco_free":${item.isTobaccoFree !== false},"is_catering":${cat.isCatering || false}}'::jsonb`);
      lines.push(`) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;`);
      lines.push(``);
    }
  }
  
  lines.push(`COMMIT;`);
  lines.push(``);
  lines.push(`-- Price calculation reference for ${restaurant.name}:`);
  lines.push(`-- Display Price = Base Price × 1.05 (processing) × 1.20 (PaySurity margin) = Base × 1.26`);
  lines.push(`-- Margin is configurable via admin dashboard per tenant`);
  
  return lines.join('\n');
}

// ─── Generate price table (for reference) ─────────────────────────────────────
function priceTable(restaurant) {
  const rows = [];
  for (const cat of restaurant.categories) {
    for (const item of cat.items) {
      if (!item.skipMargin) {
        const display = calcDisplayPrice(item.base);
        rows.push(`${cat.name} | ${item.name} | $${item.base.toFixed(2)} | $${display.toFixed(2)}`);
      }
    }
  }
  return rows.join('\n');
}

// ─── Main parallel work ────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== Swarm: Multi-Tenant Microsite Builder ===\n');
  
  const restaurants = [HOUSE_OF_BIRYANI, TAWAKKUL];
  
  // 1. Write seed SQL files
  console.log('Writing seed SQL files...');
  for (const r of restaurants) {
    const sql = generateSeedSQL(r);
    const filePath = path.join(ROOT, 'packages/database/seeds', `030_${r.slug}_seed.sql`);
    fs.writeFileSync(filePath, sql, 'utf8');
    console.log(`✅ Seed SQL: ${path.basename(filePath)} (${sql.length} bytes)`);
    console.log(`\nPrice tables for ${r.name}:\n${priceTable(r).slice(0,300)}...\n`);
  }

  // 2. Generate microsites in parallel using Gemini
  console.log('\nGenerating microsites with Gemini (parallel)...');
  
  const micrositeTasks = restaurants.map(r => generateMicrosite(r));
  const dnsInfo = generateDNSInstructions();
  const canonicalReqs = generateCanonicalRequirements();
  const tenantAdminPanel = generateTenantAdminPanel();
  
  const [ms1, ms2, dns, canonical, adminPanel] = await Promise.all([
    ...micrositeTasks, dnsInfo, canonicalReqs, tenantAdminPanel
  ]);
  
  // Write microsite files
  for (const [r, ms] of [[HOUSE_OF_BIRYANI, ms1], [TAWAKKUL, ms2]]) {
    const dir = path.join(ROOT, 'apps', 'public-website', 'src', 'app', `restaurant`, r.slug);
    fs.mkdirSync(dir, { recursive: true });
    if (ms.home) { fs.writeFileSync(path.join(dir, 'page.tsx'), ms.home, 'utf8'); }
    if (ms.menu) { fs.mkdirSync(path.join(dir,'menu'), {recursive:true}); fs.writeFileSync(path.join(dir,'menu','page.tsx'), ms.menu, 'utf8'); }
    if (ms.catering) { fs.mkdirSync(path.join(dir,'catering'), {recursive:true}); fs.writeFileSync(path.join(dir,'catering','page.tsx'), ms.catering, 'utf8'); }
    if (ms.order) { fs.mkdirSync(path.join(dir,'order'), {recursive:true}); fs.writeFileSync(path.join(dir,'order','page.tsx'), ms.order, 'utf8'); }
    console.log(`✅ Microsite written: ${r.name} (${Object.keys(ms).length} pages)`);
  }
  
  // Write DNS instructions
  const dnsPath = path.join(ROOT, 'docs', 'DNS_SETUP.md');
  fs.mkdirSync(path.join(ROOT,'docs'), {recursive:true});
  fs.writeFileSync(dnsPath, await dns, 'utf8');
  console.log('✅ DNS setup guide written: docs/DNS_SETUP.md');
  
  // Write canonical requirements
  const reqPath = path.join(ROOT, 'Requirements', 'Canonical', 'MST_TENANT_MICROSITE.md');
  fs.writeFileSync(reqPath, await canonical, 'utf8');
  console.log('✅ Canonical requirements written: MST_TENANT_MICROSITE.md');

  // Write tenant admin panel
  const adminDir = path.join(ROOT, 'apps', 'merchant-dashboard', 'src', 'app', 'dashboard', 'microsite-admin');
  fs.mkdirSync(adminDir, {recursive:true});
  fs.writeFileSync(path.join(adminDir, 'page.tsx'), await adminPanel, 'utf8');
  console.log('✅ Tenant Admin Panel written');

  // Commit + push
  try {
    execSync('git add -A', { cwd: ROOT });
    execSync('git commit -m "feat(tenants): House of Biryani + Tawakkul microsites; seed SQL with price engine; DNS guide; tenant admin panel; canonical requirements [swarm]"', { cwd: ROOT });
    execSync('git push origin HEAD:main --force-with-lease', { cwd: ROOT });
    console.log('✅ Pushed to GitHub');
  } catch (e) { console.warn('Push:', e.message?.slice(0,100)); }
  
  console.log('\n\n🎉 House of Biryani work completed.');
  console.log('🎉 Tawakkul Restaurant work completed.');
  console.log('\nNext: cloudbuild-parallel-swarm.yaml will build + deploy.\n');
}

async function generateMicrosite(restaurant) {
  const priceCalcNote = `Prices shown include 5% payment processing + 20% PaySurity platform margin. Base price is what the restaurant receives.`;
  
  const prompts = {
    home: `Create a stunning Next.js 14 'use client' restaurant microsite HOME PAGE for "${restaurant.name}".

Restaurant data:
- Name: ${restaurant.name}
- Cuisine: ${restaurant.cuisine}
- Address: ${restaurant.address}
- Phone: ${restaurant.phone}
- Description: ${restaurant.description}
- Domain: ${restaurant.domain}
- Hero color: ${restaurant.heroColor}
- Categories: ${restaurant.categories.map(c=>c.name).join(', ')}

Price note: ${priceCalcNote}

Design requirements (A-GRADE — MUST WOW):
- Full-width hero with gradient overlay and restaurant name in large type
- Sticky navigation: Home | Menu | Catering | Order Online | Contact
- Featured categories section with food emoji icons and hover effects
- About section with authentic story
- Hours & Location section with map embed placeholder
- Footer with social links, powered by PaySurity
- Color scheme based on hero color ${restaurant.heroColor}
- Google Font: Plus Jakarta Sans
- Mobile-first responsive
- Smooth animations (CSS transitions)
- ALL navigation links functional (use Next.js Link)

API: fetch menu from /api/menu-items?merchantId=${restaurant.slug}
API Base: process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-111328865246-uc.a.run.app'

CRITICAL INSTRUCTION: Output ONLY raw TSX. Do not include markdown code block syntax (like \\\`\\\`\\\`tsx and \\\`\\\`\\\`). Do not include conversational filler like "Here is your component". Just the typescript code.`,
    
    menu: `Create a Next.js 14 MENU PAGE for "${restaurant.name}" restaurant microsite.

Menu data: ${JSON.stringify(restaurant.categories.map(c => ({
  name: c.name,
  items: c.items.map(i => ({
    name: i.name,
    displayPrice: calcDisplayPrice(i.base),
    desc: i.desc,
    isVeg: i.isVeg,
    isSignature: i.isSignature,
  }))
})), null, 2).slice(0, 6000)}

Price note: ${priceCalcNote}

Design:
- Category tabs/pills across the top (clickable filter)
- Item cards in 2-3 column grid with: name, price, description, veg/non-veg badge, signature badge
- Paan category with special cultural note and 50+ order notice
- Catering section with 48h notice warning banner
- "Add to Cart" button on each item
- Cart sidebar with checkout button linking to /restaurant/${restaurant.slug}/order
- Premium food photography placeholders (gradient backgrounds with food emoji)
- Matches home page color scheme

CRITICAL INSTRUCTION: Output ONLY raw TSX. Do not include markdown code block syntax (like \\\`\\\`\\\`tsx and \\\`\\\`\\\`). Do not include conversational filler like "Here is your component". Just the typescript code.`,
    
    catering: `Create a CATERING PAGE for "${restaurant.name}".

Catering items: ${JSON.stringify(
  restaurant.categories.find(c=>c.isCatering)?.items?.map(i=>({name:i.name, price:i.base, desc:i.desc})) || []
).slice(0,2000)}

Rules:
- 48-hour advance notice required
- Minimum 25% payment at time of order
- Half trays at (full price ÷ 2) + $10

Design:
- Hero banner "Catering & Events"
- Notice banner with the rules prominently displayed
- Full/Half tray pricing table
- Event inquiry form: name, email, phone, event date, guest count, dishes, notes
- Form submits to /api/catering-inquiries POST
- Trust badges: HMS Certified Halal, Authentic Hyderabadi, etc.

CRITICAL INSTRUCTION: Output ONLY raw TSX. Do not include markdown code block syntax (like \\\`\\\`\\\`tsx and \\\`\\\`\\\`). Do not include conversational filler like "Here is your component". Just the typescript code.`,

    order: `Create an ORDER PAGE for "${restaurant.name}" — a simple, fast online order form.

- Shows cart items passed via localStorage/URL state
- Customer info: name, phone, email
- Order type: Pickup / Delivery
- Delivery address (if delivery selected)
- Special instructions textarea
- Payment: "Pay Online" button (placeholder - will integrate with FluidPay)
- Order total with line items
- Submits to /api/orders POST
- On success: shows order confirmation with order number

Design: clean checkout flow, trust indicators, restaurant branding.
CRITICAL INSTRUCTION: Output ONLY raw TSX. Do not include markdown code block syntax (like \\\`\\\`\\\`tsx and \\\`\\\`\\\`). Do not include conversational filler like "Here is your component". Just the typescript code.`
  };
  
  const results = await Promise.all(
    Object.entries(prompts).map(([key, prompt]) =>
      gemini.generateContent(prompt)
        .then(r => [key, r.response.text().trim()
          .replace(/^```tsx?\n?/,'').replace(/^```\n?/,'').replace(/```$/,'').trim()])
        .catch(e => [key, `// Error: ${e.message}`])
    )
  );
  
  return Object.fromEntries(results);
}

async function generateDNSInstructions() {
  const content = `# GoDaddy DNS Setup — PaySurity Tenant Microsites

## Architecture Decision
**No separate GCP project per tenant.** The PaySurity platform is multi-tenant by design.
Each tenant gets a subdomain/path on the same Cloud Run API and Next.js public website.

## How Tenant Microsites Work
\`\`\`
houseofbiryanirestaurant.food  →  CNAME →  paysurity-public-website.vercel.app
                                OR
houseofbiryanirestaurant.food  →  A record → Cloud Run IP (via load balancer)
\`\`\`

The public website Next.js app reads the \`Host\` header and serves the correct tenant.

## GoDaddy Settings for houseofbiryanirestaurant.food

### Option A: Simple Forward (Staging/Testing — fastest)
1. Log into GoDaddy → Manage DNS for **houseofbiryanirestaurant.food**
2. Delete any existing A and CNAME records on @
3. Add: **Forwarding** → forward to: \`https://paysurity-[hash]-uc.a.run.app/restaurant/house-of-biryani\`
4. Type: Permanent (301), Forward only
5. ✅ Takes effect in 1-24 hours

### Option B: Full CNAME (Production — recommended)
1. Log into GoDaddy → DNS Management for **houseofbiryanirestaurant.food**
2. Add CNAME record:
   - Host: \`@\` (or \`www\`)
   - Points to: \`paysurity-api-111328865246-uc.a.run.app\`
   - TTL: 1 hour
3. Add TXT record for domain verification:
   - Host: \`@\`
   - Value: \`paysurity-tenant=house-of-biryani-chicago-2026\`
4. Configure Cloud Run custom domain mapping (see below)

### Cloud Run Custom Domain Mapping
\`\`\`bash
gcloud beta run domain-mappings create \\
  --service=paysurity-api \\
  --domain=houseofbiryanirestaurant.food \\
  --region=us-central1 \\
  --project=paysurity-platform-2026
\`\`\`

### Option C: SEO-Friendly (Recommended for growth)
Forward: **houseofbiryanirestaurant.food** → **paysurity.com/restaurants/house-of-biryani**

This gives PaySurity SEO benefits while tenants get branded URLs.

## Repeat for Tawakkul Restaurant
Same steps but for domain: **tawakkulrestaurant.food**
Tenant ID: tawakkul-restaurant-chicago-2026

## Staging Test (Before DNS propagation)
Test the microsite immediately via:
\`https://paysurity-api-[hash]-uc.a.run.app/restaurant/house-of-biryani\`

Check the Cloud Run URL with:
\`\`\`bash
gcloud run services describe paysurity-api --region=us-central1 --format="value(status.url)"
\`\`\`

## SSL
Cloud Run provides automatic SSL via Google-managed certificates when custom domains are mapped.
No separate certificate configuration needed.
`;
  return content;
}

async function generateCanonicalRequirements() {
  const result = await gemini.generateContent(`Write a comprehensive canonical requirements document for PaySurity's tenant microsite system.
Format as a markdown file with YAML frontmatter.

Requirements to cover:
MST-001: Tenant microsite auto-provisioning on tenant signup
MST-002: Custom domain mapping (CNAME) per tenant
MST-003: Menu management CRUD (categories, items, prices, images)
MST-004: Price calculation engine: displayPrice = base × (1 + processingFee) × (1 + marginPct)
MST-005: PaySurity margin configurable by super admin (default 20%)
MST-006: Processing fee configurable (default 5%)
MST-007: POS ↔ Microsite bidirectional sync (menu changes reflect on both)
MST-008: Catering orders with advance notice enforcement (minimum 48h)
MST-009: Special event orders (Paan 50+) with advance notice and prepayment
MST-010: Tenant Admin Panel for CRUD operations
MST-011: Super admin override of per-tenant settings
MST-012: SEO: per-tenant meta tags, structured data (Restaurant schema.org)
MST-013: Mobile-optimized responsive design (Core Web Vitals)
MST-014: Order flow: menu → cart → checkout → confirmation
MST-015: Real-time order sync with POS when activated

Use the standard CANONICAL.md format from existing requirements files.
CRITICAL INSTRUCTION: Output ONLY raw markdown content. Do not output markdown code block wrappers like \\\`\\\`\\\`markdown and \\\`\\\`\\\`. Just output the content directly.`);
  return result.response.text().trim().replace(/^```markdown?\n?/,'').replace(/```$/,'').trim();
}

async function generateTenantAdminPanel() {
  const result = await gemini.generateContent(`Create a Next.js 14 Tenant Admin Panel page for the PaySurity merchant dashboard.
Route: /dashboard/microsite-admin

Features (all with real API calls):
1. Microsite Settings tab:
   - Restaurant name, description, address, phone
   - Hero image upload button (placeholder)
   - Hero color picker
   - Domain status indicator
   - Save settings → PUT /api/microsite/settings

2. Menu Management tab:
   - Category list with expand/collapse
   - Per category: add/edit/delete items
   - Item form: name, description, BASE price (user enters what they want to receive)
   - System auto-calculates display price: base × 1.05 × 1.20 = base × 1.26
   - Shows: "You receive: $X.XX | Customer pays: $Y.YY"
   - PUT /api/microsite/menu-items/:id
   - POST /api/microsite/menu-items

3. Pricing Config tab (for super admins only):
   - PaySurity margin slider (0-50%, default 20%)
   - Processing fee (read-only 5%)
   - Real-time price preview
   - PUT /api/admin/tenant-pricing/:tenantId

4. POS Sync status:
   - Last sync timestamp
   - "Sync Now" button → POST /api/microsite/sync-pos
   - Toggle: "Auto-sync on POS change"

Design: dark glassmorphism, tabs navigation, premium data table for menu items.
Must be A-grade design — this is seen by restaurant owners daily.

CRITICAL INSTRUCTION: Output ONLY raw TSX. Do not include markdown code block syntax (like \\\`\\\`\\\`tsx and \\\`\\\`\\\`). Do not include conversational filler like "Here is your component". Just the typescript code.`);
  return result.response.text().trim().replace(/^```tsx?\n?/,'').replace(/^```\n?/,'').replace(/```$/,'').trim();
}

main().catch(e => { console.error(e); process.exit(1); });
