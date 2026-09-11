const fs = require('fs');
const p = 'C:/Projects/PaySurity/apps/api/tsconfig.json';
const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const c = JSON.parse(raw);
c.exclude = c.exclude.filter(e => !e.includes('notification'));
fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('Done. Excludes now:', JSON.stringify(c.exclude));
