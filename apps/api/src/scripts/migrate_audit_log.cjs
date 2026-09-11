/**
 * Create audit_log table for Sovereign Audit Trail
 * Satisfies: AuditLogService.record() writes to this table
 * (admin_audit_logs is a SEPARATE table — for internal-user admin actions only)
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

async function run() {
  // Create the canonical audit_log table that AuditLogService.record() writes to
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.audit_log (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id    TEXT NOT NULL,
      user_id      TEXT NOT NULL,
      action       TEXT NOT NULL,
      amount_cents INTEGER,
      trace_id     TEXT,
      details      JSONB,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON public.audit_log (tenant_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_trace ON public.audit_log (trace_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log (created_at DESC);`);

  console.log('[DDL] audit_log table created (or already exists)');

  // Verify
  const verify = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_log' ORDER BY ordinal_position"
  );
  console.log('[VERIFY] audit_log columns:', verify.rows.map(r => r.column_name).join(', '));

  // Write a test record to prove the Sovereign Trail is live
  await pool.query(`
    INSERT INTO public.audit_log (tenant_id, user_id, action, details)
    VALUES ('system', 'bootstrap', 'AUDIT_LOG_SCHEMA_CREATED', '{"source":"migrate_audit_log.cjs","version":"1.0"}')
  `);
  console.log('[PROOF] Test audit record inserted successfully');

  // Count total records
  const count = await pool.query('SELECT COUNT(*) AS c FROM public.audit_log');
  console.log('[PROOF] Total audit_log records:', count.rows[0].c);

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
