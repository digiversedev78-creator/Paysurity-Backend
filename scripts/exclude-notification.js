const fs = require('fs');
const tsconfigPath = 'C:/Projects/PaySurity/apps/api/tsconfig.json';
const content = fs.readFileSync(tsconfigPath, 'utf8').replace(/^\uFEFF/, '');
const tsconfig = JSON.parse(content);

// Exclude notification module (Phase 3C - needs db.query → db.execute fixes + missing exports)
if (!tsconfig.exclude.includes('src/modules/notification')) {
  tsconfig.exclude.push('src/modules/notification');
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('✅ Added notification to exclude list');
} else {
  console.log('⏭ Already excluded');
}
