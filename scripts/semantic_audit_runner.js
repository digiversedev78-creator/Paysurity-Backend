const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REQ_DIR = path.join(ROOT_DIR, 'Requirements', 'Canonical');
const OUTPUT_CSV = path.join(ROOT_DIR, 'PAYSURITY_SEMANTIC_AUDIT_REPORT.csv');

// Ignore non-semantic directories
const IGNORE_DIRS = ['node_modules', '.next', 'dist', '.git', '.turbo', 'scripts', 'public', 'tests', 'Requirements'];

// 1. Define Semantic Topics Based on PaySurity Domain Architecture
const TOPICS = [
  { domain: 'Auth & Multi-Tenancy', keywords: ['jwt', 'tenantid', 'rbac', 'permission', 'tenant', 'impersonate', 'role'] },
  { domain: 'Payment Orchestration', keywords: ['fluidpay', 'stripe', 'payment intent', 'refund', 'capture', 'gateway', 'settlement', 'dispute'] },
  { domain: 'POS: Restaurant (F&B)', keywords: ['kds', 'kitchen display', 'table', 'dine-in', 'tip pool', 'split check', 'modifier'] },
  { domain: 'POS: Retail & Grocery', keywords: ['barcode', 'ebt', 'snap', 'age verification', 'scale integration', 'tobacco', 'sku'] },
  { domain: 'Super Admin Infrastructure', keywords: ['mdm', 'telemetry', 'tenant registry', 'payfactor', 'hardware reboot'] },
  { domain: 'Payroll & HR', keywords: ['timesheet', 'wage', 'clock in', 'clock out', 'w-2', '1099', 'earned wage'] },
  { domain: 'Compliance & Legal', keywords: ['pci', 'saq-a', 'pan', 'kyb', 'tcpa', 'aml', 'kyc', 'data retention'] },
  { domain: 'Digital Wallets & Ledger', keywords: ['wallet', 'ledger', 'balance', 'p2p', 'load funds', 'transfer'] },
  { domain: 'E-Commerce & Storefront', keywords: ['cart', 'checkout', 'seo', 'seo product pages', 'guest checkout', 'product reviews'] },
  { domain: 'Affiliates & Resellers', keywords: ['referral', 'commission', 'payout', 'white-label', 'residual income'] }
];

function analyzeSemantics() {
  console.log('Initiating SEMANTIC TOPIC-WISE AUDIT...');
  let totalFilesParsed = 0;
  
  // Track metrics per domain
  const domainMetrics = {};
  TOPICS.forEach(t => {
      domainMetrics[t.domain] = { 
         canonicalPresence: 0, 
         codebasePresence: 0,
         surfaceLevelFiles: 0,
         halfDoneFiles: 0,
         robustFiles: 0,
         matchedFiles: [],
         canonicalFiles: []
      };
  });

  // Helper: Recursive Directory Walk
  function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (IGNORE_DIRS.includes(f)) continue;
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
         walkDir(p, callback);
      } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.md')) {
         callback(p);
      }
    }
  }

  // 2. Parse Canonical Documentation Semantically
  console.log('Scanning Canonical Markdown for Semantics...');
  walkDir(REQ_DIR, (filePath) => {
     if (!filePath.endsWith('.md')) return;
     const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
     const filename = path.basename(filePath);
     
     TOPICS.forEach(topic => {
        let hitCount = 0;
        topic.keywords.forEach(kw => {
           // Count occurrences of keyword in file
           const regex = new RegExp(kw.toLowerCase(), 'g');
           const matches = content.match(regex);
           if (matches) hitCount += matches.length;
        });
        
        if (hitCount > 2) { // Minimum semantic threshold to claim standard
           domainMetrics[topic.domain].canonicalPresence++;
           domainMetrics[topic.domain].canonicalFiles.push(filename);
        }
     });
  });

  // 3. Parse Raw Source Code Semantically (Regardless of file name)
  console.log('Scanning Apps & Packages Codebase for Semantics...');
  ['apps', 'packages'].forEach(d => {
      walkDir(path.join(ROOT_DIR, d), (filePath) => {
         if (filePath.endsWith('.md')) return; // code only
         const content = fs.readFileSync(filePath, 'utf8');
         const contentLower = content.toLowerCase();
         const ext = path.extname(filePath);
         totalFilesParsed++;

         TOPICS.forEach(topic => {
            let hitCount = 0;
            topic.keywords.forEach(kw => {
               const regex = new RegExp(kw.toLowerCase(), 'g');
               const matches = contentLower.match(regex);
               if (matches) hitCount += matches.length;
            });
            
            if (hitCount > 0) {
               domainMetrics[topic.domain].codebasePresence++;
               
               // Semantic Execution Depth Analysis
               const isSurface = content.length < 300 || (!content.includes('function') && !content.includes('class') && !content.includes('=>'));
               const isHalfDone = content.includes('TODO') || content.includes('mock') || content.includes('Not Implemented') || content.includes('// Fallback');
               
               if (isSurface) {
                 domainMetrics[topic.domain].surfaceLevelFiles++;
               } else if (isHalfDone) {
                 domainMetrics[topic.domain].halfDoneFiles++;
               } else {
                 domainMetrics[topic.domain].robustFiles++;
               }
               
               // Track up to 3 explicit files per domain for the report
               if (domainMetrics[topic.domain].matchedFiles.length < 3) {
                  domainMetrics[topic.domain].matchedFiles.push(path.basename(filePath));
               }
            }
         });
      });
  });

  // 4. Generate Semantic CSV Matrix
  let csvContent = 'Semantic Domain,Canonical Document Support,Total Code Files Hit,Surface/Interfaces Only,Half-Done (Mocked/TODO),Robust Execution,Gap Assessment\n';
  
  console.log('\n--- SEMANTIC DEEP AUDIT RESULTS ---');
  TOPICS.forEach(topic => {
      const dm = domainMetrics[topic.domain];
      let assessment = 'Aligned';
      
      if (dm.canonicalPresence === 0 && dm.codebasePresence > 0) {
          assessment = 'Orphaned Code (No Canonical Requirements)';
      } else if (dm.canonicalPresence > 0 && dm.codebasePresence === 0) {
          assessment = 'CRITICAL GAP: Required but unwritten';
      } else if (dm.halfDoneFiles > dm.robustFiles * 2) {
          assessment = 'Feature is largely scaffolded/mocked';
      } else if (dm.robustFiles === 0 && dm.halfDoneFiles === 0) {
          assessment = 'Surface Level (Types/Interfaces Only)';
      }

      console.log(`[${topic.domain}] Canonicals: ${dm.canonicalPresence} | Code Hits: ${dm.codebasePresence} | Robust: ${dm.robustFiles}`);

      csvContent += `"${topic.domain}","${dm.canonicalFiles.length > 0 ? dm.canonicalFiles.join(' | ') : 'MISSING'}","${dm.codebasePresence}","${dm.surfaceLevelFiles}","${dm.halfDoneFiles}","${dm.robustFiles}","${assessment}"\n`;
  });

  fs.writeFileSync(OUTPUT_CSV, csvContent);
  console.log(`\n✅ Deep Semantic Audit Complete. Parsed ${totalFilesParsed} source files based on Topics, not IDs.`);
  console.log(`📊 Report generated at: ${OUTPUT_CSV}`);
  
}

analyzeSemantics();
