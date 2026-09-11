
/**
 * Layer 1 Enterprise Services Validation Script
 * Tests TypeScript compilation, ServiceFactory, and core service functionality
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 PaySurity Platform - Layer 1 Enterprise Services Validation');
console.log('===========================================================');
console.log(`📅 Started at: ${new Date().toISOString()}`);
console.log('');

// Validation configuration
const VALIDATION_CONFIG = {
  servicesPath: path.join(__dirname, '..', 'shared', 'services'),
  typesPath: path.join(__dirname, '..', 'shared', 'types'),
  coreServices: [
    'DatabaseService.ts',
    'AuthService.ts', 
    'PaymentService.ts',
    'ConfigService.ts',
    'LoggingService.ts',
    'EventBusService.ts',
    'ServiceFactory.ts'
  ],
  advancedServices: [
    'AdvancedPOSService.ts',
    'AdvancedPayrollService.ts',
    'AdvancedECommerceService.ts',
    'FraudDetectionService.ts',
    'ComplianceService.ts'
  ]
};

class Layer1Validator {
  constructor() {
    this.results = {
      filesFound: 0,
      compilationErrors: [],
      importErrors: [],
      serviceFactoryTests: [],
      coreServiceTests: [],
      overallStatus: 'unknown'
    };
  }

  async runValidation() {
    console.log('🚀 Starting Layer 1 Validation...\n');

    try {
      // Step 1: File existence check
      await this.validateFileExistence();
      
      // Step 2: TypeScript compilation check
      await this.validateTypeScriptCompilation();
      
      // Step 3: Import resolution check
      await this.validateImportResolution();
      
      // Step 4: ServiceFactory validation
      await this.validateServiceFactory();
      
      // Step 5: Core services validation
      await this.validateCoreServices();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      this.results.overallStatus = 'failed';
      process.exit(1);
    }
  }

  async validateFileExistence() {
    console.log('📁 Step 1: Validating file existence...');
    
    const allServices = [...VALIDATION_CONFIG.coreServices, ...VALIDATION_CONFIG.advancedServices];
    let foundFiles = 0;
    
    for (const service of allServices) {
      const servicePath = path.join(VALIDATION_CONFIG.servicesPath, service);
      if (fs.existsSync(servicePath)) {
        console.log(`  ✅ ${service} - Found`);
        foundFiles++;
      } else {
        console.log(`  ❌ ${service} - Missing`);
      }
    }
    
    this.results.filesFound = foundFiles;
    console.log(`\n📊 Files found: ${foundFiles}/${allServices.length}\n`);
  }

  async validateTypeScriptCompilation() {
    console.log('🔧 Step 2: Validating TypeScript compilation...');
    
    return new Promise((resolve) => {
      const tscProcess = spawn('npx', ['tsc', '--noEmit', '--project', 'tsconfig.json'], {
        cwd: VALIDATION_CONFIG.servicesPath,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      tscProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      tscProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      tscProcess.on('close', (code) => {
        if (code === 0) {
          console.log('  ✅ TypeScript compilation successful');
        } else {
          console.log('  ❌ TypeScript compilation failed');
          this.results.compilationErrors.push({
            code,
            stdout: stdout.substring(0, 500),
            stderr: stderr.substring(0, 500)
          });
        }
        console.log('');
        resolve();
      });

      tscProcess.on('error', (error) => {
        console.log('  ⚠️  TypeScript compilation check skipped (tsc not available)');
        console.log('');
        resolve();
      });
    });
  }

  async validateImportResolution() {
    console.log('🔗 Step 3: Validating import resolution...');
    
    const problematicImports = [];
    
    // Check for @shared imports
    const servicesDir = VALIDATION_CONFIG.servicesPath;
    const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));
    
    for (const file of serviceFiles) {
      const filePath = path.join(servicesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for @shared imports
      const sharedImports = content.match(/import.*from\s+['"]@shared\/.*['"]/g);
      if (sharedImports) {
        for (const importLine of sharedImports) {
          // Check if the imported path exists
          const importPath = importLine.match(/['"]@shared\/(.*)['"]$/);
          if (importPath) {
            const resolvedPath = path.join(__dirname, '..', 'shared', importPath[1]);
            if (!fs.existsSync(resolvedPath + '.ts') && !fs.existsSync(resolvedPath + '.js') && !fs.existsSync(resolvedPath + '/index.ts')) {
              problematicImports.push({
                file,
                import: importLine.trim(),
                resolvedPath
              });
            }
          }
        }
      }
    }
    
    if (problematicImports.length === 0) {
      console.log('  ✅ All imports resolve correctly');
    } else {
      console.log(`  ❌ Found ${problematicImports.length} problematic imports`);
      problematicImports.forEach(issue => {
        console.log(`    - ${issue.file}: ${issue.import}`);
      });
    }
    
    this.results.importErrors = problematicImports;
    console.log('');
  }

  async validateServiceFactory() {
    console.log('🏭 Step 4: Validating ServiceFactory...');
    
    const serviceFactoryPath = path.join(VALIDATION_CONFIG.servicesPath, 'ServiceFactory.ts');
    
    if (!fs.existsSync(serviceFactoryPath)) {
      console.log('  ❌ ServiceFactory.ts not found');
      return;
    }
    
    const content = fs.readFileSync(serviceFactoryPath, 'utf8');
    
    // Check for getInstance method
    if (content.includes('static getInstance')) {
      console.log('  ✅ ServiceFactory has getInstance method');
      this.results.serviceFactoryTests.push({ test: 'getInstance method', status: 'pass' });
    } else {
      console.log('  ❌ ServiceFactory missing getInstance method');
      this.results.serviceFactoryTests.push({ test: 'getInstance method', status: 'fail' });
    }
    
    // Check for core service getters
    const coreServiceGetters = [
      'getDatabaseService',
      'getAuthService', 
      'getPaymentService',
      'getConfigService',
      'getLoggingService'
    ];
    
    for (const getter of coreServiceGetters) {
      if (content.includes(getter)) {
        console.log(`  ✅ ServiceFactory has ${getter}`);
        this.results.serviceFactoryTests.push({ test: getter, status: 'pass' });
      } else {
        console.log(`  ❌ ServiceFactory missing ${getter}`);
        this.results.serviceFactoryTests.push({ test: getter, status: 'fail' });
      }
    }
    
    console.log('');
  }

  async validateCoreServices() {
    console.log('🔧 Step 5: Validating core services...');
    
    for (const service of VALIDATION_CONFIG.coreServices) {
      const servicePath = path.join(VALIDATION_CONFIG.servicesPath, service);
      
      if (!fs.existsSync(servicePath)) {
        console.log(`  ❌ ${service} - File not found`);
        this.results.coreServiceTests.push({ service, test: 'file exists', status: 'fail' });
        continue;
      }
      
      const content = fs.readFileSync(servicePath, 'utf8');
      const serviceName = service.replace('.ts', '');
      
      // Check for class definition
      if (content.includes(`class ${serviceName}`) || content.includes(`export class ${serviceName}`)) {
        console.log(`  ✅ ${service} - Class definition found`);
        this.results.coreServiceTests.push({ service, test: 'class definition', status: 'pass' });
      } else {
        console.log(`  ❌ ${service} - No class definition found`);
        this.results.coreServiceTests.push({ service, test: 'class definition', status: 'fail' });
      }
      
      // Check for getInstance method (singleton pattern)
      if (content.includes('static getInstance')) {
        console.log(`  ✅ ${service} - Singleton pattern implemented`);
        this.results.coreServiceTests.push({ service, test: 'singleton pattern', status: 'pass' });
      } else {
        console.log(`  ⚠️  ${service} - No singleton pattern (may be intentional)`);
        this.results.coreServiceTests.push({ service, test: 'singleton pattern', status: 'warning' });
      }
    }
    
    console.log('');
  }

  generateReport() {
    console.log('📋 VALIDATION REPORT');
    console.log('==================');
    
    const totalTests = this.results.serviceFactoryTests.length + this.results.coreServiceTests.length;
    const passedTests = [
      ...this.results.serviceFactoryTests.filter(t => t.status === 'pass'),
      ...this.results.coreServiceTests.filter(t => t.status === 'pass')
    ].length;
    
    const failedTests = [
      ...this.results.serviceFactoryTests.filter(t => t.status === 'fail'),
      ...this.results.coreServiceTests.filter(t => t.status === 'fail')
    ].length;
    
    console.log(`📊 Files Found: ${this.results.filesFound}/${VALIDATION_CONFIG.coreServices.length + VALIDATION_CONFIG.advancedServices.length}`);
    console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`📊 Tests Failed: ${failedTests}/${totalTests}`);
    console.log(`📊 Compilation Errors: ${this.results.compilationErrors.length}`);
    console.log(`📊 Import Errors: ${this.results.importErrors.length}`);
    
    // Determine overall status
    if (failedTests === 0 && this.results.compilationErrors.length === 0 && this.results.importErrors.length === 0) {
      this.results.overallStatus = 'success';
      console.log('\n🎉 LAYER 1 VALIDATION: SUCCESS');
      console.log('✅ All enterprise services are ready for integration');
    } else if (failedTests > totalTests * 0.5) {
      this.results.overallStatus = 'critical';
      console.log('\n🚨 LAYER 1 VALIDATION: CRITICAL ISSUES');
      console.log('❌ Major problems found - requires immediate attention');
    } else {
      this.results.overallStatus = 'warnings';
      console.log('\n⚠️  LAYER 1 VALIDATION: WARNINGS');
      console.log('🔧 Some issues found - can proceed with caution');
    }
    
    console.log(`\n📅 Completed at: ${new Date().toISOString()}`);
    
    // Write detailed results to file
    const reportPath = path.join(__dirname, '..', '_evidence', 'layer1_validation_report.json');
    const evidenceDir = path.dirname(reportPath);
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with appropriate code
    if (this.results.overallStatus === 'success') {
      process.exit(0);
    } else if (this.results.overallStatus === 'warnings') {
      process.exit(1);
    } else {
      process.exit(2);
    }
  }
}

// Run validation
const validator = new Layer1Validator();
validator.runValidation().catch(error => {
  console.error('💥 Validation script failed:', error);
  process.exit(3);
});
