const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Projects/PaySurity/requirements';
const outputLedger = path.join(baseDir, 'MASTER_LEDGER.json');

const verticals = [
  { id: '00', name: 'Cross-Cutting / Shared', brand: 'PaySurity Platform', folder: '00_shared', status: 'GREEN' },
  { id: '01', name: 'Public Core', brand: 'PaySurity.com', folder: '01_core', status: 'GREEN' },
  { id: '02', name: 'Merchant Services', brand: 'Onboarding/KYC/AML', folder: '02_merchant', status: 'GREEN' },
  { id: '03', name: 'Restaurant POS', brand: 'BistroBeest', folder: '03_restaurant', status: 'GREEN' },
  { id: '04', name: 'Grocery POS', brand: 'GrocerEase', folder: '04_grocery', status: 'GREEN' },
  { id: '05', name: 'Finance: Payroll', brand: 'PayPayroll', folder: '05_payroll', status: 'GREEN' },
  { id: '06', name: 'Finance: Digital Wallets', brand: 'PayWallet', folder: '06_wallets', status: 'GREEN' },
  { id: '07', name: 'Legal Tech', brand: 'LegalEdge', folder: null, status: 'DEFERRED', blockers: 'IOLTA trust account compliance' },
  { id: '08', name: 'Healthcare: Dental', brand: 'Dental PMS', folder: null, status: 'DEFERRED', blockers: 'HIPAA BAA framework' },
  { id: '09', name: 'Healthcare: Chiro', brand: 'Chiro PMS', folder: null, status: 'DEFERRED', blockers: 'HIPAA BAA framework' },
  { id: '10', name: 'AI Microsites', brand: 'Industry Templates', folder: '10_microsites', status: 'GREEN' },
  { id: '11', name: 'Internal Ops', brand: 'Super-Admin', folder: '11_internal', status: 'GREEN' }
];

function getFiles(dir, recursive = false) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (recursive) results = results.concat(getFiles(filePath, recursive));
    } else if (filePath.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

const ledger = verticals.map(v => {
  let documents = [];
  
  if (v.folder !== null) {
    const folderPath = path.join(baseDir, v.folder);
    const files = getFiles(folderPath, false); 
    documents = files.map(f => ({
      filename: path.basename(f),
      rel_path: path.relative(baseDir, f),
      content: fs.readFileSync(f, 'utf8')
    }));
    
    // Special case for ID 00: also include files in root of requirements/
    if (v.id === '00') {
      const rootFiles = getFiles(baseDir, false);
      documents = documents.concat(rootFiles.map(f => ({
        filename: path.basename(f),
        rel_path: path.relative(baseDir, f),
        content: fs.readFileSync(f, 'utf8')
      })));
    }
  }

  return {
    vertical_id: v.id,
    name: v.name,
    brand: v.brand,
    implementation_status: v.status,
    regulatory_blockers: v.blockers || 'None',
    documents: documents
  };
});

// Final Check: Are any files missed?
const allManagedFiles = new Set();
ledger.forEach(v => v.documents.forEach(d => allManagedFiles.add(d.rel_path)));

const allFilesOnDisk = getFiles(baseDir, true).map(f => path.relative(baseDir, f));
const missedFiles = allFilesOnDisk.filter(f => !allManagedFiles.has(f));

const finalOutput = {
  version: "2.1.0",
  last_audit: new Date().toISOString(),
  audit_integrity: missedFiles.length === 0 ? "100% COMPLETE" : "PARTIAL - MISSED FILES DETECTED",
  missed_files: missedFiles,
  ledger: ledger
};

fs.writeFileSync(outputLedger, JSON.stringify(finalOutput, null, 2));

console.log(`Deep Audit V2.1 complete.`);
console.log(`- Total Files Managed: ${allManagedFiles.size}`);
console.log(`- Missed Files: ${missedFiles.length}`);
if (missedFiles.length > 0) {
  console.log('Missed Files List:', missedFiles);
}
