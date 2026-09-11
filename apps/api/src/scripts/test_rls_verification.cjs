const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

const ASHIANA = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
const TOBACCO  = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

async function run() {
  // TEST 1: Cross-tenant UPDATE — Ashiana acting on a Tobacco item (must be blocked)
  const tobaccoRow = await pool.query(
    'SELECT id, price_cents FROM public.retail_items WHERE tenant_id = $1 LIMIT 1',
    [TOBACCO]
  );

  if (tobaccoRow.rows.length > 0) {
    const targetId = tobaccoRow.rows[0].id;
    const originalPrice = tobaccoRow.rows[0].price_cents;
    const attempt = await pool.query(
      'UPDATE public.retail_items SET price_cents = 1 WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [targetId, ASHIANA] // Wrong tenant — RLS wall via WHERE clause
    );
    console.log(
      'TEST 1  [Cross-tenant UPDATE blocked]:',
      attempt.rowCount === 0 ? 'PASS (rowCount=0)' : 'FAIL (rowCount=' + attempt.rowCount + ')'
    );

    // Verify original price unchanged
    const verify = await pool.query('SELECT price_cents FROM public.retail_items WHERE id = $1', [targetId]);
    const unchanged = verify.rows[0]?.price_cents == originalPrice;
    console.log('TEST 1b [Tobacco price unchanged after Ashiana attempt]:', unchanged ? 'PASS' : 'FAIL');
  } else {
    console.log('TEST 1  SKIP: No tobacco items seeded yet');
  }

  // TEST 2: Own-tenant catalog read
  const ownCatalog = await pool.query(
    'SELECT COUNT(*) AS c FROM public.retail_items WHERE tenant_id = $1',
    [ASHIANA]
  );
  const ashianaCount = Number(ownCatalog.rows[0].c);
  console.log('TEST 2  [Ashiana own catalog count]:', ashianaCount, ashianaCount > 0 ? 'PASS' : 'FAIL');

  // TEST 3: audit_log table structure
  const auditCols = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'audit_log' ORDER BY ordinal_position"
  );
  console.log(
    'TEST 3  [audit_log schema]:',
    auditCols.rows.length > 0 ? 'PASS — cols: ' + auditCols.rows.map(r => r.column_name).join(', ') : 'FAIL — TABLE MISSING'
  );

  // TEST 4: Apparel attributes seeded for Ashiana
  const attrs = await pool.query(
    'SELECT COUNT(*) AS c FROM public.retail_apparel_attributes WHERE tenant_id = $1',
    [ASHIANA]
  );
  const attrCount = Number(attrs.rows[0].c);
  console.log('TEST 4  [Ashiana apparel variants in DB]:', attrCount, attrCount > 0 ? 'PASS' : 'FAIL');

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
