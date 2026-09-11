const fs = require('fs');
const p = 'C:/Projects/PaySurity/apps/api/tsconfig.json';
const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const c = JSON.parse(raw);

// Remove broad 'src/modules/ai' exclusion — we now have working files
c.exclude = c.exclude.filter(e => {
  // Remove the broad ai exclusion
  if (e === 'src/modules/ai') return false;
  // Keep the specific file exclusions for the old broken files
  if (e === 'src/modules/ai/ai-customer-segmentation.service.ts') return false; // remove too
  if (e === 'src/modules/ai/ai-customer-segmentation.controller.ts') return false; // remove too
  if (e === 'src/modules/ai/ai.module.ts') return false; // remove too (we fixed it)
  return true;
});

fs.writeFileSync(p, JSON.stringify(c, null, 2));
console.log('AI module un-excluded. Total excludes:', c.exclude.length);
console.log('Remaining ai excludes:', c.exclude.filter(e => e.includes('/ai')));
