import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; // This gives us the correct type for db

// Helper to execute SQL and log results/errors
async function executeAndLog<T>(
    db: NodePgDatabase<any>,
    query: ReturnType<typeof sql>,
    entityName: string,
    context: string,
): Promise<T[]> {
    try {
        console.log(`Executing upsert for ${entityName} - ${context}...`);
        const result = await db.execute(query);
        console.log(`Successfully upserted ${entityName} - ${context}. Result:`, JSON.stringify(result));
        return result as T[];
    } catch (error) {
        console.error(`Error upserting ${entityName} - ${context}:`, error);
        throw error; // Re-throw to stop the script
    }
}

async function seedHobTenant() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set. Please set the environment variable.');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: databaseUrl,
    });

    // This creates a NodePgDatabase instance directly from the pool,
    // mimicking the Drizzle-ORM setup that would typically be injected.
    // It's the best way to satisfy Rule 3 ("Use @Inject('DATABASE') private readonly db: NodePgDatabase<any>")
    // in a standalone script context while using raw `sql`` template literals.
    const db: NodePgDatabase<any> = {
        execute: async (query: ReturnType<typeof sql>) => {
            const client = await pool.connect();
            try {
                // Drizzle's `sql` template literal produces an object with `query` and `params`.
                // The `pg` client's `query` method can accept this directly.
                const result = await client.query(query.query, query.params);
                return result.rows;
            } finally {
                client.release();
            }
        },
        // For raw `sql`` literals, `execute` is generally the primary method used.
    } as NodePgDatabase<any>; // Cast to ensure type compatibility with a minimal implementation.

    console.log('Starting House of Biryani tenant seeding...');

    try {
        // Start a transaction for atomicity
        await db.execute(sql`BEGIN;`);
        console.log('Transaction started.');

        // 1. Upsert Tenant
        const tenantSlug = 'house-of-biryani';
        const tenantName = 'House of Biryani';
        const tenantPlan = 'professional'; // The plan slug

        const [tenantResult] = await executeAndLog<{ id: string }>(
            db,
            sql`
                INSERT INTO tenants (id, slug, name, plan, created_at, updated_at)
                VALUES (gen_random_uuid(), ${tenantSlug}, ${tenantName}, ${tenantPlan}, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    plan = EXCLUDED.plan,
                    updated_at = NOW()
                RETURNING id;
            `,
            'Tenant',
            `${tenantName} (${tenantSlug})`,
        );
        const tenantId = tenantResult.id;

        // 2. Upsert Tenant Configs
        const tenantConfigs = [
            { key: 'paan_price', value: '1.50' },
            { key: 'catering_lead_hours', value: '27' },
            { key: 'timezone', value: 'America/Chicago' },
            { key: 'currency', value: 'USD' },
        ];

        for (const config of tenantConfigs) {
            await executeAndLog(
                db,
                sql`
                    INSERT INTO tenant_configs (tenant_id, key, value, created_at, updated_at)
                    VALUES (${tenantId}, ${config.key}, ${config.value}, NOW(), NOW())
                    ON CONFLICT (tenant_id, key) DO UPDATE SET
                        value = EXCLUDED.value,
                        updated_at = NOW();
                `,
                'Tenant Config',
                `${config.key}=${config.value}`,
            );
        }

        // 3. Loyalty Program + Tiers
        const loyaltyProgramName = 'PaySurity Rewards';
        const loyaltyProgramDescription = 'Earn points with every purchase at House of Biryani!';

        const [loyaltyProgramResult] = await executeAndLog<{ id: string }>(
            db,
            sql`
                INSERT INTO loyalty_programs (id, tenant_id, name, description, is_active, created_at, updated_at)
                VALUES (gen_random_uuid(), ${tenantId}, ${loyaltyProgramName}, ${loyaltyProgramDescription}, TRUE, NOW(), NOW())
                ON CONFLICT (tenant_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    is_active = EXCLUDED.is_active,
                    updated_at = NOW()
                RETURNING id;
            `,
            'Loyalty Program',
            loyaltyProgramName,
        );
        const loyaltyProgramId = loyaltyProgramResult.id;

        const loyaltyTiers = [
            { name: 'Bronze', min_points: 0, description: 'Entry level rewards' },
            { name: 'Silver', min_points: 500, description: 'Exclusive silver member benefits' },
            { name: 'Gold', min_points: 2000, description: 'Premium gold member benefits' },
        ];

        for (const tier of loyaltyTiers) {
            await executeAndLog(
                db,
                sql`
                    INSERT INTO loyalty_tiers (id, loyalty_program_id, name, description, min_points, created_at, updated_at)
                    VALUES (gen_random_uuid(), ${loyaltyProgramId}, ${tier.name}, ${tier.description}, ${tier.min_points}, NOW(), NOW())
                    ON CONFLICT (loyalty_program_id, name) DO UPDATE SET
                        description = EXCLUDED.description,
                        min_points = EXCLUDED.min_points,
                        updated_at = NOW();
                `,
                'Loyalty Tier',
                tier.name,
            );
        }

        // 4. Menu Items (15 items)
        const menuItems = [
            // Biryanis (8 items)
            { name: 'Chicken Biryani (Regular)', description: 'Classic Hyderabadi chicken biryani', price: '12.99', category: 'Biryanis', is_available: true },
            { name: 'Chicken Biryani (Large)', description: 'Classic Hyderabadi chicken biryani, large portion', price: '18.99', category: 'Biryanis', is_available: true },
            { name: 'Goat Biryani (Regular)', description: 'Tender goat cooked with fragrant basmati rice', price: '14.99', category: 'Biryanis', is_available: true },
            { name: 'Goat Biryani (Large)', description: 'Tender goat cooked with fragrant basmati rice, large portion', price: '21.99', category: 'Biryanis', is_available: true },
            { name: 'Vegetable Biryani', description: 'Assorted seasonal vegetables with aromatic basmati rice', price: '11.99', category: 'Biryanis', is_available: true },
            { name: 'Paneer Biryani', description: 'Cubes of Indian cottage cheese cooked with basmati rice', price: '12.49', category: 'Biryanis', is_available: true },
            { name: 'Egg Biryani', description: 'Hard-boiled eggs cooked with spiced basmati rice', price: '10.99', category: 'Biryanis', is_available: true },
            { name: 'Shrimp Biryani', description: 'Succulent shrimp biryani', price: '15.99', category: 'Biryanis', is_available: true }, 

            // Paan Varieties ($1.50 each) (4 items)
            { name: 'Sweet Paan', description: 'Traditional sweet paan with gulkand, fennel, and nuts', price: '1.50', category: 'Paan', is_available: true },
            { name: 'Meetha Paan', description: 'Classic traditional meetha paan', price: '1.50', category: 'Paan', is_available: true },
            { name: 'Chocolate Paan', description: 'A modern twist with chocolate shavings', price: '1.50', category: 'Paan', is_available: true },
            { name: 'Fruit Paan', description: 'Refreshing paan with fresh fruit fillings', price: '1.50', category: 'Paan', is_available: true },

            // Catering Packages (3 items)
            { name: 'Small Catering Package', description: 'Serves 10-12 guests, includes 1 Biryani, 2 sides', price: '120.00', category: 'Catering', is_available: true },
            { name: 'Medium Catering Package', description: 'Serves 20-25 guests, includes 2 Biryanis, 3 sides', price: '220.00', category: 'Catering', is_available: true },
            { name: 'Large Catering Package', description: 'Serves 40-50 guests, includes 3 Biryanis, 4 sides', price: '400.00', category: 'Catering', is_available: true },
        ];

        for (const item of menuItems) {
            await executeAndLog(
                db,
                sql`
                    INSERT INTO menu_items (id, tenant_id, name, description, price, category, is_available, created_at, updated_at)
                    VALUES (gen_random_uuid(), ${tenantId}, ${item.name}, ${item.description}, ${item.price}, ${item.category}, ${item.is_available}, NOW(), NOW())
                    ON CONFLICT (tenant_id, name) DO UPDATE SET
                        description = EXCLUDED.description,
                        price = EXCLUDED.price,
                        category = EXCLUDED.category,
                        is_available = EXCLUDED.is_available,
                        updated_at = NOW();
                `,
                'Menu Item',
                item.name,
            );
        }

        // 5. Subscription Plan Links (3 links to 'professional')
        // First, retrieve the ID of the 'professional' plan.
        const [professionalPlan] = await executeAndLog<{ id: string }>(
            db,
            sql`SELECT id FROM plans WHERE slug = ${tenantPlan};`,
            'Plan Lookup',
            `Finding ID for plan: ${tenantPlan}`,
        );

        if (!professionalPlan) {
            throw new Error(`Critical error: Plan with slug '${tenantPlan}' not found in the 'plans' table. Please seed the 'plans' table first.`);
        }
        const professionalPlanId = professionalPlan.id;

        // Create 3 distinct links. This assumes `tenant_subscription_plans` has a `name` column
        // and a unique constraint on `(tenant_id, name)` to facilitate upserting distinct links.
        // If the table structure doesn't support this (e.g., unique on tenant_id, plan_id),
        // this will only create/update one entry regardless of the loop.
        for (let i = 1; i <= 3; i++) {
            const linkName = `Professional Tier Link ${i}`;
            await executeAndLog(
                db,
                sql`
                    INSERT INTO tenant_subscription_plans (id, tenant_id, plan_id, name, is_active, created_at, updated_at)
                    VALUES (gen_random_uuid(), ${tenantId}, ${professionalPlanId}, ${linkName}, TRUE, NOW(), NOW())
                    ON CONFLICT (tenant_id, name) DO UPDATE SET
                        plan_id = EXCLUDED.plan_id,
                        is_active = EXCLUDED.is_active,
                        updated_at = NOW();
                `,
                'Subscription Plan Link',
                linkName,
            );
        }

        // Commit the transaction
        await db.execute(sql`COMMIT;`);
        console.log('Transaction committed successfully. House of Biryani tenant seeded.');
    } catch (error) {
        console.error('An error occurred during seeding. Rolling back transaction.');
        await db.execute(sql`ROLLBACK;`);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

// Execute the seeding function
seedHobTenant().catch((error) => {
    console.error('Unhandled error during seed execution:', error);
    process.exit(1);
});