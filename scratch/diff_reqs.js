const fs = require('fs');

const masterLedger = JSON.parse(fs.readFileSync('c:/Projects/PaySurity/Requirements/MASTER_LEDGER.json', 'utf-8'));
const masterIds = new Set();

if (masterLedger.ledger) {
  for (const category of masterLedger.ledger) {
    if (category.requirements) {
      for (const req of category.requirements) {
        masterIds.add(req.id);
      }
    }
  }
}

const fullText = fs.readFileSync('c:/Projects/PaySurity/full_texts_utf8.txt', 'utf-8');

const oldReqs = [];
const lines = fullText.split('\n');

for (const line of lines) {
  const match1 = line.trim().match(/^###\s+([A-Z0-9\-]+):\s+(.*)/);
  if (match1) {
    oldReqs.push({ id: match1[1], title: match1[2] });
    continue;
  }

  const match2 = line.trim().match(/^\*\*([A-Z0-9\-]+)\s+\[([^\]]+)\]:\*\*/);
  if (match2) {
    oldReqs.push({ id: match2[1], title: match2[2] });
    continue;
  }

  const match3 = line.trim().match(/^##\s+([A-Z0-9\-]+):\s+(.*)/);
  if (match3) {
    oldReqs.push({ id: match3[1], title: match3[2] });
    continue;
  }
}

console.log(`Found ${oldReqs.length} requirements in old text headers.`);

const leaked = oldReqs.filter(req => !masterIds.has(req.id));
console.log(`Found ${leaked.length} leaked requirements from headers:`);
for (const req of leaked) {
  console.log(`- ${req.id}: ${req.title}`);
}

const allTagsMatches = [...fullText.matchAll(/\b(?:REQ|MST|ADV|DEF|OP|POS|WAL|MER|PAY|FRN)-[A-Z0-9\-]+\b/g)];
const allTags = allTagsMatches.map(m => m[0]);
const uniqueTags = new Set(allTags);
console.log(`\nTotal unique requirement-like tags found: ${uniqueTags.size}`);

const untrackedTags = [...uniqueTags].filter(tag => !masterIds.has(tag));
console.log(`Tags completely untracked in master ledger: ${untrackedTags.length}`);
for (const t of untrackedTags.sort()) {
  console.log(t);
}
