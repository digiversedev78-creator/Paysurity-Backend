const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });
async function r() {
  const a = await pool.query('SELECT DISTINCT tenant_id FROM public.retail_items ORDER BY tenant_id');
  const b = await pool.query("SELECT id, name, stock_quantity, low_stock_threshold FROM public.retail_items WHERE tenant_id='dddddddd-dddd-dddd-dddd-dddddddddddd' ORDER BY stock_quantity ASC LIMIT 5");
  const c = await pool.query('SELECT DISTINCT tenant_id FROM public.price_change_log ORDER BY tenant_id');
  const d = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename LIMIT 30");
  const f = await pool.query("SELECT DISTINCT tenant_id, category FROM public.retail_items WHERE tenant_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' ORDER BY category LIMIT 10");
  console.log('RETAIL_TENANTS:', JSON.stringify(a.rows));
  console.log('TOBACCO_LOWEST_STOCK:', JSON.stringify(b.rows));
  console.log('LOG_TENANTS:', JSON.stringify(c.rows));
  console.log('TABLES:', JSON.stringify(d.rows.map(r=>r.tablename)));
  console.log('BBBB_CATEGORIES:', JSON.stringify(f.rows));
  pool.end();
}
r().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
