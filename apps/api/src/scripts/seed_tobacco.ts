import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const TOBACCO_TENANT_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

interface SeedItem {
  name: string;
  description: string;
  price_cents: number;
  category: string;
  age_restricted: boolean;
  image_url: string;
}

const ITEMS: SeedItem[] = [
  // ── Disposable Vapes ─────────────────────────
  { 
    name: 'Geek Bar Pulse — Watermelon Ice', 
    description: '15,000 puff disposable vape, 5% nic salt', 
    price_cents: 2499, 
    category: 'Vapes', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1595113333346-ad3f809079f9?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Lost Mary MO5000 — Triple Berry', 
    description: 'Rechargeable 5,000 puff disposable', 
    price_cents: 1999, 
    category: 'Vapes', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-159511333346-ad3f809079f9?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Elf Bar BC5000 — Blueberry Mint', 
    description: 'Ultra-smooth 5,000 puff rechargeable', 
    price_cents: 1799, 
    category: 'Vapes', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-159511333346-ad3f809079f9?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Vaporesso XROS Pro — Pod Kit', 
    description: 'Adjustable wattage pod system', 
    price_cents: 3999, 
    category: 'Vapes', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1610444360341-3522f7966779?auto=format&fit=crop&w=800&q=80'
  },

  // ── Premium Cigars ────────────────────────────
  { 
    name: 'Arturo Fuente Hemingway Short Story', 
    description: 'Limited perfecto cut, sun-grown Dominican wrapper', 
    price_cents: 2200, 
    category: 'Cigars', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1541625602330-2277a1cd1f59?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Padron 1964 Anniversary Maduro', 
    description: 'Box-pressed Nicaraguan, 40-year-old leaf', 
    price_cents: 3200, 
    category: 'Cigars', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1541625602330-2277a1cd1f59?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Davidoff Grand Cru No. 3', 
    description: 'Dominican elegance, mild-medium Connecticut shade', 
    price_cents: 3800, 
    category: 'Cigars', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1541625602330-2277a1cd1f59?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Cohiba Robusto — Cuban', 
    description: 'Authentic Habanos certified Cuban', 
    price_cents: 5500, 
    category: 'Cigars', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1541625602330-2277a1cd1f59?auto=format&fit=crop&w=800&q=80'
  },

  // ── Cigarettes ─────────────────────────────────
  { 
    name: 'Marlboro Red — King Box', 
    description: 'Full flavor premium cigarette', 
    price_cents: 950, 
    category: 'Cigarettes', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Camel Blue — King Box', 
    description: 'Smooth blend tobacco cigarette', 
    price_cents: 900, 
    category: 'Cigarettes', 
    age_restricted: true,
    image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
  },

  // ── Accessories ──────────────────────────
  { 
    name: 'RAW Classic 1¼ Rolling Papers', 
    description: 'Unrefined hemp paper, 50 leaves', 
    price_cents: 299, 
    category: 'Accessories', 
    age_restricted: false,
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Clipper Flint Lighter — Assorted', 
    description: 'Refillable, replaceable flint lighter', 
    price_cents: 299, 
    category: 'Accessories', 
    age_restricted: false,
    image_url: 'https://images.unsplash.com/photo-1533965935044-6725206bc29c?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Torch Flame Cigar Lighter', 
    description: 'Triple-jet windproof butane torch', 
    price_cents: 1999, 
    category: 'Accessories', 
    age_restricted: false,
    image_url: 'https://images.unsplash.com/photo-1533965935044-6725206bc29c?auto=format&fit=crop&w=800&q=80'
  },
  { 
    name: 'Glass Ashtray — Round 5"', 
    description: 'Heavy duty borosilicate glass ashtray', 
    price_cents: 1299, 
    category: 'Accessories', 
    age_restricted: false,
    image_url: 'https://images.unsplash.com/photo-1563810452357-1960133c94f0?auto=format&fit=crop&w=800&q=80'
  },
];

async function bootstrap() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev',
  });
  const db = drizzle(pool);

  console.log(`[SEED] Tobacco Tenant: ${TOBACCO_TENANT_ID}`);
  console.log(`[SEED] Total items to seed: ${ITEMS.length}`);

  // Ensure age_restricted column exists
  await db.execute(sql`
    ALTER TABLE public.retail_items ADD COLUMN IF NOT EXISTS age_restricted BOOLEAN DEFAULT FALSE;
  `);

  // Ensure category and image_url columns exist on microsite_menu_items
  await db.execute(sql`
    ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS category VARCHAR(100);
  `);
  await db.execute(sql`
    ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;
  `);
  
  // Ensure image_url on retail_items
  await db.execute(sql`
    ALTER TABLE public.retail_items ADD COLUMN IF NOT EXISTS image_url TEXT;
  `);

  let seeded = 0;
  for (const item of ITEMS) {
    const result = await db.execute(sql`
      INSERT INTO public.retail_items (tenant_id, name, description, price_cents, category, age_restricted, image_url)
      VALUES (${TOBACCO_TENANT_ID}, ${item.name}, ${item.description}, ${item.price_cents}, ${item.category}, ${item.age_restricted}, ${item.image_url})
      ON CONFLICT DO NOTHING
      RETURNING id, name, category, age_restricted
    `);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      const price = item.price_cents / 100;
      await db.execute(sql`
        INSERT INTO public.microsite_menu_items (id, tenant_id, name, description, base_price, display_price, category, image_url)
        VALUES (${row.id}, ${TOBACCO_TENANT_ID}, ${item.name}, ${item.description}, ${price}, ${price}, ${item.category}, ${item.image_url})
        ON CONFLICT (id) DO UPDATE SET 
          base_price = EXCLUDED.base_price, 
          display_price = EXCLUDED.display_price, 
          category = EXCLUDED.category,
          image_url = EXCLUDED.image_url;
      `);
      console.log(`  ✓ [${item.category}] ${item.name} | $${(item.price_cents/100).toFixed(2)} | age_restricted=${item.age_restricted}`);
      seeded++;
    }
  }

  console.log(`\n[SEED] Complete. ${seeded}/${ITEMS.length} items written to DB.`);

  // SQL Proof
  console.log('\n[VERIFY] SQL Proof — restricted items for Grand Tobacco Hub:');
  const proof = await db.execute(sql`
    SELECT id, tenant_id, name, category, price_cents, age_restricted
    FROM public.retail_items
    WHERE tenant_id = ${TOBACCO_TENANT_ID} AND age_restricted = true
    ORDER BY category, name
    LIMIT 5
  `);
  console.table(proof.rows);

  const counts = await db.execute(sql`
    SELECT category, COUNT(*) as total, SUM(CASE WHEN age_restricted THEN 1 ELSE 0 END) as age_gated
    FROM public.retail_items
    WHERE tenant_id = ${TOBACCO_TENANT_ID}
    GROUP BY category ORDER BY category
  `);
  console.log('\n[VERIFY] Category breakdown:');
  console.table(counts.rows);

  await pool.end();
}

bootstrap().catch(err => { console.error(err); throw new Error("System guardrail exit"); });

