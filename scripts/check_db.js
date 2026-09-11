const postgres = require('postgres');
const sql = postgres('postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev');

async function run() {
  try {
    const tenants = await sql`SELECT id, slug FROM tenants`;
    console.log('Real Tenant IDs:', JSON.stringify(tenants, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
run();
