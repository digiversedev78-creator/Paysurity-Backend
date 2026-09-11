const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const sql = postgres('postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev');

async function run() {
  try {
    const tenantRow = await sql`SELECT id FROM tenants WHERE slug = 'houseofbiryanirestaurant' LIMIT 1`;
    if (tenantRow.length === 0) throw new Error('Tenant not found');
    const tenantId = tenantRow[0].id;
    console.log(`Found tenant UUID: ${tenantId}`);

    const merchantRow = await sql`SELECT id FROM merchants WHERE tenant_id = ${tenantId} LIMIT 1`;
    if (merchantRow.length === 0) throw new Error('Merchant not found');
    const merchantId = merchantRow[0].id;
    console.log(`Found merchant UUID: ${merchantId}`);

    const filePath = path.join(__dirname, 'seed-hob-menu.sql');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the slug with the UUID
    content = content.replace(/'houseofbiryanirestaurant'/g, `'${tenantId}'`);
    // Replace merchant placeholder
    content = content.replace(/'MERCHANT_ID_PLACEHOLDER'/g, `'${merchantId}'`);
    
    console.log('Executing full SQL script...');
    await sql.unsafe(content);
    console.log('Seed applied successfully!');
    
    const row = await sql`SELECT name, display_price FROM microsite_menu_items WHERE name = 'Mutton Biryani' AND tenant_id = ${tenantId}`;
    console.log('Verification:', JSON.stringify(row, null, 2));
    
  } catch(e) {
    console.error('Failed to apply seed:', e);
  } finally {
    await sql.end();
  }
}

run();
