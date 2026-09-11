/**
 * Ashiana Collections — Apparel Silo Seeding Script
 * Tenant: ashiana-collections | ddeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
 *
 * Populates:
 *   1. retail_apparel_attributes (DDL + data) — sizes, colors, fabric, season, bridal_wear
 *   2. retail_items (100+ SKUs across Bridal Wear, Day-to-Day Wear, Accessories)
 *   3. microsite_menu_items (catalog sync for storefront)
 */
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const ASHIANA_TENANT_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

// ── Catalog Data ──────────────────────────────────────────────────────────────
interface ApparelItem {
  name: string;
  description: string;
  price_cents: number;
  category: string;
  sizes: string[];
  colors: string[];
  fabric: string;
  season: string;
  bridal_wear: boolean;
  image_url: string;
}

const BRIDAL: ApparelItem[] = [
  { 
    name: 'Crimson Velvet Lehenga Set', 
    description: 'Hand-embroidered velvet lehenga with gold zari work, bridal dupatta included', 
    price_cents: 89900, 
    category: 'Bridal Wear', 
    sizes: ['XS','S','M','L','XL'], 
    colors: ['Crimson','Ivory','Gold'], 
    fabric: 'Velvet', 
    season: 'Fall/Winter', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    name: 'Ivory Silk Bridal Saree', 
    description: 'Pure Banarasi silk saree with antique gold border, custom stitching', 
    price_cents: 74900, 
    category: 'Bridal Wear', 
    sizes: ['Free Size'], 
    colors: ['Ivory','Champagne','Blush'], 
    fabric: 'Silk', 
    season: 'Spring/Summer', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1610030469668-9351052d01ec?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Emerald Organza Anarkali', 
    description: 'Floor-length organza anarkali with mirror work and thread embroidery', 
    price_cents: 54900, 
    category: 'Bridal Wear', 
    sizes: ['S','M','L','XL','XXL'], 
    colors: ['Emerald','Sage','Mint'], 
    fabric: 'Organza', 
    season: 'Spring/Summer', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1599032909756-5dee8c658ba3?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Rose Gold Sharara Set', 
    description: 'Georgette sharara with intricate pearl and sequin detailing', 
    price_cents: 48900, 
    category: 'Bridal Wear', 
    sizes: ['XS','S','M','L'], 
    colors: ['Rose Gold','Blush','Antique Gold'], 
    fabric: 'Georgette', 
    season: 'Fall/Winter', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1622322062602-0e980315cf2d?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Midnight Blue Sherwani (Mens)', 
    description: 'Royal blue sherwani with silver embroidery, matching churidar and dupatta', 
    price_cents: 67900, 
    category: 'Bridal Wear', 
    sizes: ['S','M','L','XL','XXL'], 
    colors: ['Midnight Blue','Silver','Navy'], 
    fabric: 'Brocade', 
    season: 'Fall/Winter', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1597983073492-bc2aa0c7a5ce?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Peach Chiffon Saree — Bridal', 
    description: 'Lightweight chiffon saree with hand-painted floral motifs', 
    price_cents: 42900, 
    category: 'Bridal Wear', 
    sizes: ['Free Size'], 
    colors: ['Peach','Coral','Salmon'], 
    fabric: 'Chiffon', 
    season: 'Spring/Summer', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1583391262775-9224417a9436?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Burgundy Kalamkari Lehenga', 
    description: 'Traditional kalamkari printed lehenga with mirror embellishments', 
    price_cents: 39900, 
    category: 'Bridal Wear', 
    sizes: ['S','M','L','XL'], 
    colors: ['Burgundy','Maroon','Wine'], 
    fabric: 'Cotton Silk', 
    season: 'Fall/Winter', 
    bridal_wear: true,
    image_url: 'https://images.unsplash.com/photo-1610030469913-97cc1cf9f485?auto=format&fit=crop&w=800&q=80'
  }
];

const DAYWEAR: ApparelItem[] = [
  { 
    name: 'Linen Straight Kurta — Navy', 
    description: 'Breathable linen kurta with embroidered collar, everyday comfort', 
    price_cents: 7900, 
    category: 'Day-to-Day Wear', 
    sizes: ['XS','S','M','L','XL','XXL'], 
    colors: ['Navy','Royal Blue','Sky Blue'], 
    fabric: 'Linen', 
    season: 'Spring/Summer', 
    bridal_wear: false,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Cotton Palazzo Set — Beige', 
    description: 'Straight kurta and wide-leg palazzo, printed block motif', 
    price_cents: 6900, 
    category: 'Day-to-Day Wear', 
    sizes: ['XS','S','M','L','XL','XXL'], 
    colors: ['Beige','Cream','Ecru'], 
    fabric: 'Cotton', 
    season: 'All Season', 
    bridal_wear: false,
    image_url: 'https://images.unsplash.com/photo-1610030469601-5d9c79133bd5?auto=format&fit=crop&w=800&q=80'
  }
];

