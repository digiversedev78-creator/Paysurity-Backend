/**
 * Recon: Verify current DB state before any migrations.
 * Returns:
 *   1. retail_items column list (check for low_stock_threshold)
 *   2. price_change_log column list + index list (check changed_fields index)
 *   3. retail_apparel_attributes column list (check updated_at)
 *   4. Sample item_change_log METADATA row with changed_fields
 *   5. Distinct seasons + fabrics for Ashiana (microsite source)
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

async function run() {
  // 1. retail_items schema
  const riCols = await pool.query(
    "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name='retail_items' ORDER BY ordinal_position"
  );
  console.log('\n[RETAIL_ITEMS] Columns:');
  riCols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(28)} ${c.data_type}`));
  const hasThreshold = riCols.rows.some(r => r.column_name === 'low_stock_threshold');
  console.log('  low_stock_threshold exists:', hasThreshold ? 'YES' : 'NO — needs migration');

  // 2. price_change_log schema + indexes
  const pclCols = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='price_change_log' ORDER BY ordinal_position"
  );
  console.log('\n[PRICE_CHANGE_LOG] Columns:');
  pclCols.rows.forEach(c => console.log(`  ${c.column_name.padEnd(28)} ${c.data_type}`));

  const pclIdx = await pool.query(
    "SELECT indexname, indexdef FROM pg_indexes WHERE tablename='price_change_log' ORDER BY indexname"
  );
  console.log('\n[PRICE_CHANGE_LOG] Indexes:');
  pclIdx.rows.forEach(i => console.log(`  ${i.indexname}`));
  const hasGinIdx = pclIdx.rows.some(i => i.indexname.includes('gin') || i.indexdef?.includes('gin') || i.indexname.includes('field'));
  console.log('  GIN index on changed_fields:', hasGinIdx ? 'YES' : 'NO — needs migration');

  // 3. Sample METADATA log entry
  const metaRow = await pool.query(
    "SELECT id, item_id, tenant_id, change_type, changed_fields, changed_by, changed_by_role, created_at FROM public.price_change_log WHERE change_type = 'METADATA' ORDER BY created_at DESC LIMIT 1"
  );
  if (metaRow.rows.length > 0) {
    const r = metaRow.rows[0];
    console.log('\n[SAMPLE METADATA LOG ENTRY]');
    console.log('  id:            ', r.id);
    console.log('  item_id:       ', r.item_id);
    console.log('  tenant_id:     ', r.tenant_id);
    console.log('  change_type:   ', r.change_type);
    console.log('  changed_by:    ', r.changed_by);
    console.log('  changed_by_role:', r.changed_by_role);
    console.log('  changed_fields:', JSON.stringify(r.changed_fields, null, 2));
    console.log('  created_at:    ', r.created_at);
  } else {
    console.log('\n[SAMPLE METADATA LOG ENTRY] No METADATA rows yet');
  }

  // 4. Current stock levels vs a threshold (preview)
  const lowStock = await pool.query(
    "SELECT id, name, stock_quantity, category FROM public.retail_items WHERE tenant_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' AND stock_quantity IS NOT NULL ORDER BY stock_quantity ASC LIMIT 5"
  );
  console.log('\n[ASHIANA] Items with lowest stock_quantity:');
  lowStock.rows.forEach(r => console.log(`  ${r.name.padEnd(35)} stock=${r.stock_quantity}  category=${r.category}`));

  // 5. Fabrics + seasons
  const fabrics = await pool.query(
    "SELECT DISTINCT fabric FROM public.retail_apparel_attributes WHERE tenant_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' AND fabric IS NOT NULL ORDER BY fabric"
  );
  const seasons = await pool.query(
    "SELECT DISTINCT season FROM public.retail_apparel_attributes WHERE tenant_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' AND season IS NOT NULL ORDER BY season"
  );
  console.log('\n[ASHIANA] Distinct fabrics:', fabrics.rows.map(r => r.fabric));
  console.log('[ASHIANA] Distinct seasons:', seasons.rows.map(r => r.season));

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
