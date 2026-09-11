/**
 * Migrate price_change_log → item_change_log
 *
 * Strategy: ADD the metadata columns to the existing price_change_log table
 * (rename would break existing read queries in flight). We add:
 *   - change_type TEXT  : 'PRICE' | 'METADATA' | 'STOCK' | 'COMBINED'
 *   - changed_fields JSONB : { field_name: { old, new } } — general field diff
 *
 * Then create a CREATE VIEW item_change_log AS SELECT * FROM price_change_log
 * so all existing consumers can use either name.
 *
 * The existing price_change_log rows get change_type = 'PRICE' backfilled.
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

async function run() {
  // 1. Add change_type and changed_fields to price_change_log (idempotent)
  await pool.query(`
    ALTER TABLE public.price_change_log
      ADD COLUMN IF NOT EXISTS change_type     TEXT    NOT NULL DEFAULT 'PRICE',
      ADD COLUMN IF NOT EXISTS changed_fields  JSONB;
  `);
  console.log('[DDL] Added change_type, changed_fields to price_change_log');

  // 2. Backfill existing rows
  const { rowCount } = await pool.query(`
    UPDATE public.price_change_log
    SET change_type = 'PRICE',
        changed_fields = jsonb_build_object(
          'price_cents', jsonb_build_object('old', old_price_cents, 'new', new_price_cents)
        )
    WHERE change_type = 'PRICE' AND changed_fields IS NULL
  `);
  console.log('[BACKFILL] Updated', rowCount, 'existing rows with changed_fields');

  // 3. Create item_change_log VIEW as alias (idempotent)
  await pool.query(`
    CREATE OR REPLACE VIEW public.item_change_log AS
    SELECT
      id,
      item_id,
      tenant_id,
      item_name,
      change_type,
      changed_fields,
      old_price_cents,
      new_price_cents,
      changed_by,
      changed_by_role,
      acting_admin_id,
      override_reason,
      source,
      ip_address,
      created_at
    FROM public.price_change_log
    ORDER BY created_at DESC;
  `);
  console.log('[DDL] item_change_log VIEW created (SELECT * FROM price_change_log)');

  // 4. Create index on change_type for God-View filters
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_pcl_change_type ON public.price_change_log (change_type);
  `);

  // 5. Verify
  const cols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'price_change_log' ORDER BY ordinal_position"
  );
  console.log('\n[VERIFY] price_change_log final schema:');
  cols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(22)} ${c.data_type}`));

  const viewCheck = await pool.query(
    "SELECT table_name FROM information_schema.views WHERE table_name = 'item_change_log'"
  );
  console.log('\n[VERIFY] item_change_log view:', viewCheck.rows.length > 0 ? 'EXISTS ✅' : 'MISSING ❌');

  // 6. Seed a test METADATA change row
  await pool.query(`
    INSERT INTO public.price_change_log
      (item_id, tenant_id, item_name, old_price_cents, new_price_cents,
       changed_by, changed_by_role, source, change_type, changed_fields)
    VALUES
      ('schema-test', 'system', 'Schema Upgrade Test', 0, 0,
       'migrate_script', 'SUPER_ADMIN', 'MIGRATION', 'METADATA',
       '{"fabric": {"old": "Cotton", "new": "Silk"}, "season": {"old": "Spring/Summer", "new": "Fall/Winter"}}')
  `);
  const total = await pool.query('SELECT COUNT(*) AS c, COUNT(DISTINCT change_type) AS types FROM public.price_change_log');
  console.log('\n[PROOF] Total records:', total.rows[0].c, '| Distinct change_types:', total.rows[0].types);

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
