const { DataSource } = require('typeorm');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

async function run() {
    const csvPath = path.join(__dirname, '../HouseOfBiryani/category-item-77.csv');
    const records = csv.parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });

    console.log(`Diagnostic: Starting Audit for House of Biryani (${records.length} records in CSV)`);

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

        // 1. Fetch DB records
        const dbItems = await AppDataSource.query(`SELECT * FROM microsite_menu_items WHERE tenant_id = $1`, [tenantId]);
        console.log(`DB Status: Found ${dbItems.length} items in production.`);

        const report = {
            totalCsv: records.length,
            totalDb: dbItems.length,
            missingInDb: [],
            priceMismatches: [],
            imageCoverage: 0,
            imageUrls: []
        };

        for (const record of records) {
            const dbMatch = dbItems.find(i => i.name === record.Item);
            if (!dbMatch) {
                report.missingInDb.push(record.Item);
                continue;
            }

            const csvPrice = parseFloat(record.Price.replace('+', '').trim());
            if (Math.abs(dbMatch.base_price - csvPrice) > 0.01) {
                report.priceMismatches.push({ item: record.Item, csv: csvPrice, db: dbMatch.base_price });
            }

            if (dbMatch.image_url) {
                report.imageCoverage++;
                report.imageUrls.push(dbMatch.image_url);
            }
        }

        console.log('\n--- DATA FIDELITY REPORT ---');
        console.log(`Sync Status: ${dbItems.length}/${records.length} items present.`);
        console.log(`Price Parity: ${records.length - report.priceMismatches.length}/${records.length} match CSV.`);
        console.log(`Image Coverage: ${report.imageCoverage}/${records.length} items have images.`);
        
        if (report.missingInDb.length > 0) {
            console.log('Missing Items:', report.missingInDb);
        }
        if (report.priceMismatches.length > 0) {
            console.log('Price Mismatches:', report.priceMismatches);
        }

        fs.writeFileSync('HouseOfBiryani/fidelity_report.json', JSON.stringify(report, null, 2));
    } catch (err) {
        console.error('Audit Failed:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
