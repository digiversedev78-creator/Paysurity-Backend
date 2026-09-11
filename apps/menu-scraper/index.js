const { Storage } = require('@google-cloud/storage');
const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const storage = new Storage();

async function run() {
    const sourceCsv = process.env.SOURCE_CSV;
    const targetBucket = process.env.TARGET_BUCKET;
    const restaurantUrl = process.env.RESTAURANT_URL;
    const skipExisting = process.env.SKIP_EXISTING === 'true';

    console.log(`Starting sync for ${restaurantUrl}`);
    console.log(`Source CSV: ${sourceCsv}`);
    console.log(`Target Bucket: ${targetBucket}`);

    // 1. Load CSV
    let csvContent;
    if (sourceCsv.startsWith('gs://')) {
        const bucketName = sourceCsv.split('/')[2];
        const fileName = sourceCsv.split('/').slice(3).join('/');
        const [file] = await storage.bucket(bucketName).file(fileName).download();
        csvContent = file.toString();
    } else {
        csvContent = fs.readFileSync(sourceCsv, 'utf8');
    }

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`Loaded ${records.length} items from CSV.`);

    // 2. Launch Browser with realistic User-Agent and Stealth Mode
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-blink-features=AutomationControlled']
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    console.log(`Navigating to ${restaurantUrl}...`);
    await page.goto(restaurantUrl, { 
        waitUntil: 'load', 
        timeout: 90000 
    });

    // Wait a few more seconds for dynamic content
    await page.waitForTimeout(5000);

    // Scroll to bottom to trigger lazy loading
    console.log('Scrolling to trigger lazy load...');
    await page.evaluate(async () => {
        const delay = 500;
        const totalHeight = document.body.scrollHeight;
        let distance = 0;
        while (distance < totalHeight) {
            window.scrollBy(0, 400);
            distance += 400;
            await new Promise(r => setTimeout(r, delay));
        }
    });
    
    await page.waitForTimeout(2000);

    // 4. Match and Sync
    const bucket = storage.bucket(targetBucket);

    // DEBUG: Take a screenshot to see what's happening
    const screenshot = await page.screenshot({ fullPage: true });
    await bucket.file('HouseOfBiryani/debug_screenshot.png').save(screenshot, {
        metadata: { contentType: 'image/png' }
    });
    console.log(`Uploaded debug screenshot to gs://${targetBucket}/HouseOfBiryani/debug_screenshot.png`);

    const menuItems = await page.evaluate(() => {
        const items = [];
        // Target all possible item containers
        const containers = document.querySelectorAll('[data-testid*="menu-item"], .menuItem, [class*="ItemContainer"]');
        containers.forEach(el => {
            const nameEl = el.querySelector('[data-testid*="name"], [class*="itemName"], h3, h4, [class*="Title"]');
            const name = nameEl?.innerText?.trim();
            const imgEl = el.querySelector('img');
            const img = imgEl?.src;
            if (name && name.length < 100) {
                items.push({ name, imageUrl: img });
            }
        });
        return items;
    });

    console.log(`Found ${menuItems.length} potential items on the page.`);

    // 4. Match and Sync
    const updates = [];
    
    for (const record of records) {
        const itemName = record.Item;
        const csvPrice = record.Price.replace('+', '').trim();
        
        // Normalize name for better matching (lowercase, remove non-alphanumeric)
        const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normItemName = normalize(itemName);

        // Find best match in scraped items
        const match = menuItems.find(m => {
            const normMName = normalize(m.name);
            return normMName.includes(normItemName) || normItemName.includes(normMName);
        });
        
        if (match && match.imageUrl) {
            const safeName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const destFileName = `HouseOfBiryani/${safeName}.jpg`;
            const file = bucket.file(destFileName);

            if (skipExisting) {
                const [exists] = await file.exists();
                if (exists) {
                    console.log(`Skipping existing: ${destFileName}`);
                    updates.push({ name: itemName, price: csvPrice, gcsUrl: `https://storage.googleapis.com/${targetBucket}/${destFileName}` });
                    continue;
                }
            }

            console.log(`Syncing image for ${itemName}...`);
            try {
                const response = await axios.get(match.imageUrl, { responseType: 'arraybuffer' });
                await file.save(response.data, {
                    metadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' }
                });
                const publicUrl = `https://storage.googleapis.com/${targetBucket}/${destFileName}`;
                console.log(`Saved to ${publicUrl}`);
                updates.push({ name: itemName, price: csvPrice, gcsUrl: publicUrl });
            } catch (err) {
                console.error(`Failed to download ${match.imageUrl}: ${err.message}`);
            }
        } else {
            console.warn(`No image found for: ${itemName}`);
            updates.push({ name: itemName, price: csvPrice, gcsUrl: null });
        }
    }

    // 5. Generate SQL for DB update
    const sql = updates.map(u => {
        const imageSql = u.gcsUrl ? `, image_url = '${u.gcsUrl}'` : '';
        return `UPDATE microsite_menu_items SET base_price = ${u.price}, display_price = ${u.price}${imageSql} WHERE name = '${u.name.replace(/'/g, "''")}' AND tenant_id = '0f33e7e1-5474-4738-8de8-c687009f5e09';`;
    }).join('\n');

    const sqlFileName = 'HouseOfBiryani/updates.sql';
    await bucket.file(sqlFileName).save(sql, {
        metadata: { contentType: 'application/sql' }
    });
    console.log(`Uploaded SQL updates to gs://${targetBucket}/${sqlFileName}`);

    await browser.close();
    console.log('Sync complete.');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
