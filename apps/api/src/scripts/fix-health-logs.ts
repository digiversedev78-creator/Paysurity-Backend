import postgres from 'postgres';

const DB_URL = process.env.DATABASE_URL || 'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev';
const sql = postgres(DB_URL, { max: 1 });

async function fix() {
  console.log('🛠️ Correcting system_health_logs table...');

  try {
    await sql`DROP TABLE IF EXISTS public.system_health_logs;`;
    await sql`
      CREATE TABLE public.system_health_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        component VARCHAR(100) NOT NULL,
        ping_latency_ms INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        checked_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ system_health_logs table corrected!');
  } catch (err) {
    console.error('❌ Fix failed:', err);
  } finally {
    await sql.end();
  }
}

fix();
