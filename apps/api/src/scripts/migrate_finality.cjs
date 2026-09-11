/**
 * Finality Migration — Three operations in one script:
 *
 * 1. ADD low_stock_threshold to retail_items (per-merchant, per-item default 10)
 * 2. ADD GIN index on price_change_log.changed_fields (JSON search acceleration)
 * 3. ADD BTREE index on retail_items.low_stock_threshold (Sentry query optimization)
 * 4. Seed Ashiana items with a starter threshold of 10
 * 5. Verify everything
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

async function run() {
  // ── 1. ADD low_stock_threshold to retail_items ──────────────────────────────
  await pool.query(`
    ALTER TABLE public.retail_items
      ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 10;
  `);
  console.log('[DDL] low_stock_threshold column added (default=10)');

  // ── 2. ADD GIN index on changed_fields (JSONB containment queries) ──────────
  // Using plain BTREE on change_type (already has idx_pcl_change_type).
  // Adding GIN for @> containment queries: "all METADATA rows where fabric changed"
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pcl_changed_fields_gin
    ON public.price_change_log USING GIN (changed_fields);
  `);
  console.log('[DDL] GIN index on price_change_log.changed_fields created');

  // ── 3. ADD BTREE partial index for low-stock Sentry queries ─────────────────
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_retail_items_low_stock_sentry
    ON public.retail_items (tenant_id, low_stock_threshold, stock_quantity)
    WHERE stock_quantity IS NOT NULL;
  `);
  console.log('[DDL] Sentry index on retail_items (tenant_id, threshold, stock_quantity) created');

  // ── 4. Seed Ashiana-specific thresholds (bridal wear = 5, others = 10) ──────
  const bridalResult = await pool.query(`
    UPDATE public.retail_items
    SET low_stock_threshold = 5
    WHERE tenant_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
      AND category = 'Bridal Wear'
  `);
  console.log('[SEED] Bridal Wear threshold set to 5 for', bridalResult.rowCount, 'items');


  // ── 5. Verify final schema ───────────────────────────────────────────────────
  const riCols = await pool.query(
    "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='retail_items' AND column_name IN ('stock_quantity','low_stock_threshold') ORDER BY ordinal_position"
  );
  console.log('\n[VERIFY] retail_items stock columns:');
  riCols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(25)} ${c.data_type.padEnd(15)} default=${c.column_default}`));

  const indexes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename IN ('price_change_log', 'retail_items')
      AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname
  `);
  console.log('\n[VERIFY] Active custom indexes:');
  indexes.rows.forEach(i => console.log(`  ${i.indexname}`));

  // ── 6. Preview Sentry trigger items for Ashiana ──────────────────────────────
  const sentryItems = await pool.query(`
    SELECT id, name, category, stock_quantity, low_stock_threshold,
           (stock_quantity <= low_stock_threshold) AS is_low_stock
    FROM public.retail_items
    WHERE tenant_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
      AND stock_quantity IS NOT NULL
    ORDER BY (stock_quantity::float / GREATEST(low_stock_threshold, 1)) ASC
    LIMIT 8
  `);
  console.log('\n[SENTRY PREVIEW] Items nearest threshold:');
  sentryItems.rows.forEach(r => {
    const flag = r.is_low_stock ? '🔴 LOW' : '✅ OK';
    console.log(`  ${String(r.name).padEnd(38)} stock=${String(r.stock_quantity).padEnd(4)} threshold=${String(r.low_stock_threshold).padEnd(3)} ${flag} [${r.category}]`);
  });

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
