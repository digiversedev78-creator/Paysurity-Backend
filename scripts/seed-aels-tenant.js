import { Client } from 'pg';
import { drizzle, PgDatabase } from 'drizzle-orm/pg';
import { sql } from 'drizzle-orm';

/**
 * Seeds the American Eagle Logistics Service tenant and associated demo data for staging.
 *
 * This script connects to a PostgreSQL database using the DATABASE_URL environment variable.
 * It inserts:
 * - A new tenant record.
 * - Tenant payment configuration, setting 'payfactor' as the preferred processor.
 * - PayFactor-specific configuration details.
 * - Five demo driver records with unique CDL numbers.
 * - Three demo PayFactor applications (one approved, one pending, one funded) linked to a driver.
 */
async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('ERROR: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const pgClient = new Client({ connectionString });
    await pgClient.connect();
    // Use PgDatabase from drizzle-orm/pg to align with the type expectation,
    // assuming it represents NodePgDatabase in this context for standalone scripts.
    const db: PgDatabase<any> = drizzle(pgClient);

    try {
        console.log('--- Starting American Eagle Logistics Service tenant seeding ---');

        // Tenant Configuration
        const tenantSlug = 'american-eagle-logistics';
        const tenantName = 'American Eagle Logistics Service';
        const tenantPlan = 'enterprise';

        // 1. Generate a new tenant ID
        const [tenantIdResult] = await db.execute(sql`SELECT gen_random_uuid() as id`);
        const tenantId = (tenantIdResult as { id: string }[])[0].id;
        console.log(`Generated Tenant ID: ${tenantId}`);

        // 2. Insert or update the tenant record
        await db.execute(sql`
            INSERT INTO tenants (id, slug, name, plan, created_at, updated_at)
            VALUES (${tenantId}, ${tenantSlug}, ${tenantName}, ${tenantPlan}, now(), now())
            ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                plan = EXCLUDED.plan,
                updated_at = now()
            RETURNING id
        `);
        console.log(`Tenant '${tenantName}' (${tenantSlug}) seeded.`);

        // 3. Insert or update tenant payment configurations
        const preferredProcessor = 'payfactor';
        await db.execute(sql`
            INSERT INTO tenant_payment_configs (tenant_id, preferred_processor, created_at, updated_at)
            VALUES (${tenantId}, ${preferredProcessor}, now(), now())
            ON CONFLICT (tenant_id) DO UPDATE SET
                preferred_processor = EXCLUDED.preferred_processor,
                updated_at = now()
        `);
        console.log(`Tenant payment config set to preferred processor: '${preferredProcessor}'.`);

        // 4. Insert or update PayFactor specific configuration
        const advanceRate = 0.25;
        const feeRate = 0.035;
        const escrowDays = 14;
        await db.execute(sql`
            INSERT INTO payfactor_configs (tenant_id, advance_rate, fee_rate, escrow_days, created_at, updated_at)
            VALUES (${tenantId}, ${advanceRate}, ${feeRate}, ${escrowDays}, now(), now())
            ON CONFLICT (tenant_id) DO UPDATE SET
                advance_rate = EXCLUDED.advance_rate,
                fee_rate = EXCLUDED.fee_rate,
                escrow_days = EXCLUDED.escrow_days,
                updated_at = now()
        `);
        console.log(`PayFactor config seeded: advance_rate=${advanceRate}, fee_rate=${feeRate}, escrow_days=${escrowDays}.`);

        // 5. Insert 5 demo driver records
        const demoDrivers = [
            { name: 'John Doe', cdl_number: 'AELS-JD-001' },
            { name: 'Jane Smith', cdl_number: 'AELS-JS-002' },
            { name: 'Robert Johnson', cdl_number: 'AELS-RJ-003' },
            { name: 'Emily Davis', cdl_number: 'AELS-ED-004' },
            { name: 'Michael Brown', cdl_number: 'AELS-MB-005' },
        ];
        const driverIds: string[] = [];

        for (const driverData of demoDrivers) {
            const [driverIdResult] = await db.execute(sql`SELECT gen_random_uuid() as id`);
            const driverId = (driverIdResult as { id: string }[])[0].id;
            driverIds.push(driverId);

            await db.execute(sql`
                INSERT INTO drivers (id, tenant_id, name, cdl_number, created_at, updated_at)
                VALUES (${driverId}, ${tenantId}, ${driverData.name}, ${driverData.cdl_number}, now(), now())
                ON CONFLICT (tenant_id, cdl_number) DO UPDATE SET
                    name = EXCLUDED.name,
                    updated_at = now()
                RETURNING id
            `);
            console.log(`Demo driver '${driverData.name}' (${driverData.cdl_number}) seeded with ID: ${driverId}.`);
        }

        // 6. Insert 3 demo PayFactor applications
        if (driverIds.length === 0) {
            console.warn('No drivers were seeded, skipping PayFactor application seeding.');
        } else {
            const driverForApps = driverIds[0]; // Link applications to the first demo driver

            const applicationData = [
                { status: 'pending', application_offset_days: 30, approved_offset_days: null, funded_offset_days: null },
                { status: 'approved', application_offset_days: 20, approved_offset_days: 10, funded_offset_days: null },
                { status: 'funded', application_offset_days: 15, approved_offset_days: 7, funded_offset_days: 3 },
            ];

            for (const app of applicationData) {
                const [appIdResult] = await db.execute(sql`SELECT gen_random_uuid() as id`);
                const applicationId = (appIdResult as { id: string }[])[0].id;

                const applicationDate = sql`now() - INTERVAL '${app.application_offset_days} days'`;
                const approvedDate = app.approved_offset_days ? sql`now() - INTERVAL '${app.approved_offset_days} days'` : null;
                const fundedDate = app.funded_offset_days ? sql`now() - INTERVAL '${app.funded_offset_days} days'` : null;

                await db.execute(sql`
                    INSERT INTO payfactor_applications (id, tenant_id, driver_id, status, application_date, approved_date, funded_date, created_at, updated_at)
                    VALUES (
                        ${applicationId},
                        ${tenantId},
                        ${driverForApps},
                        ${app.status},
                        ${applicationDate},
                        ${approvedDate},
                        ${fundedDate},
                        now(),
                        now()
                    )
                `);
                console.log(`PayFactor application '${applicationId}' for driver '${driverForApps}' (status: ${app.status}) seeded.`);
            }
        }

        console.log('--- American Eagle Logistics Service tenant seeding completed successfully! ---');

    } catch (error) {
        console.error('ERROR: An error occurred during seeding:', error);
        process.exit(1);
    } finally {
        await pgClient.end();
    }
}

// Execute the main seeding function
main();