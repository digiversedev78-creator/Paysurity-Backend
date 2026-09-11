const { DataSource } = require('typeorm');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

async function run() {
    const csvPath = path.join(__dirname, '../HouseOfBiryani/category-item-77.csv');
    const records = csv.parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
    const canonicalNames = records.map(r => r.Item);

    console.log(`Purge: Initializing cleanup for House of Biryani.`);

    const AppDataSource = process.env.DATABASE_URL ? 
        new DataSource({ type: 'postgres', url: process.env.DATABASE_URL }) :
        new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: 5432,
            username: 'paysurity',
            password: 'PaysurityStagingConfig2026!',
            database: 'paysurity_dev',
        });

    try {
        await AppDataSource.initialize();
        const tenantId = '0f33e7e1-5474-4738-8de8-c687009f5e09';

        // Find items that are NOT in the canonical list
        const dbItems = await AppDataSource.query(`SELECT id, name FROM microsite_menu_items WHERE tenant_id = $1`, [tenantId]);
        const toDelete = dbItems.filter(i => !canonicalNames.includes(i.name));

        console.log(`Found ${toDelete.length} redundant items to purge.`);

        if (toDelete.length > 0) {
            for (const item of toDelete) {
                console.log(`Deleting: ${item.name} (${item.id})`);
                await AppDataSource.query(`DELETE FROM microsite_menu_items WHERE id = $1`, [item.id]);
            }
            console.log('Purge successful.');
        } else {
            console.log('No redundant items found.');
        }

    } catch (err) {
        console.error('Purge Failed:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
