const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const ignores = ['node_modules', '.next', '.turbo', '.git', 'dist', 'build', 'coverage'];

const stats = {};

function scan(dir, projectName) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignores.includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scan(fullPath, projectName);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            if (!stats[projectName]) stats[projectName] = { files: 0, size: 0 };
            stats[projectName].files += 1;
            stats[projectName].size += stat.size;
        }
    }
}

const rootDirs = fs.readdirSync(root);
for (const dir of rootDirs) {
    if (ignores.includes(dir)) continue;
    const fullPath = path.join(root, dir);
    if (fs.statSync(fullPath).isDirectory()) {
        if (dir === 'apps' || dir === 'packages') {
            const apps = fs.readdirSync(fullPath);
            for (const app of apps) {
                const appPath = path.join(fullPath, app);
                if (fs.statSync(appPath).isDirectory()) {
                    scan(appPath, dir + '/' + app);
                }
            }
        } else {
            scan(fullPath, dir);
        }
    }
}

console.log(JSON.stringify(stats, null, 2));
