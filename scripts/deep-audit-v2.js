const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const REQ_DIR = path.join(ROOT_DIR, 'Requirements', 'Canonical');
const OUTPUT_CSV = path.join(ROOT_DIR, 'PAYSURITY_DEEP_AUDIT_REPORT_V2.csv');

// Aggressive Chat/Scope Extraction
const DEEP_SCOPE_KEYWORDS = [
  { id: 'CHAT-01', title: 'Tenant-Admin UI Separation', terms: ['tenant', 'merchant dashboard', 'isolation'] },
  { id: 'CHAT-02', title: 'Super Admin Portal', terms: ['super admin', 'platform admin'] },
  { id: 'CHAT-03', title: 'Sub Super Admin Roles', terms: ['sub super admin', 'it support', 'sub-admin'] },
  { id: 'CHAT-04', title: 'PayFactor Revenue Routing', terms: ['payfactor', 'revenue split', 'factoring'] },
  { id: 'CHAT-05', title: 'Multi-Tenant Microsites', terms: ['microsite', 'storefront', 'multi-tenant edge'] },
  { id: 'CHAT-06', title: 'Database-Driven Fallbacks', terms: ['offline mode', 'database connection guaranteed'] },
  { id: 'CHAT-07', title: 'Hardware MDM Tunnel', terms: ['mdm', 'terminal flash', 'hardware reboot'] },
  { id: 'CHAT-08', title: 'FluidPay Sandbox Keys', terms: ['fluidpay', 'sandbox', 'gateway keys'] },
  { id: 'CHAT-09', title: 'Odoo Enterprise Parity', terms: ['odoo parity', 'odoo enterprise'] }
];

