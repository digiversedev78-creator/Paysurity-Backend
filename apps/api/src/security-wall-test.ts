import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { orders } from '@paysurity/database';
import { sql } from 'drizzle-orm';

async function securityWallTest() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db: NodePgDatabase<any> = app.get('DATABASE');

  const HOB_TENANT_ID = '99999999-9999-9999-9999-999999999999';
  const MAIN_STREET_LOC = 'loc_main_001';
  const EXPRESS_LOC = 'loc_express_002';

  console.log('--- Multi-Unit Security (The Wall Test) ---');

  try {
    // 1. Simulate HOB Express Branch Manager login
    console.log(`Setting session context to HOB Express (${EXPRESS_LOC})`);
    await db.execute(sql`SET app.current_tenant_id = ${HOB_TENANT_ID}`);
    await db.execute(sql`SET app.current_location_id = ${EXPRESS_LOC}`);
    await db.execute(sql`SET app.is_super_admin = 'false'`);

    // 2. Attempt to breach Main Street revenue
    console.log(`Attempting to read orders for HOB Main Street (${MAIN_STREET_LOC})...`);
    const breachAttempt = await db.select().from(orders).where(sql`location_id = ${MAIN_STREET_LOC}`);
    
    if (breachAttempt.length > 0) {
      console.error('❌ CRITICAL SECURITY BREACH: Branch Manager accessed cross-location data!');
    } else {
      console.log('✅ THE WALL HOLDS: 0 results returned for unauthorized location.');
    }

    // 3. Verify own location access
    console.log(`Verifying access to own location (${EXPRESS_LOC})...`);
    const ownData = await db.select().from(orders).where(sql`location_id = ${EXPRESS_LOC}`);
    console.log(`✅ Access confirmed: ${ownData.length} records found for authorized location.`);

  } catch (err) {
    console.error('❌ Test Failed with error:', err.message);
  }

  await app.close();
}

securityWallTest();
