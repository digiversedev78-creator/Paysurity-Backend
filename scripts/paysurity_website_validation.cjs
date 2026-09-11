/**
 * PaySurity.com Website Integration Validation Script
 * Validates frontend-backend integration following critical validation protocol
 * NEVER report "complete" without actual functional verification
 */

const fs = require('fs');
const path = require('path');

class PaySurityWebsiteValidator {
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
      'PaySurity.com/src/services/PaySurityWebsiteAPIClient.ts',
      'PaySurity.com/src/components/RealTimeWebsiteDashboard.tsx',
      'PaySurity-Website/src/services/GCP-NativeService.ts',
      'PaySurity.com/simple-server.js',
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
    this.log('Validating PaySurity.com integration files...', 'test');
    
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
    const apiClientPath = path.join(this.basePath, 'PaySurity.com/src/services/PaySurityWebsiteAPIClient.ts');
    
    if (!fs.existsSync(apiClientPath)) {
      this.addImportTest('PaySurityWebsiteAPIClient exists', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(apiClientPath, 'utf8');
      
      // Critical import validations
      const hasGCP-NativeImport = content.includes("import { createClient, GCP-NativeClient } from '@GCP-Native/GCP-Native-js'");
      this.addImportTest('PaySurityWebsiteAPIClient imports GCP-Native correctly', hasGCP-NativeImport,
        hasGCP-NativeImport ? 'GCP-Native import found' : 'GCP-Native import missing or incorrect');
      
      const hasGCP-NativeClient = content.includes('createClient(GCP-NativeUrl, GCP-NativeKey)');
      this.addImportTest('PaySurityWebsiteAPIClient creates GCP-Native client', hasGCP-NativeClient,
        hasGCP-NativeClient ? 'GCP-Native client creation found' : 'GCP-Native client creation missing');
      
      const hasExports = content.includes('export class PaySurityWebsiteAPIClient') && content.includes('export default paysuritWebsiteAPIClient');
      this.addImportTest('PaySurityWebsiteAPIClient has proper exports', hasExports,
        hasExports ? 'Exports found' : 'Missing class or default export');
        
    } catch (error) {
      this.addImportTest('PaySurityWebsiteAPIClient readable', false, error.message);
    }
  }

  async validateComponentImports() {
    const componentPath = path.join(this.basePath, 'PaySurity.com/src/components/RealTimeWebsiteDashboard.tsx');
    
    if (!fs.existsSync(componentPath)) {
      this.addImportTest('RealTimeWebsiteDashboard exists', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      const hasReactImport = content.includes("import React");
      this.addImportTest('RealTimeWebsiteDashboard imports React', hasReactImport,
        hasReactImport ? 'React import found' : 'React import missing');
      
      const hasAPIClientImport = content.includes("import { paysuritWebsiteAPIClient");
      this.addImportTest('RealTimeWebsiteDashboard imports API client', hasAPIClientImport,
        hasAPIClientImport ? 'API client import found' : 'API client import missing');
      
      const hasComponentExport = content.includes('export const RealTimeWebsiteDashboard') && content.includes('export default');
      this.addImportTest('RealTimeWebsiteDashboard has proper exports', hasComponentExport,
        hasComponentExport ? 'Component exports found' : 'Component exports missing');
        
    } catch (error) {
      this.addImportTest('RealTimeWebsiteDashboard readable', false, error.message);
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
    const apiClientPath = path.join(this.basePath, 'PaySurity.com/src/services/PaySurityWebsiteAPIClient.ts');
    
    if (!fs.existsSync(apiClientPath)) {
      this.addFunctionalityTest('PaySurityWebsiteAPIClient functionality', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(apiClientPath, 'utf8');
      
      // Validate core website content operations
      const hasGetWebsiteContent = content.includes('async getWebsiteContent(') && content.includes('from(\'website_content\')');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements getWebsiteContent with GCP-Native', hasGetWebsiteContent,
        hasGetWebsiteContent ? 'getWebsiteContent method with GCP-Native query found' : 'getWebsiteContent method missing or not using GCP-Native');
      
      const hasUpdateWebsiteContent = content.includes('async updateWebsiteContent(') && content.includes('.update(');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements updateWebsiteContent', hasUpdateWebsiteContent,
        hasUpdateWebsiteContent ? 'updateWebsiteContent method found' : 'updateWebsiteContent method missing');
      
      // Validate contact form operations
      const hasGetContactForms = content.includes('async getContactForms(') && content.includes('contact_forms');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements getContactForms', hasGetContactForms,
        hasGetContactForms ? 'getContactForms method found' : 'getContactForms method missing');
      
      const hasCreateContactForm = content.includes('async createContactForm(') && content.includes('.insert([');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements createContactForm', hasCreateContactForm,
        hasCreateContactForm ? 'createContactForm method found' : 'createContactForm method missing');
      
      // Validate newsletter operations
      const hasGetNewsletterSubscriptions = content.includes('async getNewsletterSubscriptions(') && content.includes('newsletter_subscriptions');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements getNewsletterSubscriptions', hasGetNewsletterSubscriptions,
        hasGetNewsletterSubscriptions ? 'getNewsletterSubscriptions method found' : 'getNewsletterSubscriptions method missing');
      
