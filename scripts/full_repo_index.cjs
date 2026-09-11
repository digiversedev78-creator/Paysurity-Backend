const fs = require('fs');
const path = require('path');
const INDEX = 'C:\\Projects\\PaySurity\\scripts\\repo_index.json';
const ROOT = 'C:\\Projects\\PaySurity';
function walk(dir) {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.vscode', 'dist'].includes(file)) {
                results = results.concat(walk(fullPath));
            }
        } else {
            results.push(fullPath);
        }
    });
    return results;
}
fs.writeFileSync(INDEX, JSON.stringify(walk(ROOT), null, 2));
console.log('✅ Index successfully created at ' + INDEX);
