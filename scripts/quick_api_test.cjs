# REQ-TEST: MERSIS-003
/**
 * Quick API Test Script
 * Tests all running APIs and provides status report
 */

const http = require('http');

class QuickAPITester {
  constructor() {
    this.runningAPIs = [
      { name: 'Payroll API', port: 3006, status: 'working' },
      { name: 'POS Restaurant', port: 3008, status: 'working' },
      { name: 'Digital Wallets', port: 3009, status: 'working' },
      { name: 'E-Commerce', port: 3011, status: 'GCP-Native' },
      { name: 'POS Retail', port: 3016, status: 'new' },
      { name: 'Resellers', port: 3017, status: 'new' },
      { name: 'Referrals', port: 3018, status: 'new' },
      { name: 'Merchant Portal', port: 3019, status: 'new' },
      { name: 'Compliance Engine', port: 3020, status: 'new' },
      { name: 'PaySurity Website', port: 3021, status: 'new' }
    ];
    
    this.results = {
      healthy: [],
      unhealthy: [],
      errors: []
    };
  }

  async testAPI(api) {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${api.port}/health`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              this.results.healthy.push({
                ...api,
                response: response
              });
              console.log(`✅ ${api.name} (Port ${api.port}) - HEALTHY`);
              resolve(true);
            } catch (error) {
              this.results.healthy.push({
                ...api,
                response: { status: 'OK', raw: data }
              });
              console.log(`✅ ${api.name} (Port ${api.port}) - HEALTHY (Raw response)`);
              resolve(true);
            }
          } else {
            this.results.unhealthy.push({
              ...api,
              error: `HTTP ${res.statusCode}`
            });
            console.log(`❌ ${api.name} (Port ${api.port}) - HTTP ${res.statusCode}`);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        this.results.unhealthy.push({
          ...api,
          error: error.message
        });
        console.log(`❌ ${api.name} (Port ${api.port}) - ${error.message}`);
        resolve(false);
      });
      
      req.setTimeout(3000, () => {
        req.destroy();
        this.results.unhealthy.push({
          ...api,
          error: 'Timeout'
        });
        console.log(`❌ ${api.name} (Port ${api.port}) - Timeout`);
        resolve(false);
      });
    });
  }

  async testAllAPIs() {
    console.log('🔍 Testing all running APIs...');
    console.log('');
    
    const testPromises = this.runningAPIs.map(api => this.testAPI(api));
    await Promise.all(testPromises);
    
    console.log('');
    console.log('📊 QUICK TEST RESULTS:');
    console.log('=====================');
    console.log('');
    
    console.log(`✅ Healthy APIs: ${this.results.healthy.length}`);
    console.log(`❌ Unhealthy APIs: ${this.results.unhealthy.length}`);
    console.log(`📊 Total Tested: ${this.runningAPIs.length}`);
    console.log('');
    
    if (this.results.healthy.length > 0) {
      console.log('🌐 WORKING ENDPOINTS:');
      this.results.healthy.forEach(api => {
        console.log(`   ✅ ${api.name}: http://localhost:${api.port}`);
        console.log(`      └─ Health: http://localhost:${api.port}/health`);
        if (api.status === 'new') {
          console.log(`      └─ Status: http://localhost:${api.port}/api/status`);
        }
      });
      console.log('');
    }
    
    if (this.results.unhealthy.length > 0) {
      console.log('❌ FAILED ENDPOINTS:');
      this.results.unhealthy.forEach(api => {
        console.log(`   ❌ ${api.name} (Port ${api.port}): ${api.error}`);
      });
      console.log('');
    }
    
    console.log('🎯 PHASE 1 COMPLETE: QUICK LOCAL TEST');
    console.log(`   - ${this.results.healthy.length} APIs successfully running`);
    console.log('   - Platform partially operational');
    console.log('   - Ready for Phase 2: Real Database Integration');
    console.log('');
    
    return this.results.healthy.length >= 5;
  }

  displayNextSteps() {
    console.log('🚀 NEXT STEPS FOR REAL DATABASE:');
    console.log('================================');
    console.log('');
    console.log('1. 🌐 Create GCP-Native Project:');
    console.log('   → Go to https://GCP-Native.com/dashboard');
    console.log('   → Click "New Project"');
    console.log('   → Wait 2-3 minutes for setup');
    console.log('');
    console.log('2. 🔑 Get API Keys:');
    console.log('   → Settings > API in GCP-Native dashboard');
    console.log('   → Copy Project URL → GCP-Native_URL');
    console.log('   → Copy anon public key → GCP-Native_ANON_KEY');
    console.log('   → Copy service_role key → GCP-Native_SERVICE_ROLE_KEY');
    console.log('');
    console.log('3. ⚙️ Configure Environment:');
    console.log('   → Copy .env.GCP-Native to .env');
    console.log('   → Replace placeholder values with your keys');
    console.log('');
    console.log('4. 🗄️ Deploy Database Schema:');
    console.log('   → Go to SQL Editor in GCP-Native');
    console.log('   → Copy contents of database/GCP-Native-schema.sql');
    console.log('   → Execute to create all tables');
    console.log('');
    console.log('5. 🚀 Restart with Real Database:');
    console.log('   → Stop current platform (Ctrl+C)');
    console.log('   → Run: node scripts/complete_platform_orchestrator.cjs');
    console.log('   → All APIs will now use persistent data!');
    console.log('');
  }
}

async function main() {
  console.log('🎯 PaySurity Platform - Quick API Test');
  console.log('======================================');
  console.log('');
  
  const tester = new QuickAPITester();
  const success = await tester.testAllAPIs();
  
  if (success) {
    tester.displayNextSteps();
  }
  
  return success;
}

if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = QuickAPITester;

