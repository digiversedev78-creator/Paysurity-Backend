import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createHash } from 'crypto';

const HOB_TENANT_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const TAWAKKUL_TENANT_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

// Helper to generate a stable UUID from a string (for consistent seeding)
function getDeterministicId(input: string): string {
  const hash = createHash('sha256').update(input).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20), // Variant 1
    hash.substring(20, 32)
  ].join('-');
}

const HOB_MENU = [
  {
    category: "Biryani & Rice",
    items: [
      { name: "Chicken Dum Biryani", price_cents: 2503, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq", description: "Classic Hyderabadi basmati rice with tender marinated chicken." },
      { name: "Mutton Biryani", price_cents: 3340, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq", description: "Fragrant rice layered with succulent goat meat and spices." },
      { name: "Paneer Biryani", price_cents: 2169, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq", description: "Vegetarian biryani with spiced cottage cheese cubes." },
      { name: "Plain Basmati Rice", price_cents: 699, description: "Steamed premium long-grain basmati rice." }
    ]
  },
  {
    category: "Paan (Specialty Counter)",
    items: [
      { name: "Meetha Paan", price_cents: 599, image_url: "https://i0.wp.com/www.bharatzkitchen.com/wp-content/uploads/2021/04/Meetha-Paan.jpg", description: "Traditional sweet betel leaf with gulkand, fennel, and dates." },
      { name: "Chocolate Paan", price_cents: 699, image_url: "https://www.cookwithmanali.com/wp-content/uploads/2016/10/Chocolate-Paan.jpg", description: "Meetha paan coated in rich dark chocolate and sprinkles." },
      { name: "Fire Paan", price_cents: 899, image_url: "https://i.ytimg.com/vi/9lVoQukJ4tY/maxresdefault.jpg", description: "A flaming betel leaf experience with cooling spices." },
      { name: "Magai Paan", price_cents: 749, image_url: "https://images.slurrp.com/prod/recipe_images/better-butter/meetha-paan_1603525206.webp", description: "Premium delicate Magai leaf with artisanal sweet fillings." },
      { name: "Sada Paan", price_cents: 499, image_url: "https://4.bp.blogspot.com/-pM8_w4n5_VQ/W1_m8U_6_0I/AAAAAAAAB_M/pM8_w4n5_VQ/s1600/sada-paan.jpg", description: "Traditional plain betel leaf palate cleanser." }
    ]
  },
  {
    category: "Chicken Entrees",
    items: [
      { name: "Chicken 65", price_cents: 1599, description: "Spicy, deep-fried tempered chicken with curry leaves." },
      { name: "Chilli Chicken", price_cents: 1599, description: "Indo-Chinese style sautéed chicken with bell peppers." },
      { name: "Chicken Manchurian", price_cents: 1599, description: "Chicken dumplings in a tangy soy-based sauce." }
    ]
  },
  {
    category: "Mutton (Goat) Specialties",
    items: [
      { name: "Mutton Fry", price_cents: 2299, description: "Slow-cooked goat meat with caramelised onions and spices." },
      { name: "Mutton Karahi", price_cents: 2099, description: "Goat meat cooked in a traditional wok with tomatoes." }
    ]
  },
  {
    category: "Tandoori & Grills",
    items: [
      { name: "Chicken Tikka", price_cents: 1699, description: "Boneless chicken marinated in yogurt and clay-oven roasted." },
      { name: "Tandoori Chicken (Half)", price_cents: 1599, description: "Bone-in chicken grilled with traditional red marination." }
    ]
  },
  {
    category: "Bread & Naan",
    items: [
      { name: "Butter Naan", price_cents: 450, description: "Soft leavened clay-oven bread with butter." },
      { name: "Garlic Naan", price_cents: 550, description: "Naan topped with fresh minced garlic and herbs." },
      { name: "Tandoori Roti", price_cents: 399, description: "Whole wheat bread baked in a tandoor." }
    ]
  },
  {
    category: "Desserts",
    items: [
      { name: "Gulab Jamun", price_cents: 699, description: "Deep-fried milk solids in sugar syrup." },
      { name: "Ras Malai", price_cents: 799, description: "Soft cottage cheese patties in sweetened milk." }
    ]
  },
  {
    category: "Catering",
    items: [
      { name: "Mutton Biryani — Full Tray", price_cents: 18000, description: "Serves 20-25 guests. Fragrant dum mutton biryani with raita and salan." },
      { name: "Mutton Biryani — Half Tray", price_cents: 10000, description: "Serves 10-12 guests." },
      { name: "Chicken Biryani — Full Tray", price_cents: 12500, description: "Serves 20-25 guests. Aromatic Hyderabadi chicken dum biryani." },
      { name: "Chicken Biryani — Half Tray", price_cents: 7250, description: "Serves 10-12 guests." },
      { name: "Goat Haleem — Full Tray", price_cents: 16000, description: "Serves 20-25 guests. Slow-cooked Hyderabadi goat haleem." },
      { name: "Goat Haleem — Half Tray", price_cents: 9000, description: "Serves 10-12 guests." },
      { name: "Chicken 65 — Full Tray", price_cents: 18000, description: "Serves 20-25 guests. Crispy deep-fried chicken 65 with curry leaves." },
      { name: "Chicken 65 — Half Tray", price_cents: 10000, description: "Serves 10-12 guests." },
      { name: "Sarda Ka Paan — Full Tray", price_cents: 25000, description: "Serves 50 guests. Traditional artisanal paan selection." },
      { name: "Sarda Ka Paan — Half Tray", price_cents: 13500, description: "Serves 25 guests." }
    ]
  }
];

const TAWAKKUL_MENU = [
  {
    category: "Signature Mutton",
    items: [
      { name: "Mutton Fry (Talewa Gosh)", price_cents: 1799, description: "Authentic Hyderabadi deep-fried spiced mutton." },
      { name: "Mutton Qorma", price_cents: 1599, description: "Rich goat meat curry with yogurt and nuts." },
      { name: "Mutton Masala", price_cents: 1599, description: "Goat meat in a thick, spicy gravy." }
    ]
  },
  {
    category: "Vegetarian",
    items: [
      { name: "Alu-Gobi Masala", price_cents: 1399, description: "Potato and cauliflower cooked with tomatoes and spices." },
      { name: "Daal Tadka", price_cents: 1099, description: "Yellow lentils tempered with cumin and garlic." }
    ]
  }
];

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev',
  });
  const db = drizzle(pool);

  console.log('Seeding House of Biryani...');
  await seedRestaurant(db, HOB_TENANT_ID, HOB_MENU);

  console.log('Seeding Tawakkul...');
  await seedRestaurant(db, TAWAKKUL_TENANT_ID, TAWAKKUL_MENU);

  await pool.end();
  console.log('Seeding complete.');
}