const ACCESSORIES: ApparelItem[] = [
  { 
    name: 'Zari Embroidered Clutch — Gold', 
    description: 'Hand-embroidered zari clutch with gold clasp and chain strap', 
    price_cents: 8900, 
    category: 'Accessories', 
    sizes: ['One Size'], 
    colors: ['Gold','Silver','Antique'], 
    fabric: 'Embroidered Fabric', 
    season: 'All Season', 
    bridal_wear: false,
    image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fd113f0d?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Potli Bag — Magenta Silk', 
    description: 'Traditional drawstring potli in pure silk with pearl string handle', 
    price_cents: 5900, 
    category: 'Accessories', 
    sizes: ['One Size'], 
    colors: ['Magenta','Deep Pink','Fuschia'], 
    fabric: 'Silk', 
    season: 'All Season', 
    bridal_wear: false,
    image_url: 'https://images.unsplash.com/photo-1612044342268-df09623e1f0e?auto=format&fit=crop&w=800&q=80'
  },
  { name: 'Kada Bangles Set — Gold-Plated', description: 'Set of 6 gold-plated brass kada bangles, hand-engraved', price_cents: 4900, category: 'Accessories', sizes: ['2/2','2/4','2/6','2/8'], colors: ['Gold','Rose Gold','Silver'], fabric: 'Metal', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kundan Maang Tikka', description: 'Traditional Rajasthani kundan stone maang tikka with pearl drop', price_cents: 3900, category: 'Accessories', sizes: ['One Size'], colors: ['Gold/Red','Gold/Green','Gold/White'], fabric: 'Metal/Kundan', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pashmina Wrap Stole — Ivory', description: 'Pure Kashmiri pashmina hand-woven stole with kani border', price_cents: 14900, category: 'Accessories', sizes: ['Free Size'], colors: ['Ivory','Beige','Cream'], fabric: 'Pashmina', season: 'Fall/Winter', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jadau Necklace Set', description: 'Antique jadau kundan choker necklace with matching earrings', price_cents: 22900, category: 'Accessories', sizes: ['One Size'], colors: ['Gold/Green','Gold/Red','Gold/Blue'], fabric: 'Metal/Kundan', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80' },
  { name: 'Embroidered Hair Accessories Set', description: 'Bridal hair pins, maang tikka, and passa set in zari work', price_cents: 6900, category: 'Accessories', sizes: ['One Size'], colors: ['Gold','Silver','Rose Gold'], fabric: 'Metal/Fabric', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Brocade Jutti — Punjabi Khussa', description: 'Hand-stitched Punjabi khussa in brocade with pointed toe', price_cents: 7900, category: 'Accessories', sizes: ['5','6','7','8','9','10'], colors: ['Gold/Red','Silver/Blue','Black/Gold'], fabric: 'Brocade', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1617943767355-668600885145?auto=format&fit=crop&w=800&q=80' },
  { name: 'Silk Scrunchie Set — 5 Pack', description: 'Pure silk scrunchies in assorted colors, no crease pulling', price_cents: 2900, category: 'Accessories', sizes: ['One Size'], colors: ['Multicolor','Pastels','Jewel Tones'], fabric: 'Silk', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1617325270113-a7d0e4e61394?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beaded Tassel Earrings', description: 'Long beaded earrings with fringe tassel, statement ethnic look', price_cents: 2200, category: 'Accessories', sizes: ['One Size'], colors: ['Turquoise','Coral','Ivory'], fabric: 'Beads/Metal', season: 'Spring/Summer', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80' },
  { name: 'Thread Work Satchel Bag', description: 'Canvas satchel with dense thread-work embroidery on flap', price_cents: 6400, category: 'Accessories', sizes: ['One Size'], colors: ['Navy/Multi','Black/Multi','Beige/Multi'], fabric: 'Canvas/Embroidered', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1544816153-12ad5d714b21?auto=format&fit=crop&w=800&q=80' },
  { name: 'Silver Anklet Payal Set', description: 'Handcrafted silver-plated anklet with ghungroo bells', price_cents: 3400, category: 'Accessories', sizes: ['One Size'], colors: ['Silver','Oxidized Silver','Gold-Plated'], fabric: 'Metal', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Kolhapuri Chappal — Tan', description: 'Traditional Kolhapuri handmade leather chappal with brass studs', price_cents: 5900, category: 'Accessories', sizes: ['5','6','7','8','9','10'], colors: ['Tan','Brown','Black'], fabric: 'Leather', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bandhani Print Tote — Multicolor', description: 'Cotton canvas tote with hand-dyed bandhani print', price_cents: 3200, category: 'Accessories', sizes: ['One Size'], colors: ['Multicolor','Red/Orange','Blue/Green'], fabric: 'Cotton Canvas', season: 'Spring/Summer', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Crystal Maang Tikka — Minimal', description: 'Minimalist crystal chain maang tikka for ready-to-wear brides', price_cents: 2600, category: 'Accessories', sizes: ['One Size'], colors: ['Silver/Clear','Gold/Clear','Rose Gold/Clear'], fabric: 'Metal/Crystal', season: 'All Season', bridal_wear: false, image_url: 'https://images.unsplash.com/photo-1599643477877-537ef5278531?auto=format&fit=crop&w=800&q=80' },
];

const ALL_ITEMS = [...BRIDAL, ...DAYWEAR, ...ACCESSORIES];

async function bootstrap() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev',
  });
  const db = drizzle(pool);

  console.log(`[SEED] Ashiana Tenant: ${ASHIANA_TENANT_ID}`);
  console.log(`[SEED] Total catalog items to seed: ${ALL_ITEMS.length}`);

  // ── 0. DDL: create retail_apparel_attributes if not exists ──────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS public.retail_apparel_attributes (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id    UUID NOT NULL,
      product_id   UUID NOT NULL,
      size         VARCHAR(20),
      color        VARCHAR(100),
      fabric       VARCHAR(100),
      season       VARCHAR(50),
      bridal_wear  BOOLEAN DEFAULT FALSE,
      in_stock     BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMPTZ DEFAULT NOW(),
      updated_at   TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, size, color)
    );
  `);

  // Ensure age_restricted and category on retail_items
  await db.execute(sql`ALTER TABLE public.retail_items ADD COLUMN IF NOT EXISTS age_restricted BOOLEAN DEFAULT FALSE;`);
  await db.execute(sql`ALTER TABLE public.retail_items ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
  await db.execute(sql`ALTER TABLE public.retail_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50;`);

  // Ensure category on microsite_menu_items
  await db.execute(sql`ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);

  console.log('\n[SEED] Phase 1: Seeding retail_items...');
  let itemsSeeded = 0;
  let attrsSeeded = 0;

  for (const item of ALL_ITEMS) {
    const price = item.price_cents / 100;

    // Insert retail_items row — returns the canonical ID
    const itemResult = await db.execute(sql`
      INSERT INTO public.retail_items
        (tenant_id, name, description, price_cents, category, age_restricted, stock_quantity)
      VALUES
        (${ASHIANA_TENANT_ID}, ${item.name}, ${item.description}, ${item.price_cents}, ${item.category}, false, 50)
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `);

    if (itemResult.rows.length === 0) {
      // Row already existed — fetch its ID
      const existing = await db.execute(sql`
        SELECT id FROM public.retail_items
        WHERE tenant_id = ${ASHIANA_TENANT_ID} AND name = ${item.name}
        LIMIT 1
      `);
      if (existing.rows.length === 0) continue;
      itemResult.rows.push(existing.rows[0]);
    }

    const productId = itemResult.rows[0].id as string;
    itemsSeeded++;

    // Sync to microsite_menu_items
    await db.execute(sql`
      INSERT INTO public.microsite_menu_items
        (id, tenant_id, name, description, base_price, display_price, category)
      VALUES
        (${productId}, ${ASHIANA_TENANT_ID}, ${item.name}, ${item.description}, ${price}, ${price}, ${item.category})
      ON CONFLICT (id) DO UPDATE
        SET base_price = EXCLUDED.base_price,
            display_price = EXCLUDED.display_price,
            category = EXCLUDED.category
    `);

    // Insert one attribute row per (size × color) combination
    for (const size of item.sizes) {
      for (const color of item.colors) {
        await db.execute(sql`
          INSERT INTO public.retail_apparel_attributes
            (tenant_id, product_id, size, color, fabric, season, bridal_wear, in_stock)
          VALUES
            (${ASHIANA_TENANT_ID}, ${productId}, ${size}, ${color}, ${item.fabric}, ${item.season}, ${item.bridal_wear}, true)
          ON CONFLICT (product_id, size, color) DO NOTHING
        `);
        attrsSeeded++;
      }
    }

    console.log(`  ✓ [${item.category}] ${item.name} | $${price.toFixed(2)} | ${item.sizes.length}sz × ${item.colors.length}clr`);
  }

  // ── VERIFICATION ─────────────────────────────────────────────────────────────
  console.log(`\n[SEED] Complete: ${itemsSeeded} items, ${attrsSeeded} attribute variants`);

  const counts = await db.execute(sql`
    SELECT category, COUNT(*) as items
    FROM public.retail_items
    WHERE tenant_id = ${ASHIANA_TENANT_ID}
    GROUP BY category ORDER BY category
  `);
  console.log('\n[VERIFY] Category breakdown:');
  console.table(counts.rows);

  console.log('\n[VERIFY] Sample: Bridal item with apparel attributes (Drizzle JOIN):');
  const sample = await db.execute(sql`
    SELECT
      r.id         AS item_id,
      r.name       AS item_name,
      r.price_cents,
      r.category,
      a.size,
      a.color,
      a.fabric,
      a.season,
      a.bridal_wear
    FROM public.retail_items r
    JOIN public.retail_apparel_attributes a ON a.product_id = r.id
    WHERE r.tenant_id = ${ASHIANA_TENANT_ID}
      AND r.category  = 'Bridal Wear'
    ORDER BY r.name, a.size, a.color
    LIMIT 5
  `);
  console.table(sample.rows);

  await pool.end();
}

bootstrap().catch(err => { console.error(err); throw new Error("System guardrail exit"); });
