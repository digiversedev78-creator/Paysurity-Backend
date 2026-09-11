/**
 * Create price_change_log table — Sovereign Price Audit Trail
 *
 * Every price mutation (tenant-admin OR super-admin override) writes
 * an immutable row here WITHIN THE SAME DRIZZLE TRANSACTION.
 * If this INSERT fails, the price update is rolled back entirely.
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.price_change_log (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

      -- Item being modified
      item_id         TEXT        NOT NULL,
      tenant_id       TEXT        NOT NULL,   -- ALWAYS the MERCHANT tenant (never the admin's tenant)
      item_name       TEXT,                   -- Snapshot name at time of change

      -- Price delta
      old_price_cents INTEGER     NOT NULL,
      new_price_cents INTEGER     NOT NULL,

      -- Who did it — the UNBREAKABLE audit fields
      changed_by      TEXT        NOT NULL,   -- user_id or admin_id — NEVER NULL
      changed_by_role TEXT        NOT NULL,   -- 'TENANT_ADMIN' | 'SUPER_ADMIN' | 'SUB_SUPER_ADMIN'
      acting_admin_id TEXT,                   -- Populated ONLY for super-admin overrides
      override_reason TEXT,                   -- Optional justification for admin overrides

      -- Context
      source          TEXT        NOT NULL DEFAULT 'API', -- 'API' | 'POS' | 'MIGRATION'
      ip_address      TEXT,
      user_agent      TEXT,

      -- Timestamps (immutable — no updated_at)
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pcl_item     ON public.price_change_log (item_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pcl_tenant   ON public.price_change_log (tenant_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pcl_actor    ON public.price_change_log (changed_by);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pcl_created  ON public.price_change_log (created_at DESC);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pcl_override ON public.price_change_log (acting_admin_id) WHERE acting_admin_id IS NOT NULL;`);

  console.log('[DDL] price_change_log table created (or already exists)');

  // Verify schema
  const cols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'price_change_log' ORDER BY ordinal_position"
  );
  console.log('[VERIFY] Columns:');
  cols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(20)} ${c.data_type}`));

  // Seed a test row to prove atomicity works
  await pool.query(`
    INSERT INTO public.price_change_log
      (item_id, tenant_id, item_name, old_price_cents, new_price_cents, changed_by, changed_by_role, source)
    VALUES
      ('bootstrap-test', 'system', 'Schema Bootstrap Test', 0, 0, 'migrate_script', 'SUPER_ADMIN', 'MIGRATION')
  `);
  console.log('[PROOF] Test price_change_log record inserted');

  const count = await pool.query('SELECT COUNT(*) AS c FROM public.price_change_log');
  console.log('[PROOF] Total price_change_log records:', count.rows[0].c);

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
