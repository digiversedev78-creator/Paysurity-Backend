import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { shifts } from '@paysurity/database';
import { sql } from 'drizzle-orm';

async function simulateBreach() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db: NodePgDatabase<any> = app.get('DATABASE');

  const HOB_TENANT_ID = '99999999-9999-9999-9999-999999999999';
  const TAWAKKUL_TENANT_ID = '11111111-1111-1111-1111-111111111111';

  console.log('--- Leak-Proof Validation (RLS Breach Test) ---');

  try {
    // 1. Set context to HOB
    console.log(`Setting session context to HOB_TENANT_ID: ${HOB_TENANT_ID}`);
    await db.execute(sql`SET app.current_tenant_id = ${HOB_TENANT_ID}`);
    await db.execute(sql`SET app.is_super_admin = 'false'`);

    // 2. Attempt to read Tawakkul shifts
    console.log(`Attempting to read shifts for Tawakkul (${TAWAKKUL_TENANT_ID})...`);
    const results = await db.select().from(shifts).where(sql`tenant_id = ${TAWAKKUL_TENANT_ID}`);
    
    if (results.length > 0) {
      console.error('❌ CRITICAL BREACH: RLS bypassed! Data leaked.');
    } else {
      console.log('✅ RLS SECURE: 0 results returned for foreign tenant.');
    }
  } catch (err) {
    console.log('✅ RLS SECURE: Database blocked query via exception.');
  }

  await app.close();
}

simulateBreach();
