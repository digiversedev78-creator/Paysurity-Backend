// scripts/run_migration.ts
/**
 * Safe migration runner for PaySurity.
 * Checks Docker container health, runs the migration, and rolls back on failure.
 */
import { execSync, exec } from 'child_process';
import * as util from 'util';
const execPromise = util.promisify(exec);

async function isDbHealthy(): Promise<boolean> {
  try {
    // Assumes docker-compose service name is "db" or "postgres"
    const { stdout } = await execPromise('docker ps --filter "name=paysurity-db" --format "{{.Names}}"');
    if (!stdout.trim()) return false;
    // Run healthcheck command inside container
    const { stdout: health } = await execPromise('docker exec paysurity-db pg_isready -U postgres');
    return health.includes('accepting connections');
  } catch (e) {
    return false;
  }
}

async function runMigration() {
  console.log('🔧 Starting secure migration...');
  const healthy = await isDbHealthy();
  if (!healthy) {
    console.error('❌ Database container not healthy. Aborting migration.');
    process.exit(1);
  }
  try {
    execSync('pnpm run db:migrate', { stdio: 'inherit' });
    console.log('✅ Migration completed successfully.');
  } catch (err) {
    console.error('⚠️ Migration failed. Initiating rollback...');
    try {
      execSync('pnpm run db:rollback', { stdio: 'inherit' });
      console.log('🔁 Rollback completed.');
    } catch (rollbackErr) {
      console.error('🚨 Rollback also failed. Manual intervention required.', rollbackErr);
    }
    process.exit(1);
  }
}

runMigration();
