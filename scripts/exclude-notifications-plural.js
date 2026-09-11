const fs = require('fs');
const p = 'C:/Projects/PaySurity/apps/api/tsconfig.json';
const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const c = JSON.parse(raw);

// Exclude the plural 'notifications' module (duplicate of 'notification' singular, Phase 4+)
if (!c.exclude.includes('src/modules/notifications')) {
  c.exclude.push('src/modules/notifications');
  fs.writeFileSync(p, JSON.stringify(c, null, 2));
  console.log('Added notifications (plural) to exclude. Total excludes:', c.exclude.length);
} else {
  console.log('Already excluded.');
}
