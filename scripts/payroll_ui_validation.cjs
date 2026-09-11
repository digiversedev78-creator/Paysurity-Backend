/**
 * Payroll UI Integration Validation Script
 * Validates Payroll frontend-backend integration following critical validation protocol
 */

const fs = require('fs');
const path = require('path');

class PayrollUIValidator {
  constructor() {
    this.basePath = path.resolve(__dirname, '..');
    this.results = {
      fileValidation: { passed: 0, failed: 0, tests: [] },
      integrationValidation: { passed: 0, failed: 0, tests: [] },
      functionalityValidation: { passed: 0, failed: 0, tests: [] },
      overallSuccess: false,
      criticalErrors: [],
      warnings: []
    };

    this.requiredFiles = [
      'Payroll-UI/src/services/PayrollAPIClient.ts',
      'Payroll-UI/src/App.tsx',
      'Payroll-API/GCP-Native-server.js',
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
    this.log('Validating Payroll UI integration files...', 'test');
    
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
        this.results.criticalErrors.push(`Missing file: ${file}`);
        this.log(`✗ ${file} - MISSING`, 'error');
      }
    }
    
    this.log(`File validation: ${this.results.fileValidation.passed}/${this.requiredFiles.length} passed`);
  }

  async validateIntegration() {
    this.log('Validating Payroll UI integration...', 'test');
    
    await this.validateAPIClientIntegration();
    await this.validateBackendConnection();
    await this.validateDatabaseAlignment();
    
    this.log(`Integration validation: ${this.results.integrationValidation.passed} passed, ${this.results.integrationValidation.failed} failed`);
  }

  async validateAPIClientIntegration() {
    const apiClientPath = path.join(this.basePath, 'Payroll-UI/src/services/PayrollAPIClient.ts');
    
    if (!fs.existsSync(apiClientPath)) {
      this.addIntegrationTest('PayrollAPIClient exists', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(apiClientPath, 'utf8');
      
      const hasGCP-NativeImport = content.includes('@GCP-Native/GCP-Native-js');
      this.addIntegrationTest('PayrollAPIClient imports GCP-Native', hasGCP-NativeImport,
        hasGCP-NativeImport ? 'GCP-Native import found' : 'GCP-Native import missing');
      
      const hasGCP-NativeClient = content.includes('createClient');
      this.addIntegrationTest('PayrollAPIClient creates GCP-Native client', hasGCP-NativeClient,
        hasGCP-NativeClient ? 'GCP-Native client creation found' : 'GCP-Native client creation missing');
      
      const hasEmployeeMethod = content.includes('getEmployees');
      this.addIntegrationTest('PayrollAPIClient has employee methods', hasEmployeeMethod,
        hasEmployeeMethod ? 'Employee methods found' : 'Employee methods missing');
      
      const hasGCP-NativeQuery = content.includes('payroll_employees');
      this.addIntegrationTest('PayrollAPIClient queries payroll_employees table', hasGCP-NativeQuery,
        hasGCP-NativeQuery ? 'Database table queries found' : 'Database table queries missing');
      
      const hasRealTimeSupport = content.includes('subscribeToEmployeeUpdates');
      this.addIntegrationTest('PayrollAPIClient has real-time support', hasRealTimeSupport,
        hasRealTimeSupport ? 'Real-time subscriptions found' : 'Real-time subscriptions missing');
        
    } catch (error) {
      this.addIntegrationTest('PayrollAPIClient readable', false, error.message);
    }
  }

  async validateBackendConnection() {
    const backendPath = path.join(this.basePath, 'Payroll-API/GCP-Native-server.js');
    
    if (!fs.existsSync(backendPath)) {
      this.addIntegrationTest('Payroll backend server exists', false, 'Backend server not found');
      return;
    }

    try {
      const content = fs.readFileSync(backendPath, 'utf8');
      
      const hasGCP-NativeIntegration = content.includes('@GCP-Native/GCP-Native-js');
      this.addIntegrationTest('Backend has GCP-Native integration', hasGCP-NativeIntegration,
        hasGCP-NativeIntegration ? 'Backend GCP-Native integration found' : 'Backend GCP-Native integration missing');
      
      const hasEmployeeEndpoints = content.includes('/api/employees');
      this.addIntegrationTest('Backend has employee endpoints', hasEmployeeEndpoints,
        hasEmployeeEndpoints ? 'Employee endpoints found' : 'Employee endpoints missing');
      
      const hasCorrectPort = content.includes('3006');
      this.addIntegrationTest('Backend uses correct port (3006)', hasCorrectPort,
        hasCorrectPort ? 'Port 3006 configured' : 'Port 3006 not configured');
        
    } catch (error) {
      this.addIntegrationTest('Backend server readable', false, error.message);
    }
  }

  async validateDatabaseAlignment() {
    const schemaPath = path.join(this.basePath, 'database/schema/complete-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      this.addIntegrationTest('Database schema exists', false, 'Schema file not found');
      return;
    }

    try {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      const hasPayrollEmployeesTable = schema.includes('CREATE TABLE payroll_employees');
      this.addIntegrationTest('Schema has payroll_employees table', hasPayrollEmployeesTable,
        hasPayrollEmployeesTable ? 'Payroll employees table found' : 'Payroll employees table missing');
      
      const hasPayrollRunsTable = schema.includes('CREATE TABLE payroll_runs');
      this.addIntegrationTest('Schema has payroll_runs table', hasPayrollRunsTable,
        hasPayrollRunsTable ? 'Payroll runs table found' : 'Payroll runs table missing');
        
    } catch (error) {
      this.addIntegrationTest('Database schema readable', false, error.message);
    }
  }

  addIntegrationTest(name, passed, details) {
    this.results.integrationValidation.tests.push({ name, passed, details });
    if (passed) {
      this.results.integrationValidation.passed++;
    } else {
      this.results.integrationValidation.failed++;
      if (name.includes('GCP-Native') || name.includes('employee') || name.includes('Backend')) {
        this.results.criticalErrors.push(`Integration test failed: ${name}`);
      }
    }
  }

  async validateFunctionality() {
    this.log('Validating Payroll UI functionality...', 'test');
    
    await this.validateReactComponents();
    await this.validateTypeDefinitions();
    
    this.log(`Functionality validation: ${this.results.functionalityValidation.passed} passed, ${this.results.functionalityValidation.failed} failed`);
  }

  async validateReactComponents() {
    const appPath = path.join(this.basePath, 'Payroll-UI/src/App.tsx');
    
    if (!fs.existsSync(appPath)) {
      this.addFunctionalityTest('Payroll UI App component exists', false, 'App.tsx not found');
      return;
    }

    try {
      const content = fs.readFileSync(appPath, 'utf8');
      
      const hasReactImport = content.includes('import React');
      this.addFunctionalityTest('App component imports React', hasReactImport,
        hasReactImport ? 'React import found' : 'React import missing');
      
      const hasPayrollComponents = content.includes('PayrollDashboard') && content.includes('EmployeeManagement');
      this.addFunctionalityTest('App has payroll components', hasPayrollComponents,
        hasPayrollComponents ? 'Payroll components found' : 'Payroll components missing');
      
      const hasNavigation = content.includes('Navigation');
      this.addFunctionalityTest('App has navigation', hasNavigation,
        hasNavigation ? 'Navigation component found' : 'Navigation component missing');
        
    } catch (error) {
      this.addFunctionalityTest('App component readable', false, error.message);
    }
  }

  async validateTypeDefinitions() {
    const apiClientPath = path.join(this.basePath, 'Payroll-UI/src/services/PayrollAPIClient.ts');
    
    if (fs.existsSync(apiClientPath)) {
      const content = fs.readFileSync(apiClientPath, 'utf8');
      
      const hasEmployeeInterface = content.includes('interface Employee');
      this.addFunctionalityTest('PayrollAPIClient has Employee interface', hasEmployeeInterface,
        hasEmployeeInterface ? 'Employee interface found' : 'Employee interface missing');
      
      const hasPayrollRunInterface = content.includes('interface PayrollRun');
      this.addFunctionalityTest('PayrollAPIClient has PayrollRun interface', hasPayrollRunInterface,
        hasPayrollRunInterface ? 'PayrollRun interface found' : 'PayrollRun interface missing');
      
      const hasAnalyticsInterface = content.includes('interface PayrollAnalytics');
      this.addFunctionalityTest('PayrollAPIClient has PayrollAnalytics interface', hasAnalyticsInterface,
        hasAnalyticsInterface ? 'PayrollAnalytics interface found' : 'PayrollAnalytics interface missing');
    }
  }

  addFunctionalityTest(name, passed, details) {
    this.results.functionalityValidation.tests.push({ name, passed, details });
    if (passed) {
      this.results.functionalityValidation.passed++;
    } else {
      this.results.functionalityValidation.failed++;
      if (name.includes('React') || name.includes('interface')) {
        this.results.warnings.push(`Functionality warning: ${name}`);
      }
    }
  }

  generateReport() {
    this.log('Generating validation report...', 'test');
    
    const totalTests = 
      this.results.fileValidation.tests.length +
      this.results.integrationValidation.tests.length +
      this.results.functionalityValidation.tests.length;
    
    const totalPassed = 
      this.results.fileValidation.passed +
      this.results.integrationValidation.passed +
      this.results.functionalityValidation.passed;
    
    const totalFailed = 
      this.results.fileValidation.failed +
      this.results.integrationValidation.failed +
      this.results.functionalityValidation.failed;
    
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : 0;
    
    this.results.overallSuccess = 
      this.results.criticalErrors.length === 0 && 
      totalFailed === 0 &&
      totalPassed >= (totalTests * 0.90);
    
    const report = {
      timestamp: new Date().toISOString(),
      validation_type: 'Payroll UI Frontend-Backend Integration',
      platform: 'PaySurity Platform',
      
      summary: {
        total_tests: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        success_rate: `${successRate}%`,
        overall_success: this.results.overallSuccess,
        critical_errors: this.results.criticalErrors.length,
        warnings: this.results.warnings.length
      },
      
      detailed_results: {
        file_validation: {
          passed: this.results.fileValidation.passed,
          failed: this.results.fileValidation.failed,
          tests: this.results.fileValidation.tests
        },
        integration_validation: {
          passed: this.results.integrationValidation.passed,
          failed: this.results.integrationValidation.failed,
          tests: this.results.integrationValidation.tests
        },
        functionality_validation: {
          passed: this.results.functionalityValidation.passed,
          failed: this.results.functionalityValidation.failed,
          tests: this.results.functionalityValidation.tests
        }
      },
      
      critical_errors: this.results.criticalErrors,
      warnings: this.results.warnings
    };
    
    // Save report
    const reportPath = path.join(this.basePath, '_evidence', 'payroll_ui_validation_report.json');
    const evidenceDir = path.dirname(reportPath);
    
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console output
    console.log('\n' + '='.repeat(80));
    console.log('📊 PAYROLL UI INTEGRATION VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`🎯 Overall Success: ${this.results.overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📈 Success Rate: ${successRate}% (${totalPassed}/${totalTests})`);
    console.log(`🚨 Critical Errors: ${this.results.criticalErrors.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log('');
    console.log('📋 Test Categories:');
    console.log(`   📁 File Validation: ${this.results.fileValidation.passed}/${this.results.fileValidation.tests.length}`);
    console.log(`   🔗 Integration Validation: ${this.results.integrationValidation.passed}/${this.results.integrationValidation.tests.length}`);
    console.log(`   ⚛️  Functionality Validation: ${this.results.functionalityValidation.passed}/${this.results.functionalityValidation.tests.length}`);
    
    if (this.results.criticalErrors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS:');
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
    console.log('🚀 Starting Payroll UI Integration Validation');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Following critical validation protocol');
    console.log('');
    
    try {
      await this.validateFiles();
      await this.validateIntegration();
      await this.validateFunctionality();
      
      const success = this.generateReport();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.log(`Validation failed with error: ${error.message}`, 'error');
      console.error(error);
      process.exit(1);
    }
  }
}

// Execute validation
const validator = new PayrollUIValidator();
validator.run();
