
/**
 * Layer 1 Import Resolution Fix Script
 * Fixes ES module import issues in compiled JavaScript files
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 PaySurity Platform - Layer 1 Import Resolution Fix');
console.log('===================================================');
console.log(`📅 Started at: ${new Date().toISOString()}`);
console.log('');

const SERVICES_PATH = path.join(__dirname, '..', 'shared', 'services');

class ImportFixer {
  constructor() {
    this.fixes = [];
    this.errors = [];
  }

  async fixAllImports() {
    console.log('🚀 Starting import resolution fixes...\n');

    try {
      // Get all JavaScript files in services directory
      const jsFiles = fs.readdirSync(SERVICES_PATH)
        .filter(file => file.endsWith('.js') && !file.includes('.map'))
        .filter(file => file !== 'index.js'); // Skip index file

      console.log(`📁 Found ${jsFiles.length} JavaScript files to fix`);
      console.log('');

      for (const file of jsFiles) {
        await this.fixFileImports(file);
      }

      this.generateReport();

    } catch (error) {
      console.error('❌ Fix process failed:', error);
      process.exit(1);
    }
  }

  async fixFileImports(filename) {
    const filePath = path.join(SERVICES_PATH, filename);
    console.log(`🔍 Processing ${filename}...`);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Fix 1: Add .js extensions to relative imports
      const relativeImportRegex = /import\s+.*\s+from\s+['"](\.\/.+?)['"];?/g;
      content = content.replace(relativeImportRegex, (match, importPath) => {
        if (!importPath.endsWith('.js') && !importPath.includes('/')) {
          const newImport = match.replace(importPath, importPath + '.js');
          console.log(`  ✅ Fixed relative import: ${importPath} → ${importPath}.js`);
          modified = true;
          return newImport;
        }
        return match;
      });

      // Fix 2: Handle problematic external module imports
      const externalImportFixes = {
        "import { Pool } from 'pg';": "import pkg from 'pg';\nconst { Pool } = pkg;",
        "import jwt from 'jsonwebtoken';": "import jsonwebtoken from 'jsonwebtoken';\nconst jwt = jsonwebtoken;",
        "import bcrypt from 'bcrypt';": "import bcryptPkg from 'bcrypt';\nconst bcrypt = bcryptPkg;"
      };

      for (const [oldImport, newImport] of Object.entries(externalImportFixes)) {
        if (content.includes(oldImport)) {
          content = content.replace(oldImport, newImport);
          console.log(`  ✅ Fixed external import: ${oldImport.substring(0, 30)}...`);
          modified = true;
        }
      }

      // Fix 3: Handle @shared imports (convert to relative paths)
      const sharedImportRegex = /import\s+.*\s+from\s+['"]@shared\/(.+?)['"];?/g;
      content = content.replace(sharedImportRegex, (match, importPath) => {
        // Convert @shared/types to relative path
        if (importPath.startsWith('types')) {
          const relativePath = '../types/' + importPath.replace('types/', '');
          const newImport = match.replace(`@shared/${importPath}`, relativePath);
          console.log(`  ✅ Fixed @shared import: @shared/${importPath} → ${relativePath}`);
          modified = true;
          return newImport;
        }
        return match;
      });

      if (modified) {
        // Create backup
        const backupPath = filePath + '.backup';
        fs.copyFileSync(filePath, backupPath);
        
        // Write fixed content
        fs.writeFileSync(filePath, content, 'utf8');
        
        this.fixes.push({
          file: filename,
          status: 'fixed',
          backupCreated: true
        });
        
        console.log(`  💾 ${filename} fixed and backed up`);
      } else {
        console.log(`  ✅ ${filename} - no fixes needed`);
        this.fixes.push({
          file: filename,
          status: 'no_changes'
        });
      }

    } catch (error) {
      console.log(`  ❌ ${filename} - fix failed: ${error.message}`);
      this.errors.push({
        file: filename,
        error: error.message
      });
    }

    console.log('');
  }

  generateReport() {
    console.log('📋 IMPORT FIX REPORT');
    console.log('===================');
    
    const totalFiles = this.fixes.length + this.errors.length;
    const fixedFiles = this.fixes.filter(f => f.status === 'fixed').length;
    const unchangedFiles = this.fixes.filter(f => f.status === 'no_changes').length;
    const errorFiles = this.errors.length;
    
    console.log(`📊 Total files processed: ${totalFiles}`);
    console.log(`📊 Files fixed: ${fixedFiles}`);
    console.log(`📊 Files unchanged: ${unchangedFiles}`);
    console.log(`📊 Files with errors: ${errorFiles}`);
    
    if (errorFiles > 0) {
      console.log('\n❌ Files with errors:');
      this.errors.forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
    }
    
    if (fixedFiles > 0) {
      console.log('\n✅ Files successfully fixed:');
      this.fixes.filter(f => f.status === 'fixed').forEach(fix => {
        console.log(`  - ${fix.file} (backup created)`);
      });
    }
    
    console.log(`\n📅 Completed at: ${new Date().toISOString()}`);
    
    // Save report
    const reportPath = path.join(__dirname, '..', '_evidence', 'import_fix_report.json');
    const evidenceDir = path.dirname(reportPath);
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles,
      fixedFiles,
      unchangedFiles,
      errorFiles,
      fixes: this.fixes,
      errors: this.errors
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    if (errorFiles === 0) {
      console.log('\n🎉 ALL IMPORTS FIXED SUCCESSFULLY!');
      console.log('✅ Layer 1 services should now be importable');
      process.exit(0);
    } else {
      console.log('\n⚠️  SOME ISSUES REMAIN');
      console.log('🔧 Manual intervention may be required');
      process.exit(1);
    }
  }
}

// Run the fixer
const fixer = new ImportFixer();
fixer.fixAllImports().catch(error => {
  console.error('💥 Import fix script failed:', error);
  process.exit(2);
});
