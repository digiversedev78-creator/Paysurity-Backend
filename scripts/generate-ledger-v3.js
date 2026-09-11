const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Projects/PaySurity';
const reqDir = path.join(baseDir, 'requirements');
const apiSrcDir = path.join(baseDir, 'apps/api/src');
const outputLedger = path.join(reqDir, 'MASTER_LEDGER.json');

// Map of all source files for fuzzy lookup
const allApiFiles = {};
function indexSourceFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      indexSourceFiles(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const relPath = path.relative(baseDir, filePath);
      allApiFiles[file] = relPath;
    }
  });
}
indexSourceFiles(apiSrcDir);

const verticals = [
  { id: '00', name: 'Cross-Cutting / Shared', folder: '00_shared' },
  { id: '01', name: 'Public Core', folder: '01_core' },
  { id: '02', name: 'Merchant Services', folder: '02_merchant' },
  { id: '03', name: 'Restaurant POS', folder: '03_restaurant' },
  { id: '04', name: 'Grocery POS', folder: '04_grocery' },
  { id: '05', name: 'Finance: Payroll', folder: '05_payroll' },
  { id: '06', name: 'Finance: Digital Wallets', folder: '06_wallets' },
  { id: '07', name: 'Legal Tech', folder: null },
  { id: '08', name: 'Healthcare: Dental', folder: null },
  { id: '09', name: 'Healthcare: Chiro', folder: null },
  { id: '10', name: 'AI Microsites', folder: '10_microsites' },
  { id: '11', name: 'Internal Ops', folder: '11_internal' }
];

function parseRequirements(content, filePath) {
  const requirements = [];
  // Expanded regex to catch REQ-, MST-, OP-, ADV- etc.
  const reqRegex = /(?:##|###)\s+([A-Z0-9-]+):\s+(.*)/g;
  let match;
  
  while ((match = reqRegex.exec(content)) !== null) {
    const id = match[1];
    const title = match[2].trim();
    if (!id.match(/^[A-Z]{2,4}-[0-9]{3}$/) && !id.match(/^[A-Z]{2,4}-[A-Z0-9-]+-[0-9]{3}$/)) continue;

    const startIndex = match.index;
    const nextMatch = content.slice(startIndex + 1).search(/(?:##|###)\s+/);
    const rawBlock = nextMatch === -1 ? content.slice(startIndex) : content.slice(startIndex, startIndex + 1 + nextMatch);
    
    const priorityMatch = rawBlock.match(/\*\*Priority:\*\*\s*([A-Za-z]+)/);
    const fileMentions = [...rawBlock.matchAll(/`([^`]+\.ts[x]?)`/g)].map(m => m[1]);
    
    let bestTrace = { status: "UNLINKED", path: null };
    for (const mention of fileMentions) {
      const bname = path.basename(mention);
      if (allApiFiles[bname]) {
        const hasId = fs.readFileSync(path.join(baseDir, allApiFiles[bname]), 'utf8').includes(id);
        if (hasId) {
          bestTrace = { status: "LINKED", path: allApiFiles[bname], comment: "Exact ID found." };
          break;
        } else if (bestTrace.status !== "LINKED") {
          bestTrace = { status: "MAPPED_HINT", path: allApiFiles[bname], comment: "File name hint." };
        }
      }
    }

    requirements.push({
      id,
      title,
      priority: priorityMatch ? priorityMatch[1] : 'Unknown',
      trace: bestTrace,
      source_file: path.relative(reqDir, filePath)
    });
  }
  return requirements;
}

const ledger = verticals.map(v => {
  let reqs = [];
  if (v.folder) {
    const folderPath = path.join(reqDir, v.folder);
    const files = (v.id === '00') ? 
      [...getFiles(folderPath, false), ...getFiles(reqDir, false)] : 
      getFiles(folderPath, false);

    files.forEach(f => reqs.push(...parseRequirements(fs.readFileSync(f, 'utf8'), f)));
  }

  return {
    vertical_id: v.id,
    name: v.name,
    requirement_count: reqs.length,
    status: v.folder ? "ACTIVE" : "DEFERRED",
    requirements: reqs
  };
});

function getFiles(dir, recursive) {
  if (!fs.existsSync(dir)) return [];
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (recursive) res.push(...getFiles(p, true)); }
    else if (p.endsWith('.md') && !f.includes('MASTER_LEDGER')) res.push(p);
  });
  return res;
}

const allReqs = ledger.flatMap(v => v.requirements);
const health = {
  total_requirements: allReqs.length,
  implementation_fidelity: ((allReqs.filter(r => r.trace.status === 'LINKED').length / (allReqs.length || 1)) * 100).toFixed(2) + "%",
  linked_count: allReqs.filter(r => r.trace.status === 'LINKED').length
};

fs.writeFileSync(outputLedger, JSON.stringify({ version: "3.4.0", platform_health: health, last_audit: new Date().toISOString(), ledger }, null, 2));
console.log("Audit V3.4 Complete.");