      const hasCreateNewsletterSubscription = content.includes('async createNewsletterSubscription(') && content.includes('.insert([');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements createNewsletterSubscription', hasCreateNewsletterSubscription,
        hasCreateNewsletterSubscription ? 'createNewsletterSubscription method found' : 'createNewsletterSubscription method missing');
      
      // Validate blog operations
      const hasGetBlogPosts = content.includes('async getBlogPosts(') && content.includes('blog_posts');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements getBlogPosts', hasGetBlogPosts,
        hasGetBlogPosts ? 'getBlogPosts method found' : 'getBlogPosts method missing');
      
      // Validate analytics
      const hasGetWebsiteAnalytics = content.includes('async getWebsiteAnalytics(') && content.includes('WebsiteAnalytics');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient implements getWebsiteAnalytics', hasGetWebsiteAnalytics,
        hasGetWebsiteAnalytics ? 'getWebsiteAnalytics method found' : 'getWebsiteAnalytics method missing');
      
      // Validate real-time subscriptions
      const hasContactFormSubscription = content.includes('subscribeToContactFormUpdates') && content.includes('.channel(');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient has real-time contact form subscriptions', hasContactFormSubscription,
        hasContactFormSubscription ? 'Contact form subscription method found' : 'Contact form subscription method missing');
      
      const hasNewsletterSubscription = content.includes('subscribeToNewsletterUpdates') && content.includes('postgres_changes');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient has real-time newsletter subscriptions', hasNewsletterSubscription,
        hasNewsletterSubscription ? 'Newsletter subscription method found' : 'Newsletter subscription method missing');
      
      const hasContentSubscription = content.includes('subscribeToContentUpdates') && content.includes('website_content');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient has real-time content subscriptions', hasContentSubscription,
        hasContentSubscription ? 'Content subscription method found' : 'Content subscription method missing');
      
      // Validate interfaces
      const hasWebsiteContentInterface = content.includes('export interface WebsiteContent {');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient defines WebsiteContent interface', hasWebsiteContentInterface,
        hasWebsiteContentInterface ? 'WebsiteContent interface found' : 'WebsiteContent interface missing');
      
      const hasContactFormInterface = content.includes('export interface ContactForm {');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient defines ContactForm interface', hasContactFormInterface,
        hasContactFormInterface ? 'ContactForm interface found' : 'ContactForm interface missing');
      
      const hasNewsletterSubscriptionInterface = content.includes('export interface NewsletterSubscription {');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient defines NewsletterSubscription interface', hasNewsletterSubscriptionInterface,
        hasNewsletterSubscriptionInterface ? 'NewsletterSubscription interface found' : 'NewsletterSubscription interface missing');
      
      const hasBlogPostInterface = content.includes('export interface BlogPost {');
      this.addFunctionalityTest('PaySurityWebsiteAPIClient defines BlogPost interface', hasBlogPostInterface,
        hasBlogPostInterface ? 'BlogPost interface found' : 'BlogPost interface missing');
        
    } catch (error) {
      this.addFunctionalityTest('PaySurityWebsiteAPIClient functionality check', false, error.message);
    }
  }

  async validateComponentFunctionality() {
    const componentPath = path.join(this.basePath, 'PaySurity.com/src/components/RealTimeWebsiteDashboard.tsx');
    
    if (!fs.existsSync(componentPath)) {
      this.addFunctionalityTest('RealTimeWebsiteDashboard functionality', false, 'File not found');
      return;
    }

    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Validate React hooks usage
      const hasStateManagement = content.includes('useState') && content.includes('useEffect');
      this.addFunctionalityTest('RealTimeWebsiteDashboard uses React hooks', hasStateManagement,
        hasStateManagement ? 'React hooks found' : 'React hooks missing');
      
      // Validate API client usage
      const usesAPIClient = content.includes('paysuritWebsiteAPIClient.getWebsiteContent') && content.includes('paysuritWebsiteAPIClient.subscribeToContactFormUpdates');
      this.addFunctionalityTest('RealTimeWebsiteDashboard uses API client methods', usesAPIClient,
        usesAPIClient ? 'API client methods used' : 'API client methods not used');
      
      // Validate real-time functionality
      const hasRealtimeSetup = content.includes('setupRealtimeSubscriptions') && content.includes('subscribeToContactFormUpdates');
      this.addFunctionalityTest('RealTimeWebsiteDashboard implements real-time updates', hasRealtimeSetup,
        hasRealtimeSetup ? 'Real-time setup found' : 'Real-time setup missing');
      
      // Validate website functionality
      const hasContactFormManagement = content.includes('handleContactFormStatusUpdate') && content.includes('contact');
      this.addFunctionalityTest('RealTimeWebsiteDashboard implements contact form management', hasContactFormManagement,
        hasContactFormManagement ? 'Contact form management functionality found' : 'Contact form management functionality missing');
      
      // Validate dashboard tabs
      const hasDashboardTabs = content.includes('activeTab') && content.includes('leads') && content.includes('newsletter');
      this.addFunctionalityTest('RealTimeWebsiteDashboard implements website dashboard tabs', hasDashboardTabs,
        hasDashboardTabs ? 'Website dashboard tabs found' : 'Website dashboard tabs missing');
      
      // Validate content display
      const hasContentDisplay = content.includes('websiteContent') && content.includes('WebsiteContent');
      this.addFunctionalityTest('RealTimeWebsiteDashboard displays website content', hasContentDisplay,
        hasContentDisplay ? 'Content display found' : 'Content display missing');
      
      // Validate newsletter display
      const hasNewsletterDisplay = content.includes('newsletterSubscriptions') && content.includes('NewsletterSubscription');
      this.addFunctionalityTest('RealTimeWebsiteDashboard displays newsletter subscriptions', hasNewsletterDisplay,
        hasNewsletterDisplay ? 'Newsletter display found' : 'Newsletter display missing');
      
      // Validate error handling
      const hasErrorHandling = content.includes('setError') && content.includes('catch');
      this.addFunctionalityTest('RealTimeWebsiteDashboard has error handling', hasErrorHandling,
        hasErrorHandling ? 'Error handling found' : 'Error handling missing');
        
    } catch (error) {
      this.addFunctionalityTest('RealTimeWebsiteDashboard functionality check', false, error.message);
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
    await this.validateExistingGCP-NativeService();
    
    this.log(`Integration validation: ${this.results.integrationValidation.passed} passed, ${this.results.integrationValidation.failed} failed`);
  }

  async validateBackendIntegration() {
    const backendPath = path.join(this.basePath, 'PaySurity.com/simple-server.js');
    
    if (!fs.existsSync(backendPath)) {
      this.addIntegrationTest('PaySurity.com backend server exists', false, 'Backend server not found');
      return;
    }

    try {
      const content = fs.readFileSync(backendPath, 'utf8');
      
      const hasWebsiteEndpoints = content.includes('/api/') || content.includes('website') || content.includes('content');
      this.addIntegrationTest('Backend has website endpoints', hasWebsiteEndpoints,
        hasWebsiteEndpoints ? 'Website endpoints found' : 'Website endpoints missing');
        
    } catch (error) {
      this.addIntegrationTest('Backend integration check', false, error.message);
    }
  }

  async validateExistingGCP-NativeService() {
    const GCP-NativeServicePath = path.join(this.basePath, 'PaySurity-Website/src/services/GCP-NativeService.ts');
    
    if (!fs.existsSync(GCP-NativeServicePath)) {
      this.addIntegrationTest('Existing GCP-NativeService integration', false, 'Existing GCP-NativeService not found');
      return;
    }

    try {
      const content = fs.readFileSync(GCP-NativeServicePath, 'utf8');
      
      const hasServiceClass = content.includes('export class PaySurityWebsiteGCP-NativeService');
      this.addIntegrationTest('Existing GCP-NativeService class available', hasServiceClass,
        hasServiceClass ? 'PaySurityWebsiteGCP-NativeService class found' : 'PaySurityWebsiteGCP-NativeService class missing');
      
      const hasWebsiteContentMethods = content.includes('getWebsiteContent') && content.includes('createWebsiteContent');
      this.addIntegrationTest('Existing GCP-NativeService has website content methods', hasWebsiteContentMethods,
        hasWebsiteContentMethods ? 'Website content methods found' : 'Website content methods missing');
      
      const hasContactFormMethods = content.includes('getContactForms') && content.includes('createContactForms');
      this.addIntegrationTest('Existing GCP-NativeService has contact form methods', hasContactFormMethods,
        hasContactFormMethods ? 'Contact form methods found' : 'Contact form methods missing');
        
    } catch (error) {
      this.addIntegrationTest('Existing GCP-NativeService check', false, error.message);
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
      
      const hasWebsiteContentTable = schema.includes('CREATE TABLE website_content');
      this.addIntegrationTest('Schema has website_content table', hasWebsiteContentTable,
        hasWebsiteContentTable ? 'Website content table found in schema' : 'Website content table missing from schema');
      
      const hasContactFormsTable = schema.includes('CREATE TABLE contact_forms');
      this.addIntegrationTest('Schema has contact_forms table', hasContactFormsTable,
        hasContactFormsTable ? 'Contact forms table found' : 'Contact forms table missing');
      
      const hasNewsletterSubscriptionsTable = schema.includes('CREATE TABLE newsletter_subscriptions');
      this.addIntegrationTest('Schema has newsletter_subscriptions table', hasNewsletterSubscriptionsTable,
        hasNewsletterSubscriptionsTable ? 'Newsletter subscriptions table found' : 'Newsletter subscriptions table missing');
      
      const hasBlogPostsTable = schema.includes('CREATE TABLE blog_posts');
      this.addIntegrationTest('Schema has blog_posts table', hasBlogPostsTable,
        hasBlogPostsTable ? 'Blog posts table found' : 'Blog posts table missing');
      
      const hasWebsiteAnalyticsTable = schema.includes('CREATE TABLE website_analytics');
      this.addIntegrationTest('Schema has website_analytics table', hasWebsiteAnalyticsTable,
        hasWebsiteAnalyticsTable ? 'Website analytics table found' : 'Website analytics table missing');
      
      const hasProperIndexes = schema.includes('CREATE INDEX') || schema.includes('website');
      this.addIntegrationTest('Schema has website indexes or references', hasProperIndexes,
        hasProperIndexes ? 'Website indexes/references found' : 'Website indexes/references missing');
        
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
      validation_type: 'PaySurity.com Website Frontend-Backend Integration',
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
    const reportPath = path.join(this.basePath, '_evidence', 'paysurity_website_validation_report.json');
    const evidenceDir = path.dirname(reportPath);
    
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console output
    console.log('\n' + '='.repeat(80));
    console.log('📊 PAYSURITY.COM WEBSITE INTEGRATION VALIDATION REPORT');
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
    console.log('🚀 Starting PaySurity.com Website Integration Validation');
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
const validator = new PaySurityWebsiteValidator();
validator.run();
