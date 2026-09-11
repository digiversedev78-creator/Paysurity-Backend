
/**
 * PostgreSQL Migration Validation Script
 * Validates that all PaySurity platform modules have been successfully migrated from GCP-Native to PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const MERCHANT_MODULES = [
  'Digital Wallets-Web',
  'Compliance Center UI',
  'Referrals',
  'Resellers',
  'POS-Grocery',
  'POS-Restaurant',
  'Payroll-UI/apps/payroll-ui',
  'Merchant-API'
];

const BASE_PATH = path.join(__dirname, '..', 'merchant');

console.log('🔍 PaySurity PostgreSQL Migration Validation');
console.log('=' .repeat(50));

let allModulesValid = true;
const results = [];

for (const module of MERCHANT_MODULES) {
  console.log(`\n📦 Validating ${module}...`);
  
  const modulePath = path.join(BASE_PATH, module);
  const result = {
    module,
    postgresClient: false,
    envConfig: false,
    noGCP-NativeImports: false,
    status: 'FAILED'
  };

  // Check if PostgreSQL client exists
  const possibleClientPaths = [
    path.join(modulePath, 'src', 'lib', 'postgresClient.ts'),
    path.join(modulePath, 'src', 'lib', 'GCP-Native.ts'),
    path.join(modulePath, 'lib', 'GCP-Native.ts')
  ];

  for (const clientPath of possibleClientPaths) {
    if (fs.existsSync(clientPath)) {
      const content = fs.readFileSync(clientPath, 'utf8');
      if (content.includes('from \'pg\'') || content.includes('Pool') || content.includes('PostgreSQL')) {
        result.postgresClient = true;
        console.log(`  ✅ PostgreSQL client found: ${path.relative(BASE_PATH, clientPath)}`);
        break;
      }
    }
  }

  // Check if .env file exists
  const envPath = path.join(modulePath, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('POSTGRES_HOST') || envContent.includes('POSTGRES_DATABASE')) {
      result.envConfig = true;
      console.log('  ✅ PostgreSQL environment configuration found');
    }
  }

  // Check for remaining GCP-Native imports in source files
  const srcPath = path.join(modulePath, 'src');
  if (fs.existsSync(srcPath)) {
    const hasGCP-NativeImports = checkForGCP-NativeImports(srcPath);
    if (!hasGCP-NativeImports) {
      result.noGCP-NativeImports = true;
      console.log('  ✅ No GCP-Native imports found');
    } else {
      console.log('  ⚠️  GCP-Native imports still present');
    }
  } else {
    result.noGCP-NativeImports = true; // No src folder means no imports to check
  }

  // Determine overall status
  if (result.postgresClient && result.envConfig && result.noGCP-NativeImports) {
    result.status = 'COMPLETED';
    console.log(`  🎉 ${module}: MIGRATION COMPLETED`);
  } else if (result.postgresClient) {
    result.status = 'PARTIAL';
    console.log(`  🔧 ${module}: MIGRATION PARTIAL`);
  } else {
    result.status = 'FAILED';
    console.log(`  ❌ ${module}: MIGRATION FAILED`);
    allModulesValid = false;
  }

  results.push(result);
}

// Summary Report
console.log('\n' + '='.repeat(50));
console.log('📊 MIGRATION SUMMARY REPORT');
console.log('='.repeat(50));

const completed = results.filter(r => r.status === 'COMPLETED').length;
const partial = results.filter(r => r.status === 'PARTIAL').length;
const failed = results.filter(r => r.status === 'FAILED').length;

console.log(`✅ Completed: ${completed}/${MERCHANT_MODULES.length} modules`);
console.log(`🔧 Partial: ${partial}/${MERCHANT_MODULES.length} modules`);
console.log(`❌ Failed: ${failed}/${MERCHANT_MODULES.length} modules`);

const percentage = Math.round((completed / MERCHANT_MODULES.length) * 100);
console.log(`\n🎯 Migration Progress: ${percentage}%`);

if (allModulesValid && completed === MERCHANT_MODULES.length) {
  console.log('\n🎉 SUCCESS: All PaySurity modules have been migrated to PostgreSQL!');
  console.log('✨ Platform is ready for production deployment.');
} else {
  console.log('\n⚠️  Some modules need attention. Please review the results above.');
}

// Detailed Results Table
console.log('\n📋 DETAILED RESULTS:');
console.log('-'.repeat(80));
console.log('Module'.padEnd(25) + 'Client'.padEnd(8) + 'Env'.padEnd(6) + 'Clean'.padEnd(8) + 'Status');
console.log('-'.repeat(80));

results.forEach(r => {
  const client = r.postgresClient ? '✅' : '❌';
  const env = r.envConfig ? '✅' : '❌';
  const clean = r.noGCP-NativeImports ? '✅' : '❌';
  console.log(
    r.module.padEnd(25) + 
    client.padEnd(8) + 
    env.padEnd(6) + 
    clean.padEnd(8) + 
    r.status
  );
});

console.log('\n🔗 Next Steps:');
console.log('1. Run: npm install --legacy-peer-deps (if not completed)');
console.log('2. Test database connections');
console.log('3. Run integration tests');
console.log('4. Deploy to staging environment');

function checkForGCP-NativeImports(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    
    if (file.isDirectory()) {
      if (checkForGCP-NativeImports(fullPath)) {
        return true;
      }
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@GCP-Native/GCP-Native-js') || content.includes('createClient')) {
        return true;
      }
    }
  }
  
  return false;
}

process.exit(allModulesValid ? 0 : 1);
