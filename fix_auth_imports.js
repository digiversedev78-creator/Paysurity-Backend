const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}
const files = walk('c:/Projects/PaySurity/apps/api/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    const authImportRegex = /from\s+['"](?:\.\/|\.\.\/)+(?:domains\/)?auth(?:\/[a-zA-Z0-9.-]+)?['"]/g;
    if (authImportRegex.test(content)) {
        content = content.replace(authImportRegex, "from '@paysurity/auth'");
        modified = true;
    }
    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed auth imports in ' + file);
    }
});
