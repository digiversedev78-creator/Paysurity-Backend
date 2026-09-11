# REQ-TEST: MERSIS-003
#!/usr/bin/env node

/**
 * ServiceFactory Functionality Test
 * Tests if services can be instantiated and basic functionality works
 */

const path = require('path');

console.log('🧪 Testing ServiceFactory Functionality');
console.log('======================================');
console.log(`📅 Started at: ${new Date().toISOString()}`);
console.log('');

async function testServiceFactory() {
  try {
    // Set up module path resolution
    const servicesPath = path.join(__dirname, '..', 'shared', 'services');
    
    console.log('🔧 Step 1: Testing ServiceFactory import...');
    
    // Try to import the compiled JavaScript version first
    let ServiceFactory;
    try {
      ServiceFactory = require(path.join(servicesPath, 'ServiceFactory.js')).ServiceFactory;
      console.log('  ✅ ServiceFactory imported from compiled JS');
    } catch (error) {
      console.log('  ⚠️  Compiled JS not available, checking TypeScript compilation...');
      console.log(`  Error: ${error.message}`);
      
      // Check if TypeScript files exist
      const tsPath = path.join(servicesPath, 'ServiceFactory.ts');
      const fs = require('fs');
      if (fs.existsSync(tsPath)) {
        console.log('  ✅ TypeScript source exists');
        console.log('  🔧 Need to compile TypeScript first');
        return { status: 'needs_compilation', message: 'TypeScript files need compilation' };
      } else {
        console.log('  ❌ ServiceFactory.ts not found');
        return { status: 'error', message: 'ServiceFactory source not found' };
      }
    }
    
    console.log('\n🧪 Step 2: Testing service instantiation...');
    
    // Test core services
    const coreServices = [
      'getDatabaseService',
      'getAuthService', 
      'getPaymentService',
      'getConfigService',
      'getLoggingService'
    ];
    
    const results = [];
    
    for (const serviceMethod of coreServices) {
      try {
        console.log(`  🔍 Testing ${serviceMethod}...`);
        
        if (typeof ServiceFactory[serviceMethod] === 'function') {
          console.log(`    ✅ ${serviceMethod} method exists`);
          
          // Try to call the method (but catch any instantiation errors)
          try {
            const service = ServiceFactory[serviceMethod]();
            console.log(`    ✅ ${serviceMethod} instantiated successfully`);
            results.push({ service: serviceMethod, status: 'success' });
          } catch (instantiationError) {
            console.log(`    ⚠️  ${serviceMethod} method exists but instantiation failed`);
            console.log(`    Error: ${instantiationError.message.substring(0, 100)}...`);
            results.push({ service: serviceMethod, status: 'instantiation_error', error: instantiationError.message });
          }
        } else {
          console.log(`    ❌ ${serviceMethod} method not found`);
          results.push({ service: serviceMethod, status: 'method_missing' });
        }
      } catch (error) {
        console.log(`    ❌ ${serviceMethod} test failed: ${error.message}`);
        results.push({ service: serviceMethod, status: 'error', error: error.message });
      }
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const successful = results.filter(r => r.status === 'success').length;
    const total = results.length;
    
    console.log(`✅ Successful instantiations: ${successful}/${total}`);
    
    if (successful === total) {
      console.log('\n🎉 ALL SERVICES WORKING PERFECTLY!');
      console.log('✅ ServiceFactory is fully functional');
      return { status: 'success', results };
    } else if (successful > 0) {
      console.log('\n⚠️  PARTIAL SUCCESS');
      console.log('🔧 Some services working, others need attention');
      return { status: 'partial', results };
    } else {
      console.log('\n❌ NO SERVICES WORKING');
      console.log('🚨 ServiceFactory needs major fixes');
      return { status: 'failed', results };
    }
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error);
    return { status: 'error', error: error.message };
  }
}

// Run the test
testServiceFactory().then(result => {
  console.log(`\n📅 Completed at: ${new Date().toISOString()}`);
  
  // Save results
  const fs = require('fs');
  const reportPath = path.join(__dirname, '..', '_evidence', 'service_factory_test_report.json');
  const evidenceDir = path.dirname(reportPath);
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`📄 Test report saved to: ${reportPath}`);
  
  // Exit with appropriate code
  if (result.status === 'success') {
    process.exit(0);
  } else if (result.status === 'partial' || result.status === 'needs_compilation') {
    process.exit(1);
  } else {
    process.exit(2);
  }
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(3);
});

