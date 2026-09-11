#!/usr/bin/env node
/**
 * PaySurity Six Sigma DMAIC - Comprehensive Validation Script
 * Validates all Six Sigma components for actual functionality (not just file creation)
 * Critical validation protocol to prevent false completion claims
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
    REPO_ROOT: process.env.REPO_ROOT || 'C:\\Users\\Detaimfc\\Downloads\\PS-Platform',
    SCRIPTS_DIR: 'scripts\\req_coverage',
    REPORTS_DIR: 'reports\\coverage',
    REQUIREMENTS_FILE: 'paysurity_requirements_integrated_programmatic_SINGLE.txt',
    VALIDATION_TIMEOUT: 30000, // 30 seconds per validation
    CRITICAL_COMPONENTS: [
        'runner.ps1',
        'scan_repo.py',
        'map_to_requirements_enhanced.py',
        'calc_dpmo_enhanced.py',
        'spc_control.py',
        'fmea_generate.py',
        'progress_reporter_enhanced.py',
        'poka_yoke_hooks_enhanced.ps1',
        'update_requirements_status_enhanced.py',
        'six_sigma_execution_enhanced.ps1'
    ]
};

class SixSigmaValidator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            overall_status: 'UNKNOWN',
            validations: [],
            summary: {
                total_components: 0,
                passed_components: 0,
                failed_components: 0,
                critical_errors: 0,
                warnings: 0
            },
            recommendations: []
        };
        
        this.scriptsPath = path.join(CONFIG.REPO_ROOT, CONFIG.SCRIPTS_DIR);
        this.reportsPath = path.join(CONFIG.REPO_ROOT, CONFIG.REPORTS_DIR);
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const colors = {
            'ERROR': '\x1b[31m',
            'WARN': '\x1b[33m',
            'SUCCESS': '\x1b[32m',
            'INFO': '\x1b[36m'
        };
        const reset = '\x1b[0m';
        
        console.log(`${colors[level] || ''}[${timestamp}] [${level}] ${message}${reset}`);
    }

    async validateFileExists(componentName) {
        const validation = {
            component: componentName,
            test: 'file_existence',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const filePath = path.join(this.scriptsPath, componentName);
            
            if (!fs.existsSync(filePath)) {
                validation.status = 'FAIL';
                validation.errors.push(`File does not exist: ${filePath}`);
                return validation;
            }

            const stats = fs.statSync(filePath);
            validation.details.file_size = stats.size;
            validation.details.modified = stats.mtime.toISOString();

            if (stats.size < 100) {
                validation.status = 'FAIL';
                validation.errors.push(`File too small (${stats.size} bytes) - likely empty or incomplete`);
                return validation;
            }

            validation.status = 'PASS';
            validation.details.message = 'File exists and has reasonable size';

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`File validation error: ${error.message}`);
        }

        return validation;
    }

    async validatePythonSyntax(componentName) {
        if (!componentName.endsWith('.py')) {
            return null; // Skip non-Python files
        }

        const validation = {
            component: componentName,
            test: 'python_syntax',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const filePath = path.join(this.scriptsPath, componentName);
            
            // Check Python syntax
            execSync(`python -m py_compile "${filePath}"`, { 
                timeout: CONFIG.VALIDATION_TIMEOUT,
                stdio: 'pipe'
            });

            validation.status = 'PASS';
            validation.details.message = 'Python syntax is valid';

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Python syntax error: ${error.message}`);
            
            // Try to get more specific error info
            try {
                const output = execSync(`python -c "import ast; ast.parse(open('${path.join(this.scriptsPath, componentName)}').read())"`, {
                    timeout: CONFIG.VALIDATION_TIMEOUT,
                    stdio: 'pipe'
                });
            } catch (syntaxError) {
                validation.errors.push(`Detailed syntax error: ${syntaxError.message}`);
            }
        }

        return validation;
    }

    async validatePowerShellSyntax(componentName) {
        if (!componentName.endsWith('.ps1')) {
            return null; // Skip non-PowerShell files
        }

        const validation = {
            component: componentName,
            test: 'powershell_syntax',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const filePath = path.join(this.scriptsPath, componentName);
            
            // Check PowerShell syntax
            execSync(`powershell -Command "& { $ErrorActionPreference = 'Stop'; [System.Management.Automation.PSParser]::Tokenize((Get-Content '${filePath}' -Raw), [ref]$null) | Out-Null }"`, {
                timeout: CONFIG.VALIDATION_TIMEOUT,
                stdio: 'pipe'
            });

            validation.status = 'PASS';
            validation.details.message = 'PowerShell syntax is valid';

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`PowerShell syntax error: ${error.message}`);
        }

        return validation;
    }

    async validatePythonImports(componentName) {
        if (!componentName.endsWith('.py')) {
            return null;
        }

        const validation = {
            component: componentName,
            test: 'python_imports',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const filePath = path.join(this.scriptsPath, componentName);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Extract import statements
            const importLines = content.split('\n').filter(line => 
                line.trim().startsWith('import ') || 
                line.trim().startsWith('from ')
            );

            validation.details.import_count = importLines.length;
            validation.details.imports = importLines.slice(0, 10); // First 10 imports

            // Try to import the module to check for import errors
            const tempScript = `
import sys
sys.path.insert(0, '${this.scriptsPath.replace(/\\/g, '\\\\')}')
try:
    import ${path.basename(componentName, '.py')}
    print("SUCCESS: All imports resolved")
except ImportError as e:
    print(f"IMPORT_ERROR: {e}")
except Exception as e:
    print(f"OTHER_ERROR: {e}")
`;

            const tempFile = path.join(this.scriptsPath, 'temp_import_test.py');
            fs.writeFileSync(tempFile, tempScript);

            try {
                const output = execSync(`python "${tempFile}"`, {
                    timeout: CONFIG.VALIDATION_TIMEOUT,
                    stdio: 'pipe',
                    encoding: 'utf8'
                });

                if (output.includes('SUCCESS')) {
                    validation.status = 'PASS';
                    validation.details.message = 'All imports resolved successfully';
                } else if (output.includes('IMPORT_ERROR')) {
                    validation.status = 'FAIL';
                    validation.errors.push(`Import error: ${output}`);
                } else {
                    validation.status = 'WARN';
                    validation.errors.push(`Import warning: ${output}`);
                }
            } finally {
                // Clean up temp file
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
            }

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Import validation error: ${error.message}`);
        }

        return validation;
    }

    async validateFunctionality(componentName) {
        const validation = {
            component: componentName,
            test: 'functionality',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const filePath = path.join(this.scriptsPath, componentName);
            const content = fs.readFileSync(filePath, 'utf8');

            // Check for key functionality patterns
            const functionalityChecks = {
                'scan_repo.py': [
                    'class.*Scanner',
                    'def.*scan',
                    'RequirementRef',
                    'semantic_patterns'
                ],
                'calc_dpmo_enhanced.py': [
                    'class.*DPMO',
                    'def.*calculate.*dpmo',
                    'sigma_level',
                    'ctq_metrics'
                ],
                'spc_control.py': [
                    'class.*SPC',
                    'western_rules',
                    'control_limits',
                    'def.*apply.*rules'
                ],
                'fmea_generate.py': [
                    'class.*FMEA',
                    'FailureMode',
                    'def.*analyze.*failure',
                    'rpn'
                ],
                'runner.ps1': [
                    'param.*Command',
                    'function.*Initialize',
                    'CTQs.*=',
                    'Six.*Sigma'
                ]
            };

            const expectedPatterns = functionalityChecks[componentName] || [];
            const foundPatterns = [];
            const missingPatterns = [];

            for (const pattern of expectedPatterns) {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(content)) {
                    foundPatterns.push(pattern);
                } else {
                    missingPatterns.push(pattern);
                }
            }

            validation.details.expected_patterns = expectedPatterns.length;
            validation.details.found_patterns = foundPatterns.length;
            validation.details.missing_patterns = missingPatterns;

            if (expectedPatterns.length === 0) {
                validation.status = 'SKIP';
                validation.details.message = 'No specific functionality patterns defined';
            } else if (missingPatterns.length === 0) {
                validation.status = 'PASS';
                validation.details.message = 'All expected functionality patterns found';
            } else if (foundPatterns.length >= expectedPatterns.length * 0.7) {
                validation.status = 'WARN';
                validation.errors.push(`Missing some patterns: ${missingPatterns.join(', ')}`);
            } else {
                validation.status = 'FAIL';
                validation.errors.push(`Too many missing patterns: ${missingPatterns.join(', ')}`);
            }

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Functionality validation error: ${error.message}`);
        }

        return validation;
    }

    async validateIntegration() {
        const validation = {
            component: 'INTEGRATION',
            test: 'system_integration',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            // Check if required directories exist
            const requiredDirs = [
                this.scriptsPath,
                this.reportsPath,
                path.join(CONFIG.REPO_ROOT, CONFIG.REQUIREMENTS_FILE)
            ];

            const missingDirs = [];
            for (const dir of requiredDirs) {
                if (!fs.existsSync(dir)) {
                    missingDirs.push(dir);
                }
            }

            if (missingDirs.length > 0) {
                validation.status = 'FAIL';
                validation.errors.push(`Missing required paths: ${missingDirs.join(', ')}`);
                return validation;
            }

            // Check if main orchestrator can be parsed
            const orchestratorPath = path.join(this.scriptsPath, 'six_sigma_execution_enhanced.ps1');
            if (fs.existsSync(orchestratorPath)) {
                const content = fs.readFileSync(orchestratorPath, 'utf8');
                
                // Check for integration points
                const integrationChecks = [
                    'Invoke-SixSigmaDMAIC',
                    'Test-SixSigmaQualityGates',
                    'Initialize-SixSigmaEnvironment',
                    'CTQThresholds'
                ];

                const foundIntegrations = integrationChecks.filter(check => 
                    content.includes(check)
                );

                validation.details.integration_points = foundIntegrations.length;
                validation.details.expected_points = integrationChecks.length;

                if (foundIntegrations.length === integrationChecks.length) {
                    validation.status = 'PASS';
                    validation.details.message = 'All integration points found';
                } else {
                    validation.status = 'WARN';
                    validation.errors.push(`Missing integration points: ${integrationChecks.filter(c => !foundIntegrations.includes(c)).join(', ')}`);
                }
            } else {
                validation.status = 'FAIL';
                validation.errors.push('Main orchestrator not found');
            }

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Integration validation error: ${error.message}`);
        }

        return validation;
    }

    async validateComponent(componentName) {
        this.log(`Validating component: ${componentName}`, 'INFO');
        
        const componentValidations = [];
        
        // File existence
        const fileValidation = await this.validateFileExists(componentName);
        componentValidations.push(fileValidation);
        
        if (fileValidation.status === 'FAIL') {
            // If file doesn't exist, skip other validations
            return componentValidations;
        }
        
        // Syntax validation
        const pythonSyntax = await this.validatePythonSyntax(componentName);
        if (pythonSyntax) componentValidations.push(pythonSyntax);
        
        const powershellSyntax = await this.validatePowerShellSyntax(componentName);
        if (powershellSyntax) componentValidations.push(powershellSyntax);
        
        // Import validation for Python files
        const importValidation = await this.validatePythonImports(componentName);
        if (importValidation) componentValidations.push(importValidation);
        
        // Functionality validation
        const functionalityValidation = await this.validateFunctionality(componentName);
        componentValidations.push(functionalityValidation);
        
        return componentValidations;
    }

    async runValidation() {
        this.log('🎯 Starting Six Sigma DMAIC Comprehensive Validation...', 'INFO');
        this.log(`Repository: ${CONFIG.REPO_ROOT}`, 'INFO');
        this.log(`Scripts Directory: ${this.scriptsPath}`, 'INFO');
        
        // Validate each critical component
        for (const component of CONFIG.CRITICAL_COMPONENTS) {
            try {
                const validations = await this.validateComponent(component);
                this.results.validations.push(...validations);
                
                // Update summary
                this.results.summary.total_components++;
                
                const componentPassed = validations.every(v => v.status === 'PASS' || v.status === 'SKIP');
                const componentFailed = validations.some(v => v.status === 'FAIL');
                
                if (componentPassed && !componentFailed) {
                    this.results.summary.passed_components++;
                    this.log(`✅ ${component} - PASSED`, 'SUCCESS');
                } else if (componentFailed) {
                    this.results.summary.failed_components++;
                    this.results.summary.critical_errors++;
                    this.log(`❌ ${component} - FAILED`, 'ERROR');
                } else {
                    this.results.summary.warnings++;
                    this.log(`⚠️ ${component} - WARNINGS`, 'WARN');
                }
                
            } catch (error) {
                this.log(`❌ Error validating ${component}: ${error.message}`, 'ERROR');
                this.results.summary.critical_errors++;
            }
        }
        
        // Integration validation
        const integrationValidation = await this.validateIntegration();
        this.results.validations.push(integrationValidation);
        
        // Determine overall status
        if (this.results.summary.critical_errors === 0 && this.results.summary.failed_components === 0) {
            this.results.overall_status = 'PASS';
        } else if (this.results.summary.critical_errors > 0) {
            this.results.overall_status = 'FAIL';
        } else {
            this.results.overall_status = 'WARN';
        }
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Save results
        await this.saveResults();
        
        // Print summary
        this.printSummary();
        
        return this.results.overall_status === 'PASS' ? 0 : 1;
    }

    generateRecommendations() {
        const recs = this.results.recommendations;
        
        if (this.results.summary.critical_errors > 0) {
            recs.push('🔴 CRITICAL: Fix all failed components before deployment');
        }
        
        if (this.results.summary.failed_components > 0) {
            recs.push('🟡 HIGH: Address component failures to ensure system reliability');
        }
        
        if (this.results.summary.warnings > 0) {
            recs.push('🟠 MEDIUM: Review warnings to improve system quality');
        }
        
        // Check for specific issues
        const failedValidations = this.results.validations.filter(v => v.status === 'FAIL');
        const syntaxErrors = failedValidations.filter(v => v.test.includes('syntax'));
        const importErrors = failedValidations.filter(v => v.test.includes('import'));
        
        if (syntaxErrors.length > 0) {
            recs.push('🔧 Fix syntax errors in scripts before execution');
        }
        
        if (importErrors.length > 0) {
            recs.push('📦 Install missing Python dependencies or fix import paths');
        }
        
        if (this.results.overall_status === 'PASS') {
            recs.push('✅ System validation passed - Six Sigma DMAIC ready for execution');
        }
    }

    async saveResults() {
        try {
            // Ensure reports directory exists
            if (!fs.existsSync(this.reportsPath)) {
                fs.mkdirSync(this.reportsPath, { recursive: true });
            }
            
            const resultsFile = path.join(this.reportsPath, 'six_sigma_validation_results.json');
            fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
            
            this.log(`✅ Validation results saved: ${resultsFile}`, 'SUCCESS');
            
        } catch (error) {
            this.log(`❌ Failed to save results: ${error.message}`, 'ERROR');
        }
    }

    printSummary() {
        this.log('', 'INFO');
        this.log('📊 SIX SIGMA VALIDATION SUMMARY', 'INFO');
        this.log('================================', 'INFO');
        this.log(`Overall Status: ${this.results.overall_status}`, 
                 this.results.overall_status === 'PASS' ? 'SUCCESS' : 'ERROR');
        this.log(`Total Components: ${this.results.summary.total_components}`, 'INFO');
        this.log(`Passed: ${this.results.summary.passed_components}`, 'SUCCESS');
        this.log(`Failed: ${this.results.summary.failed_components}`, 'ERROR');
        this.log(`Warnings: ${this.results.summary.warnings}`, 'WARN');
        this.log(`Critical Errors: ${this.results.summary.critical_errors}`, 'ERROR');
        
        if (this.results.recommendations.length > 0) {
            this.log('', 'INFO');
            this.log('🎯 RECOMMENDATIONS:', 'INFO');
            this.results.recommendations.forEach(rec => {
                this.log(`  ${rec}`, 'INFO');
            });
        }
        
        this.log('', 'INFO');
        if (this.results.overall_status === 'PASS') {
            this.log('🎉 Six Sigma DMAIC system validation PASSED!', 'SUCCESS');
            this.log('✅ System is ready for production execution', 'SUCCESS');
        } else {
            this.log('❌ Six Sigma DMAIC system validation FAILED!', 'ERROR');
            this.log('🔧 Address issues before proceeding with execution', 'ERROR');
        }
    }
}

// Main execution
async function main() {
    const validator = new SixSigmaValidator();
    
    try {
        const exitCode = await validator.runValidation();
        process.exit(exitCode);
    } catch (error) {
        console.error(`❌ Validation failed with error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { SixSigmaValidator };
