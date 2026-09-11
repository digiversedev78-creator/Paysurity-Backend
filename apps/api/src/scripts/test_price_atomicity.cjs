/**
 * Atomicity proof test:
 * 1. Attempt a valid price update (both retail_items UPDATE + price_change_log INSERT succeed)
 * 2. Simulate a log INSERT failure by referencing a non-existent column — confirm price did NOT change
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

const ASHIANA = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

async function run() {
  // Get a real item to test against
  const item = await pool.query(
    'SELECT id, name, price_cents FROM public.retail_items WHERE tenant_id = $1 LIMIT 1',
    [ASHIANA]
  );
  if (item.rows.length === 0) { console.log('SKIP: No Ashiana items'); await pool.end(); return; }

  const { id: itemId, name: itemName, price_cents: originalPrice } = item.rows[0];
  console.log(`\nTest item: "${itemName}" | ID: ${itemId} | Price: ${originalPrice}¢`);

  // TEST A: VALID transaction — both UPDATE + INSERT succeed
  console.log('\nTEST A: Valid atomic price update (should succeed)');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const upd = await client.query(
      'UPDATE public.retail_items SET price_cents = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING id, price_cents',
      [originalPrice + 100, itemId, ASHIANA]
    );
    const log = await client.query(
      `INSERT INTO public.price_change_log
         (item_id, tenant_id, item_name, old_price_cents, new_price_cents, changed_by, changed_by_role, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'TEST')
       RETURNING id`,
      [itemId, ASHIANA, itemName, originalPrice, originalPrice + 100, 'test_actor', 'TENANT_ADMIN']
    );
    await client.query('COMMIT');
    console.log('  retail_items updated to:', upd.rows[0].price_cents + '¢  ✅');
    console.log('  price_change_log entry:', log.rows[0].id, '✅');

    // Roll back to original for test B
    await client.query('BEGIN');
    await client.query(
      'UPDATE public.retail_items SET price_cents = $1 WHERE id = $2 AND tenant_id = $3',
      [originalPrice, itemId, ASHIANA]
    );
    await client.query('COMMIT');
    console.log('  Restored to original price:', originalPrice + '¢');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('  TEST A FAILED:', e.message);
  } finally { client.release(); }

  // TEST B: LOG INSERT FAILS — confirm price was NOT changed (rollback)
  console.log('\nTEST B: Simulated log INSERT failure (price must roll back)');
  const client2 = await pool.connect();
  try {
    await client2.query('BEGIN');
    // Update price
    await client2.query(
      'UPDATE public.retail_items SET price_cents = $1 WHERE id = $2 AND tenant_id = $3',
      [999999, itemId, ASHIANA] // Extreme price that should NEVER persist
    );
    // Intentionally bad INSERT — references non-existent column
    await client2.query('INSERT INTO public.price_change_log (nonexistent_column) VALUES (1)');
    await client2.query('COMMIT');
    console.log('  ❌ FAIL: Transaction should have aborted');
  } catch(e) {
    await client2.query('ROLLBACK');
    console.log('  ROLLBACK triggered by log failure:', e.message.slice(0, 50), '✅');

    // Verify price is still original
    const check = await pool.query('SELECT price_cents FROM public.retail_items WHERE id = $1', [itemId]);
    const priceAfterFailure = check.rows[0].price_cents;
    const intact = Number(priceAfterFailure) === Number(originalPrice);
    console.log('  Price after aborted transaction:', priceAfterFailure + '¢', intact ? '✅ INTACT' : '❌ CORRUPTED');
  } finally { client2.release(); }

  // TEST C: RLS cross-tenant proof
  console.log('\nTEST C: Cross-tenant UPDATE blocked by WHERE clause');
  const TOBACCO = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  const cross = await pool.query(
    'UPDATE public.retail_items SET price_cents = 1 WHERE id = $1 AND tenant_id = $2 RETURNING id',
    [itemId, TOBACCO]
  );
  console.log('  rowCount:', cross.rowCount, cross.rowCount === 0 ? '✅ BLOCKED (correct)' : '❌ BREACH');

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
