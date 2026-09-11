const fs = require('fs');
const path = require('path');

console.log("$ ls -la .github/workflows/");
const workflows = fs.readdirSync('.github/workflows');
workflows.forEach(f => {
  const stat = fs.statSync(path.join('.github/workflows', f));
  console.log(`-rw-r--r-- 1 user group ${stat.size} ${f}`);
});

console.log("\n$ ls -la cloudbuild.yaml");
const cbStat = fs.statSync('cloudbuild.yaml');
console.log(`-rw-r--r-- 1 user group ${cbStat.size} cloudbuild.yaml`);

console.log("\n$ cat .github/workflows/*.yml");
workflows.filter(f => f.endsWith('.yml')).forEach(f => {
  console.log(`\n# --- .github/workflows/${f} ---`);
  console.log(fs.readFileSync(path.join('.github/workflows', f), 'utf-8'));
});
