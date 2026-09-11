const fs = require('fs'), path = require('path');
const DASH = 'apps/merchant-dashboard/src/app/dashboard';

const pages = [
  { file: 'analytics/page.tsx', endpoint: '/api/analytics', setter: null },
  { file: 'customers/page.tsx', endpoint: '/api/customers', setter: null },
  { file: 'employees/page.tsx', endpoint: '/api/employees', setter: null },
  { file: 'loyalty/page.tsx',   endpoint: '/api/loyalty/members', setter: null },
  { file: 'payroll/page.tsx',   endpoint: '/api/payroll/runs', setter: null },
  { file: 'settlements/page.tsx', endpoint: '/api/settlement-batches', setter: null },
];

for (const p of pages) {
  const fp = path.join(DASH, p.file);
  if (!fs.existsSync(fp)) { console.log('SKIP(missing):', p.file); continue; }
  let c = fs.readFileSync(fp, 'utf8');
  if (c.includes("apiClient('") || c.includes('apiClient("')) { console.log('SKIP(done):', p.file); continue; }

  // 1. Fix imports
  const hasUseState = c.includes("{ useState }") || c.includes("{ useState,");
  const hasApiClient = c.includes("apiClient");

  if (!hasUseState) {
    c = c.replace("'use client';",
      "'use client';\n\nimport { useState, useEffect } from 'react';\nimport { apiClient } from '../../../lib/api-client';"
    );
  } else {
    c = c.replace(/import \{ useState(, useEffect)? \} from 'react'/, "import { useState, useEffect } from 'react'");
    if (!hasApiClient) {
      c = c.replace("import { useState", "import { apiClient } from '../../../lib/api-client';\nimport { useState");
    }
  }

  // 2. Find first useState — extract the setter name
  const stateRe = /const \[(\w+), (set\w+)\] = useState/;
  const stateMatch = c.match(stateRe);
  if (!stateMatch) { console.log('SKIP(no useState):', p.file); continue; }
  const setter = stateMatch[2];

  // 3. Insert useEffect right after first useState line
  const hookCode = [
    '',
    '  useEffect(() => {',
    `    apiClient('${p.endpoint}')`,
    `      .then((data) => { if (Array.isArray(data) && data.length > 0) ${setter}(data as any); })`,
    '      .catch(() => {}); // Keep demo data on failure',
    '  }, []);',
    '',
  ].join('\n');

  c = c.replace(stateRe, stateMatch[0] + hookCode.slice(0, hookCode.lastIndexOf('\n')));

  fs.writeFileSync(fp, c, 'utf8');
  console.log('WIRED:', p.file, '->', p.endpoint, '(setter:', setter + ')');
}
console.log('Done.');
