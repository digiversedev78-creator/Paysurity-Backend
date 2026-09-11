const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Projects/PaySurity/OLD REQUIREMENTS';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const commitHash = '803cb42';
const sourcePath = 'Requirements/Canonical/';

try {
    const files = execSync(`git ls-tree -r ${commitHash} --name-only ${sourcePath}`).toString().split('\n').filter(Boolean);
    
    files.forEach(file => {
        const fileName = path.basename(file);
        const destPath = path.join(targetDir, fileName);
        console.log(`Archiving ${fileName}...`);
        const content = execSync(`git show ${commitHash}:${file}`);
        fs.writeFileSync(destPath, content);
    });
    
    console.log('Archive complete.');
} catch (err) {
    console.error('Error during archiving:', err.message);
}
