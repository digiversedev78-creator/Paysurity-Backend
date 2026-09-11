/**
 * Recon: Map all tenant IDs, current stock levels, and price_change_log summary
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });

async function run() {
  // 1. All tenants
  const tenants = await pool.query(
    "SELECT DISTINCT r.tenant_id, COUNT(r.id) AS item_count FROM public.retail_items r GROUP BY r.tenant_id ORDER BY r.tenant_id"
  );
  console.log('\n[TENANTS] All tenant_ids with retail_items:');
  tenants.rows.forEach(t => console.log(`  tenant_id=${t.tenant_id}  items=${t.item_count}`));

  // 2. Microsite tenant map
  const microsites = await pool.query(
    "SELECT id, tenant_id, name FROM public.microsite_settings ORDER BY tenant_id LIMIT 10"
  ).catch(() => ({ rows: [] }));
  console.log('\n[MICROSITES] tenant_id → name mapping:');
  microsites.rows.forEach(m => console.log(`  ${m.tenant_id}  →  ${m.name || '(no name)'}`));

  // 3. Tawakkul tenant item with highest stock (to drop below threshold)
  const allTenants = tenants.rows.map(r => r.tenant_id);
  for (const tid of allTenants) {
    const sample = await pool.query(
      'SELECT id, name, stock_quantity, low_stock_threshold FROM public.retail_items WHERE tenant_id = $1 ORDER BY stock_quantity ASC LIMIT 3',
      [tid]
    );
    if (sample.rows.length > 0) {
      console.log(`\n[TENANT ${tid.slice(0,8)}] Sample items:`);
      sample.rows.forEach(r => console.log(`  ${r.name?.slice(0,40).padEnd(40)}  stock=${r.stock_quantity}  threshold=${r.low_stock_threshold}`));
    }
  }

  // 4. item_change_log summary by tenant
  const logSummary = await pool.query(
    "SELECT tenant_id, change_type, COUNT(*) AS cnt FROM public.price_change_log WHERE tenant_id != 'system' GROUP BY tenant_id, change_type ORDER BY tenant_id, change_type"
  );
  console.log('\n[ITEM_CHANGE_LOG] Summary by tenant + change_type:');
  logSummary.rows.forEach(r => console.log(`  tenant=${r.tenant_id?.slice(0,8)}  type=${r.change_type?.padEnd(12)}  count=${r.cnt}`));

  // 5. restaurants/microsites for name mapping
  const menuSites = await pool.query(
    "SELECT tenant_id, restaurant_name FROM public.menu_items GROUP BY tenant_id, restaurant_name LIMIT 10"
  ).catch(() => ({ rows: [] }));
  if (menuSites.rows.length > 0) {
    console.log('\n[MENU] Tenant → Restaurant:');
    menuSites.rows.forEach(r => console.log(`  ${r.tenant_id}  →  ${r.restaurant_name}`));
  }

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); pool.end(); process.exit(1); });