async function seedRestaurant(db: any, tenantId: string, categories: any[]) {
  for (const cat of categories) {
    const catId = getDeterministicId(`${tenantId}:${cat.category}`);
    await db.execute(sql`
      INSERT INTO menu_categories (id, tenant_id, name, display_order, is_active)
      VALUES (${catId}, ${tenantId}, ${cat.category}, 0, true)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `);

    for (const item of cat.items) {
      const itemId = getDeterministicId(`${tenantId}:${cat.category}:${item.name}`);
      
      // Update menu_items (Canonical)
      await db.execute(sql`
        INSERT INTO menu_items (id, tenant_id, category_id, name, description, price_cents, image_url, is_active)
        VALUES (${itemId}, ${tenantId}, ${catId}, ${item.name}, ${item.description}, ${item.price_cents}, ${item.image_url || null}, true)
        ON CONFLICT (id) DO UPDATE SET
          price_cents = EXCLUDED.price_cents,
          description = EXCLUDED.description
      `);
      
      // Sync to microsite_menu_items (Storefront)
      await db.execute(sql`
        INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, category, image_url)
        VALUES (${itemId}, ${tenantId}, ${item.name}, ${item.description}, ${item.price_cents/100}, ${item.price_cents/100}, ${cat.category}, ${item.image_url || null})
        ON CONFLICT (id) DO UPDATE SET
          base_price = EXCLUDED.base_price,
          display_price = EXCLUDED.display_price,
          description = EXCLUDED.description
      `);
    }
  }
}

seed().catch(console.error);
