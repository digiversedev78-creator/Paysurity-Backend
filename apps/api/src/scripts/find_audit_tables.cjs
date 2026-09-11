const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev' });
p.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%audit%' ORDER BY table_name"
).then(r => {
  console.log('Audit-related tables:', r.rows.map(x => x.table_name));
  p.end();
}).catch(e => { console.error(e.message); p.end(); });
