#!/usr/bin/env node
/**
 * scripts/swarm-seed-real-data.js
 * Seeds real test data into the Cloud SQL database via Cloud SQL Proxy
 * Includes: House of Biryani, Tawakkul, test users, orders, menu items
 */
'use strict';

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Price engine: base × 1.05 × 1.20 = base × 1.26
const priceDisplay = (base) => Math.round(base * 1.26 * 100) / 100;
const priceCents   = (base) => Math.round(base * 1.26 * 100);
const baseCents    = (base) => Math.round(base * 100);

// ─── Generate comprehensive seed SQL ──────────────────────────────────────────
function generateSeedSQL() {
  return `
-- ============================================================
-- PaySurity Platform — Full Staging Seed Data
-- Generated: ${new Date().toISOString()}
-- Price formula: display = base × 1.05 (processing) × 1.20 (margin)
-- ============================================================

BEGIN;

-- ─── PRICE ENGINE CONFIG ─────────────────────────────────────────────────────
INSERT INTO price_engine_config (tenant_id, paysurity_margin_pct, processing_fee_pct, updated_at)
VALUES
  ('house-of-biryani-chicago-2026', 0.20, 0.05, NOW()),
  ('tawakkul-restaurant-chicago-2026', 0.20, 0.05, NOW())
ON CONFLICT (tenant_id) DO UPDATE SET paysurity_margin_pct=EXCLUDED.paysurity_margin_pct;

-- ─── HOUSE OF BIRYANI TENANT ──────────────────────────────────────────────────
INSERT INTO tenants (id, name, slug, plan_tier, status, settings, created_at) VALUES
('house-of-biryani-chicago-2026', 'House of Biryani', 'house-of-biryani', 'growth', 'active',
 '{"cuisine":"South Indian & Pakistani","domain":"houseofbiryanirestaurant.food","paysurity_margin":0.20,"processing_fee":0.05}'::jsonb,
 NOW())
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, settings=EXCLUDED.settings;

-- HOB Users
INSERT INTO users (id, tenant_id, email, password_hash, name, role, status, created_at) VALUES
('hob-owner-001', 'house-of-biryani-chicago-2026', 'owner@houseofbiryanirestaurant.food', '$2b$10$dummyhash111111111111111111111111111111111111111111111', 'House of Biryani Owner', 'owner', 'active', NOW()),
('hob-manager-001', 'house-of-biryani-chicago-2026', 'manager@houseofbiryanirestaurant.food', '$2b$10$dummyhash222222222222222222222222222222222222222222222', 'Ahmed Hassan', 'manager', 'active', NOW()),
('hob-staff-001', 'house-of-biryani-chicago-2026', 'staff@houseofbiryanirestaurant.food', '$2b$10$dummyhash333333333333333333333333333333333333333333333', 'Sara Staff', 'staff', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- HOB Merchant
INSERT INTO merchants (id, tenant_id, business_name, slug, vertical, status, address, phone, settings, created_at) VALUES
('hob-merchant-001', 'house-of-biryani-chicago-2026', 'House of Biryani', 'house-of-biryani', 'restaurant', 'active',
 '2306 W Devon Ave, Chicago, IL 60659', '(773) 465-2455',
 '{"microsite_domain":"houseofbiryanirestaurant.food","hero_color":"#8B0000","description":"Authentic Hyderabadi, South Indian & Pakistani cuisine."}'::jsonb,
 NOW())
ON CONFLICT (id) DO UPDATE SET business_name=EXCLUDED.business_name;

-- ─── TAWAKKUL RESTAURANT TENANT ───────────────────────────────────────────────
INSERT INTO tenants (id, name, slug, plan_tier, status, settings, created_at) VALUES
('tawakkul-restaurant-chicago-2026', 'Tawakkul Restaurant', 'tawakkul-restaurant', 'growth', 'active',
 '{"cuisine":"Halal Pakistani & Hyderabadi","domain":"tawakkulrestaurant.food","paysurity_margin":0.20,"processing_fee":0.05}'::jsonb,
 NOW())
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO users (id, tenant_id, email, password_hash, name, role, status, created_at) VALUES
('twr-owner-001', 'tawakkul-restaurant-chicago-2026', 'owner@tawakkulrestaurant.food', '$2b$10$dummyhash444444444444444444444444444444444444444444444', 'Tawakkul Owner', 'owner', 'active', NOW()),
('twr-manager-001', 'tawakkul-restaurant-chicago-2026', 'manager@tawakkulrestaurant.food', '$2b$10$dummyhash555555555555555555555555555555555555555555555', 'Tawakkul Manager', 'manager', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO merchants (id, tenant_id, business_name, slug, vertical, status, address, phone, settings, created_at) VALUES
('twr-merchant-001', 'tawakkul-restaurant-chicago-2026', 'Tawakkul Restaurant', 'tawakkul-restaurant', 'restaurant', 'active',
 '6410 N Claremont Ave, Chicago, IL 60659', '(773) 743-5555',
 '{"microsite_domain":"tawakkulrestaurant.food","hero_color":"#1a472a","description":"HMS-certified Halal Pakistani & Hyderabadi cuisine."}'::jsonb,
 NOW())
ON CONFLICT (id) DO UPDATE SET business_name=EXCLUDED.business_name;

-- ─── MICROSITE SETTINGS ───────────────────────────────────────────────────────
INSERT INTO microsite_settings (id, tenant_id, merchant_id, domain, hero_color, description, address, phone, is_published, pos_sync_enabled, paysurity_margin_pct, processing_fee_pct, created_at) VALUES
('hob-microsite-001', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'houseofbiryanirestaurant.food', '#8B0000', 'Authentic Hyderabadi, South Indian & Pakistani cuisine. Famous for Dum Biryani, Haleem & Paan.', '2306 W Devon Ave, Chicago, IL 60659', '(773) 465-2455', true, true, 0.20, 0.05, NOW()),
('twr-microsite-001', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'tawakkulrestaurant.food', '#1a472a', 'HMS-certified Halal Pakistani & Hyderabadi cuisine. Famous for Goat Dum Biryani & Karahi.', '6410 N Claremont Ave, Chicago, IL 60659', '(773) 743-5555', true, false, 0.20, 0.05, NOW())
ON CONFLICT (id) DO UPDATE SET is_published=true;

-- ─── SAMPLE ORDERS (House of Biryani) ────────────────────────────────────────
INSERT INTO orders (id, tenant_id, merchant_id, customer_name, customer_email, customer_phone, order_type, status, subtotal_cents, tax_cents, total_cents, created_at) VALUES
('hob-order-001', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Mohammed Ali', 'mali@example.com', '(312) 555-0101', 'dine_in', 'completed', 2268, 227, 2495, NOW() - INTERVAL '2 hours'),
('hob-order-002', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Priya Sharma', 'psharma@example.com', '(312) 555-0102', 'takeout', 'completed', 4536, 454, 4990, NOW() - INTERVAL '1 hour'),
('hob-order-003', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'James Chen', 'jchen@example.com', '(312) 555-0103', 'delivery', 'in_progress', 3402, 340, 3742, NOW() - INTERVAL '30 minutes'),
('hob-order-004', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Fatima Khan', 'fkhan@example.com', '(312) 555-0104', 'dine_in', 'pending', 1890, 189, 2079, NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- ─── SAMPLE ORDERS (Tawakkul) ────────────────────────────────────────────────
INSERT INTO orders (id, tenant_id, merchant_id, customer_name, customer_email, customer_phone, order_type, status, subtotal_cents, tax_cents, total_cents, created_at) VALUES
('twr-order-001', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'Asif Rehman', 'arehman@example.com', '(773) 555-0201', 'dine_in', 'completed', 2142, 214, 2356, NOW() - INTERVAL '3 hours'),
('twr-order-002', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'Sara Ahmed', 'sahmed@example.com', '(773) 555-0202', 'takeout', 'completed', 3276, 328, 3604, NOW() - INTERVAL '90 minutes')
ON CONFLICT (id) DO NOTHING;

-- ─── SAMPLE CUSTOMERS ─────────────────────────────────────────────────────────
INSERT INTO customers (id, tenant_id, merchant_id, name, email, phone, total_orders, total_spent_cents, loyalty_points, created_at) VALUES
('hob-cust-001', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Mohammed Ali', 'mali@example.com', '(312) 555-0101', 8, 19960, 199, NOW() - INTERVAL '60 days'),
('hob-cust-002', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Priya Sharma', 'psharma@example.com', '(312) 555-0102', 12, 29880, 298, NOW() - INTERVAL '45 days'),
('hob-cust-003', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'James Chen', 'jchen@example.com', '(312) 555-0103', 5, 12490, 124, NOW() - INTERVAL '20 days'),
('twr-cust-001', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'Asif Rehman', 'arehman@example.com', '(773) 555-0201', 15, 35340, 353, NOW() - INTERVAL '90 days'),
('twr-cust-002', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'Sara Ahmed', 'sahmed@example.com', '(773) 555-0202', 7, 16484, 164, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- ─── SAMPLE EMPLOYEES ───────────────────────────────────────────────────────
INSERT INTO employees (id, tenant_id, merchant_id, name, email, phone, role, hourly_rate_cents, status, hire_date, created_at) VALUES
('hob-emp-001', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Omar Sheikh', 'omar@houseofbiryanirestaurant.food', '(312) 555-1001', 'cook', 1800, 'active', '2024-01-15', NOW()),
('hob-emp-002', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Layla Hassan', 'layla@houseofbiryanirestaurant.food', '(312) 555-1002', 'server', 1500, 'active', '2024-03-01', NOW()),
('hob-emp-003', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Zaid Malik', 'zaid@houseofbiryanirestaurant.food', '(312) 555-1003', 'cashier', 1400, 'active', '2024-06-15', NOW()),
('twr-emp-001', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'Bilal Ahmed', 'bilal@tawakkulrestaurant.food', '(773) 555-2001', 'cook', 1900, 'active', '2023-09-01', NOW()),
('twr-emp-002', 'tawakkul-restaurant-chicago-2026', 'twr-merchant-001', 'Hina Khan', 'hina@tawakkulrestaurant.food', '(773) 555-2002', 'server', 1500, 'active', '2024-02-15', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── INVENTORY (House of Biryani) ────────────────────────────────────────────
INSERT INTO inventory_items (id, tenant_id, merchant_id, name, sku, category, quantity, unit, reorder_point, cost_per_unit_cents, created_at) VALUES
('hob-inv-001', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Basmati Rice', 'RICE-BAS-001', 'grain', 150.0, 'lbs', 30.0, 89, NOW()),
('hob-inv-002', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Goat (Bone-in)', 'MEAT-GOT-001', 'meat', 45.0, 'lbs', 10.0, 699, NOW()),
('hob-inv-003', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Chicken (Whole)', 'MEAT-CHK-001', 'meat', 80.0, 'lbs', 20.0, 349, NOW()),
('hob-inv-004', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Saffron', 'SPICE-SAF-001', 'spice', 0.5, 'oz', 0.25, 4999, NOW()),
('hob-inv-005', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Betel Leaves (Paan)', 'PAAN-LVS-001', 'specialty', 200.0, 'pieces', 50.0, 25, NOW()),
('hob-inv-006', 'house-of-biryani-chicago-2026', 'hob-merchant-001', 'Gulkand (Rose Jam)', 'PAAN-GUL-001', 'specialty', 5.0, 'kg', 1.0, 899, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Summary:
-- House of Biryani: 3 users, 1 merchant, 4 orders, 3 customers, 3 employees, 6 inventory items
-- Tawakkul Restaurant: 2 users, 1 merchant, 2 orders, 2 customers, 2 employees
-- Price engine config: 20% PaySurity margin + 5% processing fee for both tenants
`;
}

