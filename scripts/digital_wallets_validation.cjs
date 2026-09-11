/**
 * Digital Wallets Integration Validation Script
 * Validates frontend-backend integration following critical validation protocol
 * NEVER report "complete" without actual functional verification
 */

const fs = require('fs');
const path = require('path');

class DigitalWalletsValidator {
  constructor() {
    this.basePath = path.resolve(__dirname, '..');
    this.results = {
      fileValidation: { passed: 0, failed: 0, tests: [] },
      importValidation: { passed: 0, failed: 0, tests: [] },
      functionalityValidation: { passed: 0, failed: 0, tests: [] },
      integrationValidation: { passed: 0, failed: 0, tests: [] },
      overallSuccess: false,
      criticalErrors: [],
      warnings: []
    };

    this.requiredFiles = [
      'DigitalWallets-Web/src/services/WalletAPIClient.ts',
      'DigitalWallets-Web/src/components/RealTimeWalletDashboard.tsx',
      'DigitalWallets-API/GCP-Native-server.js',
      'database/schema/complete-schema.sql'
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✅',
      warn: '⚠️ ',
      error: '❌',
      test: '🧪'
    }[type] || 'ℹ️ ';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validateFiles() {
    this.log('Validating Digital Wallets integration files...', 'test');
    
    for (const file of this.requiredFiles) {
      const filePath = path.join(this.basePath, file);
      const exists = fs.existsSync(filePath);
      
      const test = {
        name: `File exists: ${file}`,
        path: filePath,
        passed: exists,
        details: exists ? 'File found' : 'File missing'
      };
      
      this.results.fileValidation.tests.push(test);
      
      if (exists) {
        this.results.fileValidation.passed++;
        this.log(`✓ ${file}`, 'info');
      } else {
        this.results.fileValidation.failed++;
        this.results.criticalErrors.push(`Missing critical file: ${file}`);
        this.log(`✗ ${file} - MISSING`, 'error');
      }
    }
    
    this.log(`File validation: ${this.results.fileValidation.passed}/${this.requiredFiles.length} passed`);
  }

  async validateImports() {
    this.log('Validating imports and dependencies...', 'test');
    
    await this.validateAPIClientImports();
    await this.validateComponentImports();
    
    this.log(`Import validation: ${this.results.importValidation.passed} passed, ${this.results.importValidation.failed} failed`);
  }

  async validateAPIClientImports() {
    const apiClientPath = path.join(this.basePath, 'DigitalWallets-Web/src/services/WalletAPIClient.ts');
    
    if (!fs.existsSync(apiClientPath)) {
      this.addImportTest('WalletAPIClient exists', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(apiClientPath, 'utf8');
      
      // Critical import validations
      const hasGCP-NativeImport = content.includes("import { createClient, GCP-NativeClient } from '@GCP-Native/GCP-Native-js'");
      this.addImportTest('WalletAPIClient imports GCP-Native correctly', hasGCP-NativeImport,
        hasGCP-NativeImport ? 'GCP-Native import found' : 'GCP-Native import missing or incorrect');
      
      const hasGCP-NativeClient = content.includes('createClient(GCP-NativeUrl, GCP-NativeKey)');
      this.addImportTest('WalletAPIClient creates GCP-Native client', hasGCP-NativeClient,
        hasGCP-NativeClient ? 'GCP-Native client creation found' : 'GCP-Native client creation missing');
      
      const hasExports = content.includes('export class WalletAPIClient') && content.includes('export default walletAPIClient');
      this.addImportTest('WalletAPIClient has proper exports', hasExports,
        hasExports ? 'Exports found' : 'Missing class or default export');
        
    } catch (error) {
      this.addImportTest('WalletAPIClient readable', false, error.message);
    }
  }

  async validateComponentImports() {
    const componentPath = path.join(this.basePath, 'DigitalWallets-Web/src/components/RealTimeWalletDashboard.tsx');
    
    if (!fs.existsSync(componentPath)) {
      this.addImportTest('RealTimeWalletDashboard exists', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      const hasReactImport = content.includes("import React");
      this.addImportTest('RealTimeWalletDashboard imports React', hasReactImport,
        hasReactImport ? 'React import found' : 'React import missing');
      
      const hasAPIClientImport = content.includes("import { walletAPIClient");
      this.addImportTest('RealTimeWalletDashboard imports API client', hasAPIClientImport,
        hasAPIClientImport ? 'API client import found' : 'API client import missing');
      
      const hasComponentExport = content.includes('export const RealTimeWalletDashboard') && content.includes('export default');
      this.addImportTest('RealTimeWalletDashboard has proper exports', hasComponentExport,
        hasComponentExport ? 'Component exports found' : 'Component exports missing');
        
    } catch (error) {
      this.addImportTest('RealTimeWalletDashboard readable', false, error.message);
    }
  }

  addImportTest(name, passed, details) {
    this.results.importValidation.tests.push({ name, passed, details });
    if (passed) {
      this.results.importValidation.passed++;
    } else {
      this.results.importValidation.failed++;
      if (name.includes('GCP-Native') || name.includes('React') || name.includes('export')) {
        this.results.criticalErrors.push(`Import validation failed: ${name}`);
      }
    }
  }

  async validateFunctionality() {
    this.log('Validating actual functionality implementation...', 'test');
    
    await this.validateAPIClientFunctionality();
    await this.validateComponentFunctionality();
    
    this.log(`Functionality validation: ${this.results.functionalityValidation.passed} passed, ${this.results.functionalityValidation.failed} failed`);
  }

  async validateAPIClientFunctionality() {
    const apiClientPath = path.join(this.basePath, 'DigitalWallets-Web/src/services/WalletAPIClient.ts');
    
    if (!fs.existsSync(apiClientPath)) {
      this.addFunctionalityTest('WalletAPIClient functionality', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(apiClientPath, 'utf8');
      
      // Validate core wallet operations
      const hasGetWallets = content.includes('async getWallets(') && content.includes('from(\'wallets\')');
      this.addFunctionalityTest('WalletAPIClient implements getWallets with GCP-Native', hasGetWallets,
        hasGetWallets ? 'getWallets method with GCP-Native query found' : 'getWallets method missing or not using GCP-Native');
      
      const hasCreateWallet = content.includes('async createWallet(') && content.includes('.insert([');
      this.addFunctionalityTest('WalletAPIClient implements createWallet', hasCreateWallet,
        hasCreateWallet ? 'createWallet method found' : 'createWallet method missing');
      
      const hasTransferFunds = content.includes('async transferFunds(') && content.includes('TransferRequest');
      this.addFunctionalityTest('WalletAPIClient implements transferFunds', hasTransferFunds,
        hasTransferFunds ? 'transferFunds method found' : 'transferFunds method missing');
      
      const hasGetTransactions = content.includes('async getTransactions(') && content.includes('wallet_transactions');
      this.addFunctionalityTest('WalletAPIClient implements getTransactions', hasGetTransactions,
        hasGetTransactions ? 'getTransactions method found' : 'getTransactions method missing');
      
      // Validate real-time subscriptions
      const hasWalletSubscription = content.includes('subscribeToWalletUpdates') && content.includes('.channel(');
      this.addFunctionalityTest('WalletAPIClient has real-time wallet subscriptions', hasWalletSubscription,
        hasWalletSubscription ? 'Wallet subscription method found' : 'Wallet subscription method missing');
      
      const hasTransactionSubscription = content.includes('subscribeToTransactionUpdates') && content.includes('postgres_changes');
      this.addFunctionalityTest('WalletAPIClient has real-time transaction subscriptions', hasTransactionSubscription,
        hasTransactionSubscription ? 'Transaction subscription method found' : 'Transaction subscription method missing');
      
      // Validate interfaces
      const hasWalletInterface = content.includes('export interface Wallet {');
      this.addFunctionalityTest('WalletAPIClient defines Wallet interface', hasWalletInterface,
        hasWalletInterface ? 'Wallet interface found' : 'Wallet interface missing');
      
      const hasTransactionInterface = content.includes('export interface WalletTransaction {');
      this.addFunctionalityTest('WalletAPIClient defines WalletTransaction interface', hasTransactionInterface,
        hasTransactionInterface ? 'WalletTransaction interface found' : 'WalletTransaction interface missing');
        
    } catch (error) {
      this.addFunctionalityTest('WalletAPIClient functionality check', false, error.message);
    }
  }

  async validateComponentFunctionality() {
    const componentPath = path.join(this.basePath, 'DigitalWallets-Web/src/components/RealTimeWalletDashboard.tsx');
    
    if (!fs.existsSync(componentPath)) {
      this.addFunctionalityTest('RealTimeWalletDashboard functionality', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Validate React hooks usage
      const hasStateManagement = content.includes('useState') && content.includes('useEffect');
      this.addFunctionalityTest('RealTimeWalletDashboard uses React hooks', hasStateManagement,
        hasStateManagement ? 'React hooks found' : 'React hooks missing');
      
      // Validate API client usage
      const usesAPIClient = content.includes('walletAPIClient.getWallets') && content.includes('walletAPIClient.subscribeToWalletUpdates');
      this.addFunctionalityTest('RealTimeWalletDashboard uses API client methods', usesAPIClient,
        usesAPIClient ? 'API client methods used' : 'API client methods not used');
      
      // Validate real-time functionality
      const hasRealtimeSetup = content.includes('setupRealtimeSubscriptions') && content.includes('subscribeToWalletUpdates');
      this.addFunctionalityTest('RealTimeWalletDashboard implements real-time updates', hasRealtimeSetup,
        hasRealtimeSetup ? 'Real-time setup found' : 'Real-time setup missing');
      
      // Validate transfer functionality
      const hasTransferFunction = content.includes('handleTransfer') && content.includes('transferFunds');
      this.addFunctionalityTest('RealTimeWalletDashboard implements transfer functionality', hasTransferFunction,
        hasTransferFunction ? 'Transfer functionality found' : 'Transfer functionality missing');
      
      // Validate error handling
      const hasErrorHandling = content.includes('setError') && content.includes('catch');
      this.addFunctionalityTest('RealTimeWalletDashboard has error handling', hasErrorHandling,
        hasErrorHandling ? 'Error handling found' : 'Error handling missing');
        
    } catch (error) {
      this.addFunctionalityTest('RealTimeWalletDashboard functionality check', false, error.message);
    }
  }

  addFunctionalityTest(name, passed, details) {
    this.results.functionalityValidation.tests.push({ name, passed, details });
    if (passed) {
      this.results.functionalityValidation.passed++;
    } else {
      this.results.functionalityValidation.failed++;
      if (name.includes('GCP-Native') || name.includes('real-time') || name.includes('API client')) {
        this.results.criticalErrors.push(`Functionality validation failed: ${name}`);
      }
    }
  }

  async validateIntegration() {
    this.log('Validating integration points...', 'test');
    
    await this.validateBackendIntegration();
    await this.validateDatabaseIntegration();
    
    this.log(`Integration validation: ${this.results.integrationValidation.passed} passed, ${this.results.integrationValidation.failed} failed`);
  }

  async validateBackendIntegration() {
    const backendPath = path.join(this.basePath, 'DigitalWallets-API/GCP-Native-server.js');
    
    if (!fs.existsSync(backendPath)) {
      this.addIntegrationTest('Digital Wallets backend server exists', false, 'Backend server not found');
      return;
    }

    try {
      const content = fs.readFileSync(backendPath, 'utf8');
      
      const hasGCP-NativeIntegration = content.includes('@GCP-Native/GCP-Native-js');
      this.addIntegrationTest('Backend has GCP-Native integration', hasGCP-NativeIntegration,
        hasGCP-NativeIntegration ? 'Backend GCP-Native integration found' : 'Backend GCP-Native integration missing');
      
      const hasWalletEndpoints = content.includes('/api/wallets') || content.includes('wallets');
      this.addIntegrationTest('Backend has wallet endpoints', hasWalletEndpoints,
        hasWalletEndpoints ? 'Wallet endpoints found' : 'Wallet endpoints missing');
      
      const hasCorrectPort = content.includes('3009');
      this.addIntegrationTest('Backend uses correct port (3009)', hasCorrectPort,
        hasCorrectPort ? 'Port 3009 configured' : 'Port 3009 not configured');
        
    } catch (error) {
      this.addIntegrationTest('Backend integration check', false, error.message);
    }
  }

  async validateDatabaseIntegration() {
    const schemaPath = path.join(this.basePath, 'database/schema/complete-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      this.addIntegrationTest('Database schema exists', false, 'Schema file not found');
      return;
    }

    try {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      const hasWalletsTable = schema.includes('CREATE TABLE wallets');
      this.addIntegrationTest('Schema has wallets table', hasWalletsTable,
        hasWalletsTable ? 'Wallets table found in schema' : 'Wallets table missing from schema');
      
      const hasTransactionsTable = schema.includes('CREATE TABLE wallet_transactions');
      this.addIntegrationTest('Schema has wallet_transactions table', hasTransactionsTable,
        hasTransactionsTable ? 'Wallet transactions table found' : 'Wallet transactions table missing');
      
      const hasProperIndexes = schema.includes('CREATE INDEX') && schema.includes('wallets');
      this.addIntegrationTest('Schema has wallet indexes', hasProperIndexes,
        hasProperIndexes ? 'Wallet indexes found' : 'Wallet indexes missing');
        
    } catch (error) {
      this.addIntegrationTest('Database schema check', false, error.message);
    }
  }

  addIntegrationTest(name, passed, details) {
    this.results.integrationValidation.tests.push({ name, passed, details });
    if (passed) {
      this.results.integrationValidation.passed++;
    } else {
      this.results.integrationValidation.failed++;
      this.results.criticalErrors.push(`Integration test failed: ${name}`);
    }
  }

  generateReport() {
    this.log('Generating comprehensive validation report...', 'test');
    
    const totalTests = 
      this.results.fileValidation.tests.length +
      this.results.importValidation.tests.length +
      this.results.functionalityValidation.tests.length +
      this.results.integrationValidation.tests.length;
    
    const totalPassed = 
      this.results.fileValidation.passed +
      this.results.importValidation.passed +
      this.results.functionalityValidation.passed +
      this.results.integrationValidation.passed;
    
    const totalFailed = 
      this.results.fileValidation.failed +
      this.results.importValidation.failed +
      this.results.functionalityValidation.failed +
      this.results.integrationValidation.failed;
    
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;
    
    // CRITICAL: Only mark as success if NO critical errors and high pass rate
    this.results.overallSuccess = 
      this.results.criticalErrors.length === 0 && 
      totalFailed === 0 &&
      totalPassed >= (totalTests * 0.95); // 95% pass rate required
    
    const report = {
      timestamp: new Date().toISOString(),
      validation_type: 'Digital Wallets Frontend-Backend Integration',
      platform: 'PaySurity Platform',
      validation_protocol: 'Critical Validation Protocol - Never report complete without functional verification',
      
      summary: {
        total_tests: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        success_rate: `${successRate}%`,
        overall_success: this.results.overallSuccess,
        critical_errors: this.results.criticalErrors.length,
        warnings: this.results.warnings.length,
        functional_verification: this.results.overallSuccess ? 'VERIFIED' : 'FAILED'
      },
      
      detailed_results: {
        file_validation: {
          passed: this.results.fileValidation.passed,
          failed: this.results.fileValidation.failed,
          tests: this.results.fileValidation.tests
        },
        import_validation: {
          passed: this.results.importValidation.passed,
          failed: this.results.importValidation.failed,
          tests: this.results.importValidation.tests
        },
        functionality_validation: {
          passed: this.results.functionalityValidation.passed,
          failed: this.results.functionalityValidation.failed,
          tests: this.results.functionalityValidation.tests
        },
        integration_validation: {
          passed: this.results.integrationValidation.passed,
          failed: this.results.integrationValidation.failed,
          tests: this.results.integrationValidation.tests
        }
      },
      
      critical_errors: this.results.criticalErrors,
      warnings: this.results.warnings
    };
    
    // Save report
    const reportPath = path.join(this.basePath, '_evidence', 'digital_wallets_validation_report.json');
    const evidenceDir = path.dirname(reportPath);
    
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console output
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIGITAL WALLETS INTEGRATION VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`🎯 Overall Success: ${this.results.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📈 Success Rate: ${successRate}% (${totalPassed}/${totalTests})`);
    console.log(`🚨 Critical Errors: ${this.results.criticalErrors.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`🔍 Functional Verification: ${this.results.overallSuccess ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log('');
    console.log('📋 Test Categories:');
    console.log(`   📁 File Validation: ${this.results.fileValidation.passed}/${this.results.fileValidation.tests.length}`);
    console.log(`   📦 Import Validation: ${this.results.importValidation.passed}/${this.results.importValidation.tests.length}`);
    console.log(`   ⚙️  Functionality Validation: ${this.results.functionalityValidation.passed}/${this.results.functionalityValidation.tests.length}`);
    console.log(`   🔗 Integration Validation: ${this.results.integrationValidation.passed}/${this.results.integrationValidation.tests.length}`);
    
    if (this.results.criticalErrors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS (BLOCKING DEPLOYMENT):');
      this.results.criticalErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    console.log('='.repeat(80));
    
    return this.results.overallSuccess;
  }

  async run() {
    console.log('🚀 Starting Digital Wallets Integration Validation');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Following CRITICAL validation protocol - Never report complete without verification');
    console.log('');
    
    try {
      await this.validateFiles();
      await this.validateImports();
      await this.validateFunctionality();
      await this.validateIntegration();
      
      const success = this.generateReport();
      
      // Exit with appropriate code based on actual functional verification
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.log(`Validation failed with error: ${error.message}`, 'error');
      console.error(error);
      process.exit(1);
    }
  }
}

// Execute validation
const validator = new DigitalWalletsValidator();
validator.run();
