import * as fs from 'fs/promises';
import * as path from 'path';
import { Pool, PoolClient } from 'pg';

// Simple tag function to enable raw sql`` template literals,
// compatible with the node-postgres client's `query(text, values)` method.
// It constructs the query string with `$1`, `$2`, etc. placeholders and an array of values.
const sql = (strings: TemplateStringsArray, ...values: any[]): [string, any[]] => {
  let query = '';
  const params: any[] = [];
  let paramIndex = 1;

  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) {
      query += `$${paramIndex++}`;
      params.push(values[i]);
    }
  });
  return [query, params];
};

async function runStagingMigrations() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set. Please provide a connection string.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    // It's good practice to add SSL configuration if connecting to a cloud database
    // like Cloud SQL from outside a trusted VPC, e.g.:
    // ssl: {
    //   rejectUnauthorized: false // Or true, with CA cert configured if needed
    // }
  });

  let client: PoolClient | null = null;

  try {
    client = await pool.connect();
    console.log('INFO: Connected to the database for migrations.');

    // 1. Create _migrations table if it doesn't exist
    const [createTableQuery] = sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename VARCHAR PRIMARY KEY,
        ran_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await client.query(createTableQuery);
    console.log('INFO: Ensured _migrations table exists.');

    // 2. Read existing migrations from the database
    const [selectRanQuery] = sql`SELECT filename FROM _migrations`;
    const result = await client.query(selectRanQuery);
    const ranMigrations = new Set<string>(result.rows.map(row => row.filename));
    console.log(`INFO: Found ${ranMigrations.size} previously run migrations.`);

    // 3. Read and sort migration files from the filesystem
    const migrationsDir = path.join(__dirname, '../../packages/database/migrations');
    let migrationFiles = await fs.readdir(migrationsDir);
    migrationFiles = migrationFiles
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sorts alphabetically, which is crucial for chronological migration execution (e.g., YYYYMMDDHHMMSS_name.sql)

    console.log(`INFO: Found ${migrationFiles.length} SQL migration files in ${migrationsDir}.`);

    // 4. Run migrations within a transaction
    await client.query('BEGIN'); // Start a transaction

    for (const file of migrationFiles) {
      if (ranMigrations.has(file)) {
        console.log(`SKIP: ${file} (already executed)`);
        continue;
      }

      console.log(`RUN: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = await fs.readFile(filePath, { encoding: 'utf8' });

      try {
        // Execute the SQL content of the migration file
        await client.query(sqlContent);
        // Record the successfully executed migration in the _migrations table
        const [insertMigrationQuery, insertMigrationParams] = sql`INSERT INTO _migrations (filename) VALUES (${file})`;
        await client.query(insertMigrationQuery, insertMigrationParams);
        console.log(`  SUCCESS: Executed and recorded: ${file}`);
      } catch (migrationError: any) {
        console.error(`ERROR: Failed to run migration ${file}:`, migrationError.message);
        await client.query('ROLLBACK'); // Rollback the entire transaction on error
        throw new Error(`Migration failed: ${file}. Cause: ${migrationError.message}`); // Re-throw to trigger outer catch and exit
      }
    }

    await client.query('COMMIT'); // Commit the transaction if all migrations succeeded
    console.log('INFO: All migrations processed successfully.');

  } catch (err: any) {
    console.error('FATAL: An unexpected error occurred during migrations:', err.message);
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.error('FATAL: Database transaction rolled back due to error.');
      } catch (rollbackErr: any) {
        console.error('FATAL: Error during transaction rollback:', rollbackErr.message);
      }
    }
    process.exit(1); // Exit with error code 1
  } finally {
    if (client) {
      client.release();
      console.log('INFO: Database client released.');
    }
    await pool.end(); // Close the database pool
    console.log('INFO: Database pool closed.');
  }
}

// Execute the migration runner script
runStagingMigrations();