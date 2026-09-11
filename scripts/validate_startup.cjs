/**
 * Startup Validation Script
 * Validates that all critical components are ready
 */

const fs = require('fs');
const path = require('path');

class StartupValidator {
  constructor() {
    this.checks = [];
    this.errors = [];
  }

  check(name, condition, errorMessage) {
    const passed = typeof condition === 'function' ? condition() : condition;
    this.checks.push({ name, passed });
    
    if (passed) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}: ${errorMessage}`);
      this.errors.push(`${name}: ${errorMessage}`);
    }
    
    return passed;
  }

  async validate() {
    console.log('🔍 Validating PaySurity Platform startup requirements...');
    console.log('');

    // Check build output
    this.check(
      'Build Output',
      () => fs.existsSync('dist/app.js'),
      'dist/app.js not found - run npm run build'
    );

    // Check environment
    this.check(
      'Environment File',
      () => fs.existsSync('.env') || fs.existsSync('.env.local'),
      'No .env file found - copy from .env.example'
    );

    // Check node_modules
    this.check(
      'Dependencies',
      () => fs.existsSync('node_modules'),
      'node_modules not found - run npm install'
    );

    // Check shared services
    this.check(
      'Shared Services',
      () => fs.existsSync('shared'),
      'shared/ directory not found'
    );

    console.log('');
    console.log(`📊 Validation Summary: ${this.checks.filter(c => c.passed).length}/${this.checks.length} checks passed`);

    if (this.errors.length > 0) {
      console.log('');
      console.log('❌ Critical Issues:');
      this.errors.forEach(error => console.log(`   • ${error}`));
      console.log('');
      console.log('🔧 Fix these issues before starting the platform');
      return false;
    } else {
      console.log('');
      console.log('✅ All startup requirements validated!');
      console.log('🚀 Platform ready to start');
      return true;
    }
  }
}

if (require.main === module) {
  const validator = new StartupValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = StartupValidator;
