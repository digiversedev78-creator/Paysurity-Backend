import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { OrdersService } from './src/modules/checkout/orders.service';
import { AdminMerchantApplicationsService } from './src/modules/admin-portal/admin-merchant-applications.service';
import * as schema from './src/_paysurity-database';

async function verify() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev';
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  const ordersService = new OrdersService(db as any);
  const adminAppsService = new AdminMerchantApplicationsService(db as any);

  try {
    console.log('--- 1. Ledger Verification (OrdersService RLS Isolation) ---');
    const res = await pool.query(`
      SELECT id, tenant_id, total_cents FROM orders LIMIT 1;
    `);
    
    if (res.rows.length === 0) {
      console.log('⚠️ No existing orders found to test. Skipping ledger test.');
    } else {
      const newOrderId = res.rows[0].id;
      const totalCents = res.rows[0].total_cents;
      const actualTenantId = res.rows[0].tenant_id;

      console.log('✅ Found existing order in DB:');
      console.log(`Order ID: ${newOrderId}, Tenant ID: ${actualTenantId}, Total Cents: ${totalCents}`);

      // Verify fetching it enforces tenant_id using the OrdersService Drizzle abstraction
      const fetchedOrder = await ordersService.findOne(newOrderId, actualTenantId);
      console.log('\n✅ Mock Order Fetched via OrdersService enforcing tenant_id:');
      console.log(JSON.stringify(fetchedOrder, null, 2));

      // Try fetching with wrong tenant
      try {
        await ordersService.findOne(newOrderId, '22222222-2222-2222-2222-222222222222');
        console.error('❌ FAIL: Order was fetched without correct tenant_id isolation.');
      } catch (err) {
        console.log('\n✅ Isolation Proof Success: Attempted to fetch order with wrong tenantId -> Rejected:', err.message);
      }
    }

    console.log('\n--- 2. Admin Portal Polish (Merchant Applications) ---');
    // Fetch apps
    const apps = await adminAppsService.getApplications(5, 0);
    console.log('✅ Merchant Applications table fetch successful via Admin App Service. Found records:', apps.length);

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await pool.end();
  }
}

verify();
