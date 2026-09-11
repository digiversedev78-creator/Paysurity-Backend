const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const REQ_DIR = path.join(ROOT_DIR, 'Requirements', 'Canonical');
const MANIFEST_PATH = path.join(ROOT_DIR, 'REQUIREMENTS_MASTER_MANIFEST.json');
const OUTPUT_CSV = path.join(ROOT_DIR, 'PAYSURITY_DEEP_AUDIT_REPORT.csv');

// Requirements discussed heavily in our chat recently.
const CHAT_REQUIREMENTS = [
  { id: 'CHAT-01', title: 'Tenant-Admin UI Separation', keywords: ['Tenant-Admin', 'Merchant Dashboard', 'tenant'] },
  { id: 'CHAT-02', title: 'Super Admin Portal', keywords: ['Super Admin', 'Admin Portal', 'MDM'] },
  { id: 'CHAT-03', title: 'Sub Super Admin Roles', keywords: ['Sub Super Admin', 'Sub-admin'] },
  { id: 'CHAT-04', title: 'PayFactor Revenue Routing', keywords: ['PayFactor'] },
  { id: 'CHAT-05', title: 'Multi-Tenant Microsites', keywords: ['microsite', 'House of Biryani', 'Tawakkul', 'Tobacco', 'Ashiana'] },
  { id: 'CHAT-06', title: 'Database-Driven Fallbacks', keywords: ['Offline Mode', 'Connection Refused'] },
];

function analyzeCodebase() {
  console.log('Initiating Deep Audit Runner...');
  const report = [];
  report.push(['Req ID', 'Title', 'Source', 'Status', 'Code Exists', 'Depth/Quality', 'Test Exists', 'Gap/Leak Analysis', 'Automation Opportunity']);

  // 1. Audit Canonical Manifest
  let manifest = { requirements: [] };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      // Flat map all requirements across all workers
      if (data.workers) {
        Object.values(data.workers).forEach(worker => {
           manifest.requirements.push(...worker.requirements);
        });
      }
    } catch (e) {
      console.error('Error parsing manifest', e);
    }
  }

  manifest.requirements.forEach(req => {
     let codeExists = 'No';
     let testExists = 'No';
     let quality = 'N/A';
     let autoOpportunity = 'N/A';

     const files = req.generated_files || [];
     const existingFiles = files.filter(f => fs.existsSync(path.join(ROOT_DIR, f)));
     
     if (existingFiles.length > 0) {
       codeExists = `Partial (${existingFiles.length}/${files.length})`;
       if (existingFiles.length === files.length) codeExists = 'Yes';
       
       // Measure depth by looking for TODOs or short fles
       let hasTodos = false;
       let isSurfaceLevel = false;
       existingFiles.forEach(f => {
          const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
          if (content.includes('TODO') || content.includes('mock') || content.includes('Not Implemented')) hasTodos = true;
          if (content.length < 300) isSurfaceLevel = true; // Too small to be a real implementation
       });
       quality = hasTodos ? 'Half-Done (Has TODOs/Mocks)' : (isSurfaceLevel ? 'Surface Level' : 'Robust');
       
       const tests = existingFiles.filter(f => f.includes('.spec.ts') || f.includes('.e2e-spec.ts'));
       testExists = tests.length > 0 ? 'Yes' : 'No';
       if (testExists === 'No') autoOpportunity = `Create Jest/Playwright suite for ${req.module}`;
     }

     report.push([
       req.id, 
       `"${req.title}"`, 
       'Manifest', 
       req.status, 
       codeExists, 
       quality, 
       testExists, 
       req.status === 'ERROR' ? 'Generation Failed' : 'Mapped', 
       autoOpportunity
     ]);
  });

  // 2. Audit Chat Leaks
  // Read all canonical markdown files to see if chat requirements made it in.
  const canonicalFiles = fs.readdirSync(REQ_DIR).filter(f => f.endsWith('.md'));
  let canonicalText = '';
  canonicalFiles.forEach(f => {
    canonicalText += fs.readFileSync(path.join(REQ_DIR, f), 'utf8') + '\n';
  });

  CHAT_REQUIREMENTS.forEach(chatReq => {
     const isDocumented = chatReq.keywords.some(kw => canonicalText.includes(kw));
     
     // Check if code exists for it roughly
     let codeExists = 'Unknown';
     try {
       // Rough grep
       const result = execSync(`git grep -i "${chatReq.keywords[0]}"`, { cwd: ROOT_DIR, encoding: 'utf8' }).toString();
       if (result.trim().length > 0) codeExists = 'Yes';
     } catch (e) {
       codeExists = 'No';
     }

     if (!isDocumented) {
        report.push([
          chatReq.id, 
          `"${chatReq.title}"`, 
          'Chat Only', 
          'LEAKED', 
          codeExists, 
          codeExists === 'Yes' ? 'Orphaned Code' : 'Missing', 
          'No', 
          'CRITICAL LEAK: Discussed in chat but missing from canonical documentation.', 
          `Write Playwright E2E for ${chatReq.title}`
        ]);
     } else {
        report.push([
          chatReq.id, 
          `"${chatReq.title}"`, 
          'Chat + Canonical', 
          'DOCUMENTED', 
          codeExists, 
          'Needs manual review', 
          'No', 
          'Successfully merged into canonical.', 
          `Write Playwright E2E for ${chatReq.title}`
        ]);
     }
  });

  const csvContent = report.map(row => row.join(',')).join('\n');
  fs.writeFileSync(OUTPUT_CSV, csvContent);
  console.log(`✅ Deep Audit Complete. Processed ${manifest.requirements.length} manifest reqs and 6 Chat scenarios.`);
  console.log(`📊 Report generated at: ${OUTPUT_CSV}`);
  
  // Print summary to console for the agent to read
  const leakedCount = report.filter(r => r[3] === 'LEAKED').length;
  const halfDoneCount = report.filter(r => r[5].includes('Half-Done')).length;
  const surfaceCount = report.filter(r => r[5].includes('Surface Level')).length;
  const errorsCount = report.filter(r => r[3] === 'ERROR').length;
  
  console.log('--- SUMMARY_METRICS ---');
  console.log(`Total Documented Requirements: ${manifest.requirements.length}`);
  console.log(`Generation Errors (Missing Code entirely): ${errorsCount}`);
  console.log(`Half-Done Executions (Contains TODOs/Mocks): ${halfDoneCount}`);
  console.log(`Surface-Level Implementations (File too small): ${surfaceCount}`);
  console.log(`Leaked Requirements (Chat -> Canonical failure): ${leakedCount}`);
}

analyzeCodebase();
