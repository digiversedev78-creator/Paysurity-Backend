import { Pool, PoolClient } from 'pg';

/**
 * A minimal `sql` tag function to allow for raw SQL template literals.
 * In a full application with Drizzle, this would typically come from `@nestjs-drizzle/core`
 * or `drizzle-orm/pg-core`. For a standalone script without those imports,
 * this function simply concatenates the query parts into a single string.
 * It assumes no parameterized values are passed directly into the template for these specific
 * verification queries, as they are simple `SELECT count(*)` statements.
 */
const sql = (strings: TemplateStringsArray, ...values: any[]): string => {
    let query = '';
    for (let i = 0; i < strings.length; i++) {
        query += strings[i];
        if (i < values.length) {
            // For simple count queries, we don't expect dynamic values
            // that need parameterization. If there were, a proper
            // SQL tag would handle placeholders (e.g., $1, $2) and return
            // an object compatible with pg.query(text, values).
            // For this task, direct string concatenation is sufficient.
            query += values[i];
        }
    }
    return query;
};

/**
 * Performs staging database verification checks for PaySurity.
 * This script connects directly to PostgreSQL using the 'pg' module.
 * It expects the database connection string to be available via the
 * DATABASE_URL environment variable.
 *
 * Checks performed (all non-destructive, read-only):
 * 1. SELECT count(*) FROM tenants → must be >= 3
 * 2. SELECT count(*) FROM subscription_plans → must be >= 3
 * 3. SELECT count(*) FROM employees WHERE tenant_id IS NOT NULL → > 0
 * 4. SELECT count(*) FROM orders → any count (checks table existence and queryability)
 * 5. SELECT count(*) FROM wallet_transactions → any count (checks table existence and queryability)
 *
 * Prints PASS/FAIL for each check and provides an overall exit code (0 for success, 1 for failure).
 */
async function verifyStaging(): Promise<void> {
    let overallSuccess = true;
    let client: PoolClient | undefined;

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('FAIL: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: databaseUrl,
        // Recommended for production environments to prevent client exhaustion
        // For a script, a small max is fine or default is often 10.
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    console.log('Starting PaySurity staging verification checks...');

    try {
        client = await pool.connect();
        console.log('Database connection established successfully.');

        // Check 1: Tenant count
        let check1Pass = false;
        try {
            const result = await client.query<{ count: string }>(sql`SELECT count(*) FROM tenants`);
            const count = parseInt(result.rows[0].count, 10);
            check1Pass = count >= 3;
            console.log(`Check 1 (tenants >= 3): ${check1Pass ? 'PASS' : 'FAIL'} (Count: ${count})`);
        } catch (error: any) {
            console.error(`Error during Check 1 (tenants): ${error.message}`);
            console.log('Check 1 (tenants >= 3): FAIL (Error)');
            check1Pass = false;
        }
        overallSuccess = overallSuccess && check1Pass;

        // Check 2: Subscription plans count
        let check2Pass = false;
        try {
            const result = await client.query<{ count: string }>(sql`SELECT count(*) FROM subscription_plans`);
            const count = parseInt(result.rows[0].count, 10);
            check2Pass = count >= 3;
            console.log(`Check 2 (subscription_plans >= 3): ${check2Pass ? 'PASS' : 'FAIL'} (Count: ${count})`);
        } catch (error: any) {
            console.error(`Error during Check 2 (subscription_plans): ${error.message}`);
            console.log('Check 2 (subscription_plans >= 3): FAIL (Error)');
            check2Pass = false;
        }
        overallSuccess = overallSuccess && check2Pass;

        // Check 3: Employees with tenant_id
        let check3Pass = false;
        try {
            const result = await client.query<{ count: string }>(sql`SELECT count(*) FROM employees WHERE tenant_id IS NOT NULL`);
            const count = parseInt(result.rows[0].count, 10);
            check3Pass = count > 0;
            console.log(`Check 3 (employees with tenant_id > 0): ${check3Pass ? 'PASS' : 'FAIL'} (Count: ${count})`);
        } catch (error: any) {
            console.error(`Error during Check 3 (employees with tenant_id): ${error.message}`);
            console.log('Check 3 (employees with tenant_id > 0): FAIL (Error)');
            check3Pass = false;
        }
        overallSuccess = overallSuccess && check3Pass;

        // Check 4: Orders table existence/queryability
        let check4Pass = false;
        try {
            const result = await client.query<{ count: string }>(sql`SELECT count(*) FROM orders`);
            const count = parseInt(result.rows[0].count, 10); // Query succeeded, table exists
            check4Pass = true;
            console.log(`Check 4 (orders table exists): ${check4Pass ? 'PASS' : 'FAIL'} (Count: ${count})`);
        } catch (error: any) {
            console.error(`Error during Check 4 (orders): ${error.message}`);
            console.log('Check 4 (orders table exists): FAIL (Error)');
            check4Pass = false;
        }
        overallSuccess = overallSuccess && check4Pass;

        // Check 5: Wallet transactions table existence/queryability
        let check5Pass = false;
        try {
            const result = await client.query<{ count: string }>(sql`SELECT count(*) FROM wallet_transactions`);
            const count = parseInt(result.rows[0].count, 10); // Query succeeded, table exists
            check5Pass = true;
            console.log(`Check 5 (wallet_transactions table exists): ${check5Pass ? 'PASS' : 'FAIL'} (Count: ${count})`);
        } catch (error: any) {
            console.error(`Error during Check 5 (wallet_transactions): ${error.message}`);
            console.log('Check 5 (wallet_transactions table exists): FAIL (Error)');
            check5Pass = false;
        }
        overallSuccess = overallSuccess && check5Pass;

    } catch (dbError: any) {
        console.error('FAIL: Could not connect to the database or a critical error occurred:', dbError.message);
        overallSuccess = false;
    } finally {
        if (client) {
            client.release();
            console.log('Database client released.');
        }
        // Ensure the pool is ended to prevent the script from hanging
        await pool.end();
        console.log('Database pool closed.');
    }

    if (overallSuccess) {
        console.log('\nOVERALL: PASS - All staging verification checks passed successfully.');
        process.exit(0);
    } else {
        console.error('\nOVERALL: FAIL - One or more staging verification checks failed.');
        process.exit(1);
    }
}

// Execute the verification process
verifyStaging();