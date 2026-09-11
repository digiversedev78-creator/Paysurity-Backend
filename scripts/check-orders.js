const { Client } = require('pg');

async function check() {
  const client = new Client({
    connectionString: 'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev',
  });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%merchant%';");
  console.log(res.rows);
  await client.end();
}
check();
