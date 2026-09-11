#!/usr/bin/env node
/**
 * Milestone-25 Accelerator Validation Script
 * Validates all required components for the Milestone-25 workflow
 * Critical validation protocol to prevent execution failures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
    REPO_ROOT: process.env.REPO_ROOT || 'C:\\Users\\Detaimfc\\Downloads\\PS-Platform',
    SCRIPTS_DIR: 'scripts\\req_coverage',
    REPORTS_DIR: 'reports\\coverage',
    REQUIREMENTS_FILE: 'paysurity_requirements_integrated_programmatic_SINGLE.txt',
    VALIDATION_TIMEOUT: 30000
};

class Milestone25Validator {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            overall_status: 'UNKNOWN',
            validations: [],
            summary: {
                total_scripts: 0,
                validated_scripts: 0,
                failed_scripts: 0,
                missing_scripts: 0
            },
            workflow_ready: false
        };
        
        this.scriptsPath = path.join(CONFIG.REPO_ROOT, CONFIG.SCRIPTS_DIR);
        this.reportsPath = path.join(CONFIG.REPO_ROOT, CONFIG.REPORTS_DIR);
        
        // Required scripts for Milestone-25
        this.requiredScripts = [
            'runner.ps1',
            'calc_dpmo.py',
            'feature_discovery.py', 
            'merge_requirements.py',
            'autotag_existing_impl.py',
            'smoke_test_generator.py',
            'suggest_impl_tasks.py',
            'update_requirements_status.py'
        ];
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

    async validateScriptExists(scriptName) {
        const validation = {
            script: scriptName,
            test: 'file_existence',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            // Try multiple possible locations
            const candidates = [
                path.join(this.scriptsPath, scriptName),
                path.join(this.scriptsPath, scriptName.replace('.py', '_enhanced.py')),
                path.join(this.scriptsPath, scriptName.replace('.ps1', '_enhanced.ps1'))
            ];

            let foundPath = null;
            for (const candidate of candidates) {
                if (fs.existsSync(candidate)) {
                    foundPath = candidate;
                    break;
                }
            }

            if (!foundPath) {
                validation.status = 'FAIL';
                validation.errors.push(`Script not found: ${scriptName} (checked: ${candidates.join(', ')})`);
                return validation;
            }

            const stats = fs.statSync(foundPath);
            validation.details.file_path = foundPath;
            validation.details.file_size = stats.size;
            validation.details.modified = stats.mtime.toISOString();

            if (stats.size < 100) {
                validation.status = 'FAIL';
                validation.errors.push(`Script too small (${stats.size} bytes) - likely empty`);
                return validation;
            }

            validation.status = 'PASS';
            validation.details.message = `Script found: ${foundPath}`;

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Script validation error: ${error.message}`);
        }

        return validation;
    }

    async validatePythonScript(scriptName) {
        if (!scriptName.endsWith('.py')) {
            return null;
        }

        const validation = {
            script: scriptName,
            test: 'python_syntax',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const scriptPath = path.join(this.scriptsPath, scriptName);
            
            // Check if enhanced version exists
            const enhancedPath = scriptPath.replace('.py', '_enhanced.py');
            const actualPath = fs.existsSync(enhancedPath) ? enhancedPath : scriptPath;

            if (!fs.existsSync(actualPath)) {
                validation.status = 'SKIP';
                validation.details.message = 'Script not found for syntax check';
                return validation;
            }

            // Check Python syntax
            execSync(`python -m py_compile "${actualPath}"`, { 
                timeout: CONFIG.VALIDATION_TIMEOUT,
                stdio: 'pipe'
            });

            validation.status = 'PASS';
            validation.details.message = 'Python syntax valid';
            validation.details.file_path = actualPath;

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Python syntax error: ${error.message}`);
        }

        return validation;
    }

    async validatePowerShellScript(scriptName) {
        if (!scriptName.endsWith('.ps1')) {
            return null;
        }

        const validation = {
            script: scriptName,
            test: 'powershell_syntax',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            const scriptPath = path.join(this.scriptsPath, scriptName);
            
            // Check if enhanced version exists
            const enhancedPath = scriptPath.replace('.ps1', '_enhanced.ps1');
            const actualPath = fs.existsSync(enhancedPath) ? enhancedPath : scriptPath;

            if (!fs.existsSync(actualPath)) {
                validation.status = 'SKIP';
                validation.details.message = 'Script not found for syntax check';
                return validation;
            }

            // Check PowerShell syntax
            execSync(`powershell -Command "& { $ErrorActionPreference = 'Stop'; [System.Management.Automation.PSParser]::Tokenize((Get-Content '${actualPath}' -Raw), [ref]$null) | Out-Null }"`, {
                timeout: CONFIG.VALIDATION_TIMEOUT,
                stdio: 'pipe'
            });

            validation.status = 'PASS';
            validation.details.message = 'PowerShell syntax valid';
            validation.details.file_path = actualPath;

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`PowerShell syntax error: ${error.message}`);
        }

        return validation;
    }

    async validateWorkflowDependencies() {
        const validation = {
            script: 'WORKFLOW_DEPENDENCIES',
            test: 'dependencies_check',
            status: 'UNKNOWN',
            details: {},
            errors: []
        };

        try {
            // Check required directories
            const requiredDirs = [
                this.scriptsPath,
                this.reportsPath
            ];

            const missingDirs = [];
            for (const dir of requiredDirs) {
                if (!fs.existsSync(dir)) {
                    missingDirs.push(dir);
                }
            }

            // Check requirements file
            const reqFile = path.join(CONFIG.REPO_ROOT, CONFIG.REQUIREMENTS_FILE);
            if (!fs.existsSync(reqFile)) {
                validation.errors.push(`Requirements file missing: ${reqFile}`);
            }

            // Check Python availability
            try {
                execSync('python --version', { stdio: 'pipe', timeout: 5000 });
                validation.details.python_available = true;
            } catch {
                validation.errors.push('Python not available in PATH');
            }

            // Check PowerShell availability
            try {
                execSync('powershell -Command "Get-Host"', { stdio: 'pipe', timeout: 5000 });
                validation.details.powershell_available = true;
            } catch {
                validation.errors.push('PowerShell not available');
            }

            if (missingDirs.length > 0) {
                validation.errors.push(`Missing directories: ${missingDirs.join(', ')}`);
            }

            validation.status = validation.errors.length === 0 ? 'PASS' : 'FAIL';
            validation.details.checked_directories = requiredDirs.length;
            validation.details.missing_directories = missingDirs.length;

        } catch (error) {
            validation.status = 'FAIL';
            validation.errors.push(`Dependencies check error: ${error.message}`);
        }

        return validation;
    }

    async validateMilestone25Workflow() {
        this.log('🎯 Starting Milestone-25 Accelerator Validation...', 'INFO');
        this.log(`Repository: ${CONFIG.REPO_ROOT}`, 'INFO');
        this.log(`Scripts Directory: ${this.scriptsPath}`, 'INFO');
        
        // Validate workflow dependencies first
        const depsValidation = await this.validateWorkflowDependencies();
        this.results.validations.push(depsValidation);
        
        if (depsValidation.status === 'FAIL') {
            this.log('⚠️ Workflow dependencies have issues - continuing with script validation', 'WARN');
            depsValidation.errors.forEach(error => {
                this.log(`  - ${error}`, 'WARN');
            });
        }

        // Validate each required script
        for (const scriptName of this.requiredScripts) {
            this.results.summary.total_scripts++;
            
            try {
                // File existence check
                const existsValidation = await this.validateScriptExists(scriptName);
                this.results.validations.push(existsValidation);
                
                if (existsValidation.status === 'FAIL') {
                    this.results.summary.missing_scripts++;
                    this.log(`❌ ${scriptName} - MISSING`, 'ERROR');
                    continue;
                }
                
                // Syntax validation
                const pythonValidation = await this.validatePythonScript(scriptName);
                if (pythonValidation) {
                    this.results.validations.push(pythonValidation);
                }
                
                const powershellValidation = await this.validatePowerShellScript(scriptName);
                if (powershellValidation) {
                    this.results.validations.push(powershellValidation);
                }
                
                // Check if script passed all validations
                const scriptValidations = this.results.validations.filter(v => v.script === scriptName);
                const allPassed = scriptValidations.every(v => v.status === 'PASS' || v.status === 'SKIP');
                
                if (allPassed) {
                    this.results.summary.validated_scripts++;
                    this.log(`✅ ${scriptName} - VALIDATED`, 'SUCCESS');
                } else {
                    this.results.summary.failed_scripts++;
                    this.log(`❌ ${scriptName} - FAILED VALIDATION`, 'ERROR');
                }
                
            } catch (error) {
                this.results.summary.failed_scripts++;
                this.log(`❌ Error validating ${scriptName}: ${error.message}`, 'ERROR');
            }
        }
        
        // Determine overall workflow readiness
        const criticalFailures = this.results.summary.missing_scripts + this.results.summary.failed_scripts;
        this.results.workflow_ready = criticalFailures === 0;
        this.results.overall_status = this.results.workflow_ready ? 'PASS' : 'FAIL';
        
        // Save validation results
        await this.saveValidationResults();
        
        // Print summary
        this.printValidationSummary();
        
        return this.results.workflow_ready ? 0 : 1;
    }

    async saveValidationResults() {
        try {
            // Ensure reports directory exists
            if (!fs.existsSync(this.reportsPath)) {
                fs.mkdirSync(this.reportsPath, { recursive: true });
            }
            
            const resultsFile = path.join(this.reportsPath, 'milestone25_validation_results.json');
            fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
            
            this.log(`✅ Validation results saved: ${resultsFile}`, 'SUCCESS');
            
        } catch (error) {
            this.log(`❌ Failed to save validation results: ${error.message}`, 'ERROR');
        }
    }

    printValidationSummary() {
        this.log('', 'INFO');
        this.log('📊 MILESTONE-25 VALIDATION SUMMARY', 'INFO');
        this.log('====================================', 'INFO');
        this.log(`Overall Status: ${this.results.overall_status}`, 
                 this.results.overall_status === 'PASS' ? 'SUCCESS' : 'ERROR');
        this.log(`Workflow Ready: ${this.results.workflow_ready ? 'YES' : 'NO'}`, 
                 this.results.workflow_ready ? 'SUCCESS' : 'ERROR');
        this.log(`Total Scripts: ${this.results.summary.total_scripts}`, 'INFO');
        this.log(`Validated: ${this.results.summary.validated_scripts}`, 'SUCCESS');
        this.log(`Failed: ${this.results.summary.failed_scripts}`, 'ERROR');
        this.log(`Missing: ${this.results.summary.missing_scripts}`, 'ERROR');
        
        this.log('', 'INFO');
        if (this.results.workflow_ready) {
            this.log('🎉 Milestone-25 Accelerator is READY for execution!', 'SUCCESS');
            this.log('✅ All required scripts validated successfully', 'SUCCESS');
            this.log('🚀 You can now run your PowerShell workflow', 'SUCCESS');
        } else {
            this.log('❌ Milestone-25 Accelerator is NOT ready for execution', 'ERROR');
            this.log('🔧 Please address the validation failures above', 'ERROR');
            
            // Show specific issues
            const failedValidations = this.results.validations.filter(v => v.status === 'FAIL');
            if (failedValidations.length > 0) {
                this.log('', 'INFO');
                this.log('🚨 Critical Issues Found:', 'ERROR');
                failedValidations.forEach(v => {
                    this.log(`  - ${v.script}: ${v.errors.join(', ')}`, 'ERROR');
                });
            }
        }
    }
}

// Main execution
async function main() {
    const validator = new Milestone25Validator();
    
    try {
        const exitCode = await validator.validateMilestone25Workflow();
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

module.exports = { Milestone25Validator };
