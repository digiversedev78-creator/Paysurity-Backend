const fs = require('fs');
const path = require('path');

const apiSrc = path.join('c:/Projects/PaySurity', 'apps', 'api', 'src');

function replaceInDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      replaceInDir(fp);
    } else if (f.endsWith('.ts')) {
      let content = fs.readFileSync(fp, 'utf8');
      let modified = false;
      
      // Update imports that reference auth
      if (content.includes('/auth') || content.includes('../auth') || content.includes('./auth')) {
        const newContent = content.replace(/from\s+['"]([^'"]*\/)?modules\/auth(\/[^'"]*)?['"]/g, "from '@paysurity/auth'");
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
        
        // Handle ../auth and ./auth in root modules
        const newContent2 = content.replace(/from\s+['"](\.\.\/)*auth(\/[^'"]*)?['"]/g, "from '@paysurity/auth'");
        if (newContent2 !== content) {
          content = newContent2;
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fp, content, 'utf8');
      }
    }
  });
}

replaceInDir(apiSrc);

// Fix index.ts for the package
const pkgSrc = 'c:/Projects/PaySurity/packages/auth/src';
const files = [];
function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) walk(fp);
    else files.push(fp);
  });
}
walk(pkgSrc);
const exportsStr = files
  .filter(f => f.endsWith('.ts') && !f.endsWith('index.ts') && !f.includes('.spec.ts'))
  .map(f => `export * from './${path.relative(pkgSrc, f).replace(/\\\\/g, '/').replace('.ts', '')}';`)
  .join('\n');
fs.writeFileSync(path.join(pkgSrc, 'index.ts'), exportsStr);

console.log('Imports updated.');