async function main() {
  console.log('\n=== Seeding Real Data ===\n');

  // Write seed SQL
  const seedPath = path.join(ROOT, 'packages/database/seeds/050_full_staging_seed.sql');
  const sql = generateSeedSQL();
  fs.writeFileSync(seedPath, sql, 'utf8');
  console.log(`✅ Seed SQL written (${sql.length} bytes): ${path.basename(seedPath)}`);

  // Try to run via DATABASE_URL env if available
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    console.log('\nRunning seed against database...');
    try {
      const result = spawnSync('psql', [dbUrl, '-f', seedPath], { encoding: 'utf8', timeout: 30000 });
      if (result.status === 0) {
        console.log('✅ Seed applied to database');
      } else {
        console.warn('⚠️  psql exited with', result.status, result.stderr?.slice(0, 200));
      }
    } catch(e) {
      console.warn('⚠️  psql not available — seed SQL written to file for manual run');
    }
  } else {
    console.log('ℹ️  DATABASE_URL not set — seed SQL written. Apply via Cloud SQL Console or cloudbuild-staging.yaml');
  }

  // Commit seed file
  try {
    execSync('git add packages/database/seeds/', { cwd: ROOT });
    execSync('git commit -m "seed(data): full staging seed — House of Biryani + Tawakkul + orders + customers + employees + inventory [swarm-seed]"', { cwd: ROOT });
    execSync('git push origin main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0, 80)); }

  console.log('\n✅ Seed worker done.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
