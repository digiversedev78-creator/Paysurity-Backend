/**
 * PaySurity Migration Runner
 * Applies a specific SQL migration file to Cloud SQL via TCP connection.
 *
 * Usage: MIGRATION_FILE=path/to/file.sql DATABASE_URL=postgres://... node run-migration.js
 * Or:    MIGRATION_DIR=path/to/dir DATABASE_URL=... node run-migration.js  (applies all *.sql in order)
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const rawUrl = (process.env.DATABASE_URL || '').trim();
  if (!rawUrl) {
    console.error('ERROR: DATABASE_URL env var is required');
    process.exit(1);
  }

  // Parse Cloud SQL socket URL or direct TCP URL
  let clientConfig;
  const socketMatch = rawUrl.match(/postgresql:\/\/([^:]+):([^@]+)@\/([^?]+)\?host=(.+)/);
  if (socketMatch) {
    clientConfig = {
      user: socketMatch[1],
      password: socketMatch[2],
      database: socketMatch[3],
      host: socketMatch[4].trim(),
      ssl: false
    };
  } else {
    clientConfig = { connectionString: rawUrl, ssl: { rejectUnauthorized: false } };
  }

  const client = new Client(clientConfig);
  await client.connect();
  console.log('✅ Connected to database');

  try {
    const migrationFile = process.env.MIGRATION_FILE;
    const migrationDir = process.env.MIGRATION_DIR;

    let filesToRun = [];

    if (migrationFile) {
      filesToRun = [migrationFile];
    } else if (migrationDir) {
      const files = fs.readdirSync(migrationDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Alphabetical/numeric order
      filesToRun = files.map(f => path.join(migrationDir, f));
    } else {
      console.error('ERROR: Set MIGRATION_FILE or MIGRATION_DIR env var');
      process.exit(1);
    }

    console.log(`\nRunning ${filesToRun.length} migration(s)...\n`);

    for (const file of filesToRun) {
      const sql = fs.readFileSync(file, 'utf8');
      console.log(`▶ ${path.basename(file)}...`);
      try {
        await client.query(sql);
        console.log(`  ✅ Done`);
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log(`  ⚠️  Already exists (skipped): ${e.message.substring(0, 80)}`);
        } else {
          console.error(`  ❌ FAILED: ${e.message}`);
          throw e;
        }
      }
    }

    console.log('\n✅ All migrations complete!');

  } catch (e) {
    console.error('MIGRATION ERROR:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
