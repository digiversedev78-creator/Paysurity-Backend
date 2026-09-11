const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

const ASSETS = [
    {
        name: 'lamb_chops.jpg',
        url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=90',
        gcs: 'gs://paysurity-assets/Tawakkul/lamb_chops.jpg'
    },
    {
        name: 'malai_kebab.jpg',
        url: 'https://images.unsplash.com/photo-1633945115813-33e9a50158bc?auto=format&fit=crop&w=1200&q=90',
        gcs: 'gs://paysurity-assets/Tawakkul/malai_kebab.jpg'
    }
];

const targetDir = 'c:/Projects/PaySurity/artifacts/Tawakkul/binaries';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

async function downloadAndUpload() {
    for (const asset of ASSETS) {
        const localPath = path.join(targetDir, asset.name);
        console.log(`Downloading ${asset.name}...`);
        
        await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(localPath);
            https.get(asset.url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(localPath, () => {});
                reject(err);
            });
        });

        console.log(`Uploading ${asset.name} to GCS...`);
        try {
            execSync(`gcloud storage cp "${localPath}" "${asset.gcs}"`);
            console.log(`✅ ${asset.name} synced.`);
        } catch (err) {
            console.error(`❌ Failed to upload ${asset.name}:`, err.message);
        }
    }
}

downloadAndUpload().then(() => console.log('Asset sync complete.'));
