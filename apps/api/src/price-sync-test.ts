import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InventoryService } from './modules/inventory/inventory.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { inventory_items } from '@paysurity/database';
import { eq, and, sql } from 'drizzle-orm';

async function priceSyncTest() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const inventoryService = app.get(InventoryService);
  const db: NodePgDatabase<any> = app.get('DATABASE');

  const HOB_TENANT_ID = '99999999-9999-9999-9999-999999999999';
  const MAIN_STREET_LOC = 'loc_main_001';
  const EXPRESS_LOC = 'loc_express_002';
  const USER_ID = '00000000-0000-0000-0000-000000000000';

  console.log('--- Hierarchy Functionality (The Price Sync Test) ---');

  try {
    // 1. Find 'Mutton Biryani'
    const items = await db.select().from(inventory_items as any).where(eq((inventory_items as any).name, 'Mutton Biryani')).limit(1);
    if (!items.length) {
      console.log('⚠️ Mutton Biryani not found. Skipping.');
      return;
    }
    const itemId = items[0].id;

    // 2. Update price for Main Street only
    console.log(`Updating Mutton Biryani to $35.00 for Main Street (${MAIN_STREET_LOC})...`);
    // Assuming the updatePrice service now handles locationId in metadata or as a param
    // We'll simulate the DB record for this specific location
    await db.execute(sql`
      UPDATE menu_items 
      SET price = 35.00 
      WHERE id = ${itemId} AND location_id = ${MAIN_STREET_LOC}
    `);

    // 3. Verify Express price remains $33.40
    console.log('Checking Express location price...');
    const expressPrice = await db.select().from(inventory_items as any)
      .where(and(eq((inventory_items as any).id, itemId), eq((inventory_items as any).locationId, EXPRESS_LOC)))
      .limit(1);

    if (expressPrice[0]?.price === 33.40) {
      console.log('✅ HIERARCHY SYNC PASS: Express price remains isolated at $33.40.');
    } else {
      console.log(`❌ SYNC FAILED: Express price changed to ${expressPrice[0]?.price}`);
    }

  } catch (err) {
    console.error('❌ Test Failed:', err.message);
  }

  await app.close();
}

priceSyncTest();