function analyzeV2() {
  console.log('Initiating DEEPEST POSSIBLE AUDIT (V2)...');
  const report = [['Req ID', 'Title', 'Found In Manifest', 'Code Exists', 'Backend Depth', 'Frontend UI Exists', 'DB Schema Exists', 'Tests Exist', 'Status / Quality Assessment']];

  // 1. Gather all Manifests to analyze drift
  const allFiles = fs.readdirSync(ROOT_DIR);
  const manifestFiles = allFiles.filter(f => f.startsWith('REQUIREMENTS_') && f.endsWith('.json'));
  
  const allReqs = new Map(); // Keep superset to catch leaks across phases
  let totalRequirementsInManifests = 0;

  manifestFiles.forEach(mName => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, mName), 'utf8'));
      if (data.workers) {
        Object.values(data.workers).forEach(worker => {
           if (worker.requirements) {
             worker.requirements.forEach(req => {
               totalRequirementsInManifests++;
               // Store the latest or most robust iteration
               if (!allReqs.has(req.id) || (req.generated_files && req.generated_files.length > (allReqs.get(req.id).generated_files?.length || 0))) {
                 req.source_manifest = mName;
                 allReqs.set(req.id, req);
               }
             });
           }
        });
      }
    } catch(e) {}
  });

  // DB Schema scan
  const DB_DIR = path.join(ROOT_DIR, 'packages', 'database', 'src', 'schema');
  let dbSchemas = [];
  if (fs.existsSync(DB_DIR)) dbSchemas = fs.readdirSync(DB_DIR).join(' ');

  // Frontend directories
  const FED_DASH = path.join(ROOT_DIR, 'apps', 'merchant-dashboard', 'src', 'app');
  const FED_STORE = path.join(ROOT_DIR, 'apps', 'consumer-storefront', 'src', 'app');
  let allFrontends = '';
  function crawlDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(f => {
       const p = path.join(dir, f);
       if (fs.statSync(p).isDirectory()) crawlDir(p);
       else allFrontends += ' ' + f;
    });
  }
  crawlDir(FED_DASH);
  crawlDir(FED_STORE);

  let genErrors = 0;
  let halfDone = 0;
  let robust = 0;
  let surfaceLevel = 0;

  allReqs.forEach(req => {
     let codeExists = 'No';
     let testExists = 'No';
     let quality = 'N/A';
     let uiExists = 'No (Missing React Page)';
     let schemaExists = 'No (Missing SQL Schema)';

     const files = req.generated_files || [];
     const existingFiles = files.filter(f => fs.existsSync(path.join(ROOT_DIR, f)));
     
     if (existingFiles.length > 0) {
       codeExists = `Partial (${existingFiles.length}/${files.length})`;
       if (existingFiles.length === files.length) codeExists = 'Yes';
       
       let hasTodos = false;
       let hasDecorators = false;
       let totalSize = 0;

       existingFiles.forEach(f => {
          const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
          totalSize += content.length;
          if (content.includes('TODO') || content.includes('mock') || content.includes('Not Implemented') || content.includes('throw new Error')) hasTodos = true;
          // check if it physically exposes an API endpoint
          if (content.includes('@Get(') || content.includes('@Post(') || content.includes('@Patch(')) hasDecorators = true;
       });
       
       if (hasTodos) {
         quality = 'V1 Half-Done (Hollow Stubs)';
         halfDone++;
       } else if (!hasDecorators && req.module) {
         quality = 'V2 Surface-Level (No API logic mapped)';
         surfaceLevel++;
       } else if (totalSize < 500) {
         quality = 'V2 Surface-Level (Code too thin)';
         surfaceLevel++;
       } else {
         quality = 'V3 Robust (Active logic detected)';
         robust++;
       }
       
       const tests = existingFiles.filter(f => f.includes('.spec.ts'));
       testExists = tests.length > 0 ? 'Spec File Generated' : 'No Unit Tests';

       // Frontend Check using exact module keywords
       if (req.module && allFrontends.includes(req.module)) {
           uiExists = 'Yes (Mapped to Frontend)';
       }
       
       // Database Schema Check
       if (req.entity && dbSchemas.includes(req.entity)) {
           schemaExists = 'Yes (Physically Modeled)';
       }
     } else {
       genErrors++;
     }

     report.push([
       req.id, 
       `"${req.title}"`, 
       req.source_manifest, 
       codeExists, 
       quality, 
       uiExists,
       schemaExists,
       testExists, 
       req.status === 'ERROR' ? 'Failed LLM Generation' : quality
     ]);
  });

  // 2. Audit Chat Leaks against canonical markdown
  const canonicalFiles = fs.readdirSync(REQ_DIR).filter(f => f.endsWith('.md'));
  let canonicalText = '';
  canonicalFiles.forEach(f => {
    canonicalText += Object.values(fs.readFileSync(path.join(REQ_DIR, f), 'utf8')).join('');
  });

  let leakedCount = 0;
  DEEP_SCOPE_KEYWORDS.forEach(chatReq => {
     const isDocumented = chatReq.terms.some(kw => canonicalText.toLowerCase().includes(kw));

     if (!isDocumented) {
        leakedCount++;
        report.push([
          chatReq.id, 
          `"${chatReq.title}"`, 
          'Lost Context', 
          'No', 
          'Undocumented', 
          'No', 
          'No', 
          'No', 
          'CRITICAL ARCHITECTURAL LEAK'
        ]);
     } else {
        report.push([
          chatReq.id, 
          `"${chatReq.title}"`, 
          'Secured in Canonical Markdown', 
          'N/A', 
          'N/A', 
          'N/A', 
          'N/A', 
          'N/A', 
          'Successfully Bound to Architecture'
        ]);
     }
  });

  const csvContent = report.map(row => row.join(',')).join('\n');
  fs.writeFileSync(OUTPUT_CSV, csvContent);
  
  console.log('--- DEEP_AUDIT_V2_METRICS ---');
  console.log(`Manifests Scanned: ${manifestFiles.length}`);
  console.log(`Total Superset Requirements Extracted: ${allReqs.size}`);
  console.log(`Backend Generation Errors (Code Absent): ${genErrors}`);
  console.log(`Backend Half-Done / Hollow Stubs: ${halfDone}`);
  console.log(`Backend Surface-Level (Empty APIs): ${surfaceLevel}`);
  console.log(`Backend Robust Implementations: ${robust}`);
  console.log(`Chat Requirements Leaked: ${leakedCount}`);
}

analyzeV2();
