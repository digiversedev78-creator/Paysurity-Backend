const fs = require('fs');
const p = 'C:/Projects/PaySurity/apps/api/tsconfig.json';
const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const c = JSON.parse(raw);

// Exclude the OLD AI customer-segmentation files (they import from @paysurity/database which doesn't export those things)
// We have new implementations for all of this in ai.service.ts
const toExclude = [
  'src/modules/ai/ai-customer-segmentation.service.ts',
  'src/modules/ai/ai-customer-segmentation.controller.ts',
];

for (const e of toExclude) {
  if (!c.exclude.includes(e)) {
    c.exclude.push(e);
    console.log('Excluded:', e);
  } else {
    console.log('Already excluded:', e);
  }
}

fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('Done. Total excludes:', c.exclude.length);
