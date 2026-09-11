const { chromium } = require('playwright');
const https = require('https');
const fs = require('fs');
const path = require('path');

const artifactsDir = 'c:/Projects/PaySurity/artifacts/Tawakkul';
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Status: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function run() {
    const sourceCsv = 'c:/Projects/PaySurity/artifacts/tawakkul_seed.csv';
    const restaurantUrl = 'https://www.grubhub.com/restaurant/tawakkul-restaurant-6410-north-claremont-ave-chicago/1944025';

    console.log(`Starting Local Harvest (Native) for ${restaurantUrl}`);
    
    // Simple CSV Parse
    const lines = fs.readFileSync(sourceCsv, 'utf8').split('\n').filter(l => l.trim() !== '');
    const headers = lines[0].split(',');
    const records = lines.slice(1).map(line => {
        const parts = line.split(',');
        return { Item: parts[0], Price: parts[1], Description: parts[2] };
    });

    const browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-blink-features=AutomationControlled']
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    console.log(`Navigating...`);
    await page.goto(restaurantUrl, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(5000);

    // Scroll
    await page.evaluate(async () => {
        let totalHeight = 0;
        let distance = 800;
        while (totalHeight < document.body.scrollHeight) {
            window.scrollBy(0, distance);
            totalHeight += distance;
            await new Promise(r => setTimeout(r, 400));
        }
    });

    const menuItems = await page.evaluate(() => {
        const items = [];
        const containers = document.querySelectorAll('[data-testid*="menu-item"], .menuItem, [class*="ItemContainer"]');
        containers.forEach(el => {
            const nameEl = el.querySelector('[data-testid*="name"], [class*="itemName"], h3, h4');
            const name = nameEl?.innerText?.trim();
            const imgEl = el.querySelector('img');
            const img = imgEl?.src;
            if (name) items.push({ name, imageUrl: img });
        });
        return items;
    });

    console.log(`Found ${menuItems.length} items.`);
    
    const manifest = [];
    for (const record of records) {
        const itemName = record.Item;
        const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normItemName = normalize(itemName);
        const match = menuItems.find(m => normalize(m.name).includes(normItemName));
        
        if (match && match.imageUrl && match.imageUrl.startsWith('http')) {
            const safeName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const destPath = path.join(artifactsDir, `${safeName}.jpg`);
            try {
                console.log(`Harvesting ${itemName}...`);
                await downloadImage(match.imageUrl, destPath);
                manifest.push({ name: itemName, status: 'HARVESTED', localPath: destPath, gcsTarget: `gs://paysurity-assets/Tawakkul/${safeName}.jpg` });
            } catch (err) {
                manifest.push({ name: itemName, status: 'FAILED', error: err.message });
            }
        } else {
            manifest.push({ name: itemName, status: 'MISSING' });
        }
    }

    fs.writeFileSync(path.join(artifactsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log('Complete.');
    await browser.close();
}

run().catch(console.error);
