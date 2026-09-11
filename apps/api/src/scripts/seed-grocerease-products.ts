/**
 * ═══════════════════════════════════════════════════════════
 * GrocerEase POS Item Seeder (v10)
 * ═══════════════════════════════════════════════════════════
 */

import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL ?? 'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev';
const sql = postgres(DB_URL, { max: 1 });

const GROCEREASE_TENANT_ID = '77777777-7777-4777-7777-777777777777';

const PRODUCTS = [
  { name: 'Organic Honeycrisp Apples', category: 'Produce', price: 5.99, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80', desc: 'Crisp and sweet organic apples.', sku: 'GR-PRD-001' },
  { name: 'Whole Milk (1 Gallon)', category: 'Dairy & Eggs', price: 4.49, image: 'https://images.unsplash.com/photo-1550583724-1237c161ac39?auto=format&fit=crop&w=400&q=80', desc: 'Fresh farm-sourced whole milk.', sku: 'GR-DRY-002' },
  { name: 'Artisan Sourdough Bread', category: 'Bakery', price: 6.50, image: 'https://images.unsplash.com/photo-1585478259715-876a6a81b7e2?auto=format&fit=crop&w=400&q=80', desc: 'Hand-baked sourdough with a perfect crust.', sku: 'GR-BKY-003' },
  { name: 'Free-Range Brown Eggs (Dozen)', category: 'Dairy & Eggs', price: 5.25, image: 'https://images.unsplash.com/photo-1582722872445-41ea511c556b?auto=format&fit=crop&w=400&q=80', desc: 'Grade A organic free-range eggs.', sku: 'GR-DRY-004' },
  { name: 'Atlantic Salmon Fillet', category: 'Meat & Seafood', price: 14.99, image: 'https://images.unsplash.com/photo-1594002494132-bb0fc5598106?auto=format&fit=crop&w=400&q=80', desc: 'Fresh sustainably caught salmon.', sku: 'GR-MET-005' },
  { name: 'Hass Avocados (3pk)', category: 'Produce', price: 4.99, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80', desc: 'Perfectly ripe Hass avocados.', sku: 'GR-PRD-006' },
  { name: 'Greek Yogurt (32oz)', category: 'Dairy & Eggs', price: 5.99, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', desc: 'Creamy, high-protein plain Greek yogurt.', sku: 'GR-DRY-007' },
  { name: 'Sparkling Water (12pk)', category: 'Beverages', price: 6.99, image: 'https://images.unsplash.com/photo-1551731164-6a308ef0841a?auto=format&fit=crop&w=400&q=80', desc: 'Refreshing lime sparkling water.', sku: 'GR-BEV-008' },
  { name: 'Premium Ground Coffee (12oz)', category: 'Pantry', price: 11.50, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80', desc: 'Medium roast fair-trade Arabica coffee.', sku: 'GR-PAN-009' },
  { name: 'Organic Bananas (Bundle)', category: 'Produce', price: 2.19, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=400&q=80', desc: 'Fresh organic Fair Trade bananas.', sku: 'GR-PRD-010' },
  { name: 'Sharp Cheddar Cheese', category: 'Dairy & Eggs', price: 7.25, image: 'https://images.unsplash.com/photo-1486297678162-ad2a19b05840?auto=format&fit=crop&w=400&q=80', desc: 'Aged 12 months for extra sharpness.', sku: 'GR-DRY-011' },
  { name: 'Pitted Kalamata Olives', category: 'Pantry', price: 5.49, image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=400&q=80', desc: 'Authentic Mediterranean olives in brine.', sku: 'GR-PAN-012' },
  { name: 'Sea Salt Crackers', category: 'Pantry', price: 3.99, image: 'https://images.unsplash.com/photo-1599490659223-e153c07dc4c4?auto=format&fit=crop&w=400&q=80', desc: 'Thin and crispy artisan crackers.', sku: 'GR-PAN-013' },
  { name: 'Draft Root Beer (4pk)', category: 'Beverages', price: 8.50, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80', desc: 'Cane sugar root beer in glass bottles.', sku: 'GR-BEV-014' },
  { name: 'Frozen Blueberries (24oz)', category: 'Frozen', price: 9.99, image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=400&q=80', desc: 'Wild-caught frozen blueberries.', sku: 'GR-FRZ-015' },
  { name: 'Baby Spinach (5oz)', category: 'Produce', price: 3.49, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80', desc: 'Pre-washed organic baby spinach.', sku: 'GR-PRD-016' },
  { name: 'Granola - Almond & Honey', category: 'Pantry', price: 6.25, image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=400&q=80', desc: 'Crunchy oat granola with sliced almonds.', sku: 'GR-PAN-017' },
  { name: 'Olive Oil - Extra Virgin', category: 'Pantry', price: 18.99, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?auto=format&fit=crop&w=400&q=80', desc: 'First cold-pressed Italian olive oil.', sku: 'GR-PAN-018' },
  { name: 'Red Bell Peppers (2pk)', category: 'Produce', price: 3.99, image: 'https://images.unsplash.com/photo-1563212823-3882f05facdf?auto=format&fit=crop&w=400&q=80', desc: 'Sweet and crunchy red bell peppers.', sku: 'GR-PRD-019' },
  { name: 'Chicken Breast (Organic)', category: 'Meat & Seafood', price: 12.49, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80', desc: 'Boneless, skinless organic chicken.', sku: 'GR-MET-020' },
  { name: 'Dark Chocolate Bars (3pk)', category: 'Pantry', price: 7.50, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=400&q=80', desc: '72% cocoa fair-trade dark chocolate.', sku: 'GR-PAN-021' },
  { name: 'Almond Milk (Unsweetened)', category: 'Dairy & Eggs', price: 3.99, image: 'https://images.unsplash.com/photo-1563636619-e910bd2911bc?auto=format&fit=crop&w=400&q=80', desc: 'Creamy almond milk with no added sugar.', sku: 'GR-DRY-022' },
  { name: 'Roma Tomatoes (1lb)', category: 'Produce', price: 2.99, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80', desc: 'Firm and flavorful vine-ripened tomatoes.', sku: 'GR-PRD-023' },
  { name: 'Peanut Butter (Smooth)', category: 'Pantry', price: 4.50, image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=400&q=80', desc: 'Classic smooth peanut butter.', sku: 'GR-PAN-024' },
  { name: 'Orange Juice - No Pulp', category: 'Beverages', price: 5.49, image: 'https://images.unsplash.com/photo-1600271886399-d4490333240a?auto=format&fit=crop&w=400&q=80', desc: '100% pure squeezed orange juice.', sku: 'GR-BEV-025' },
];

async function seed() {
  console.log('🌱 (v10) Seeding GrocerEase POS items...');
  
  try {
    // 1. Fetch or create merchant for GrocerEase
    console.log('  🔍 Finding merchant for GrocerEase...');
    const merchantRes = await sql`SELECT id FROM merchants WHERE tenant_id = ${GROCEREASE_TENANT_ID}::uuid LIMIT 1`;
    let merchantId: string;

    if (merchantRes.length === 0) {
      console.log('  ⚠️ No merchant found for GrocerEase. Creating one...');
      merchantId = 'b1000000-7777-4777-7777-777777777777'; // Deterministic ID
      await sql`
        INSERT INTO merchants (id, tenant_id, legal_name, dba_name, mcc, status, address_country, created_at, updated_at)
        VALUES (${merchantId}::uuid, ${GROCEREASE_TENANT_ID}::uuid, 'GrocerEase Inc.', 'GrocerEase', '5411', 'active', 'US', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `;
    } else {
      merchantId = merchantRes[0].id;
    }
    console.log(`  ✅ Using Merchant ID: ${merchantId}`);

    // 2. Clear existing products
    console.log('  🗑️ Clearing old GrocerEase products...');
    await sql`DELETE FROM products WHERE tenant_id = ${GROCEREASE_TENANT_ID}::uuid`;

    // 3. Insert new products
    for (const p of PRODUCTS) {
      await sql`
        INSERT INTO products (
          id, tenant_id, merchant_id, sku, name, description, unit_price_cents, category, image_url, is_active, metadata, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${GROCEREASE_TENANT_ID}::uuid,
          ${merchantId}::uuid,
          ${p.sku},
          ${p.name},
          ${p.desc},
          ${Math.round(p.price * 100)},
          ${p.category},
          ${p.image},
          true,
          ${JSON.stringify({ stock: 100 })},
          NOW(),
          NOW()
        );
      `;
      console.log(`  ✅ Added: ${p.name}`);
    }
    console.log('✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    console.error(err);
  } finally {
    await sql.end();
  }
}

seed();
