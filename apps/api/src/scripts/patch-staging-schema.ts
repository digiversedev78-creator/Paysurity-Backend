/**
 * Patch script to ensure retail_items and retail_apparel_attributes exist in staging.
 */
import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL || 'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev';
const sql = postgres(DB_URL, { max: 1 });

async function patch() {
  console.log('🛠️ Patching staging schema...');

  try {
    // 1. Create retail_items
    console.log('  Creating retail_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.retail_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        price_cents INTEGER,
        category VARCHAR(100),
        age_restricted BOOLEAN DEFAULT FALSE,
        stock_quantity INTEGER DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Create retail_apparel_attributes
    console.log('  Creating retail_apparel_attributes table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.retail_apparel_attributes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        product_id UUID NOT NULL REFERENCES public.retail_items(id) ON DELETE CASCADE,
        size VARCHAR(20),
        color VARCHAR(100),
        fabric VARCHAR(100),
        season VARCHAR(50),
        bridal_wear BOOLEAN DEFAULT FALSE,
        in_stock BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(product_id, size, color)
      );
    `;

    // 3. Ensure columns in microsite_menu_items (if missing)
    console.log('  Checking microsite_menu_items columns...');
    await sql`ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS category VARCHAR(100);`;
    await sql`ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS base_price DECIMAL(12,2);`;
    await sql`ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS display_price DECIMAL(12,2);`;
    await sql`ALTER TABLE public.microsite_menu_items ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;`;

    console.log('✅ Staging schema patched successfully!');
  } catch (err) {
    console.error('❌ Patch failed:', err);
  } finally {
    await sql.end();
  }
}

patch();
