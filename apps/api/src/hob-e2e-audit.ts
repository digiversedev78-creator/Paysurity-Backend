import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InventoryService } from './modules/inventory/inventory.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { inventory_items } from '@paysurity/database';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function runE2E() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const inventoryService = app.get(InventoryService);
  const db: NodePgDatabase<any> = app.get('DATABASE');

  const HOB_TENANT_ID = '99999999-9999-9999-9999-999999999999'; // Placeholder
  const USER_ID = '00000000-0000-0000-0000-000000000000';

  console.log('--- HOB Management E2E Audit ---');

  // 1. Update HOB Mutton Biryani to $34.99
  try {
    // Find item first
    const items = await db.select().from(inventory_items as any).where(eq((inventory_items as any).name, 'Mutton Biryani')).limit(1);
    if (items.length) {
      const itemId = items[0].id;
      console.log(`Updating Mutton Biryani (${itemId}) to $34.99...`);
      await inventoryService.updatePrice(HOB_TENANT_ID, USER_ID, itemId, 34.99, 'RESTAURANT');
      console.log('✅ Price Update Success.');
    } else {
      console.log('⚠️ Mutton Biryani not found in DB.');
    }
  } catch (err) {
    console.error('❌ Price Update Failed:', err.message);
  }

  // 2. Toggle Tawakkul Lamb Chops to Inactive
  try {
    const items = await db.select().from(inventory_items as any).where(eq((inventory_items as any).name, 'Lamb Chops')).limit(1);
    if (items.length) {
      const itemId = items[0].id;
      console.log(`86ing Lamb Chops (${itemId})...`);
      await inventoryService.toggleActive(HOB_TENANT_ID, USER_ID, itemId, false, 'RESTAURANT');
      console.log('✅ 86 Status Toggle Success.');
    } else {
      console.log('⚠️ Lamb Chops not found in DB.');
    }
  } catch (err) {
    console.error('❌ Status Toggle Failed:', err.message);
  }

  // 3. Verify Manifest Update (Simulated check)
  const manifestPath = path.join(process.cwd(), 'manifest.json');
  if (fs.existsSync(manifestPath)) {
     console.log('✅ manifest.json exists for audit.');
  }

  await app.close();
}

runE2E();
