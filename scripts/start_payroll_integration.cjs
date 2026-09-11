/**
 * Payroll Integration Startup Script
 * Starts both Payroll-API and Payroll-UI for integrated testing
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

class PayrollIntegrationStarter {
  constructor() {
    this.processes = [];
    this.apiPort = 3006;
    this.uiPort = 3007;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async waitForServer(port, maxAttempts = 30) {
    return new Promise((resolve) => {
      let attempts = 0;
      
      const checkServer = () => {
        const req = http.get(`http://localhost:${port}/health`, (res) => {
          if (res.statusCode === 200) {
            resolve(true);
          } else {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkServer, 1000);
            } else {
              resolve(false);
            }
          }
        });
        
        req.on('error', () => {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkServer, 1000);
          } else {
            resolve(false);
          }
        });
      };
      
      checkServer();
    });
  }

  async startPayrollAPI() {
    return new Promise((resolve) => {
      this.log('Starting Payroll API server...');
      
      const apiPath = path.join(__dirname, '..', 'Payroll-API');
      const apiProcess = spawn('npm', ['run', 'dev'], {
        cwd: apiPath,
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: this.apiPort.toString() }
      });
      
      let started = false;
      
      apiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[API] ${output.trim()}`);
        
        if (output.includes('running on port') || output.includes('listening')) {
          if (!started) {
            this.log(`Payroll API started on port ${this.apiPort}`, 'success');
            started = true;
            resolve(true);
          }
        }
      });
      
      apiProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`[API ERROR] ${error.trim()}`);
        
        if (error.includes('EADDRINUSE')) {
          this.log(`Port ${this.apiPort} already in use for API`, 'error');
          if (!started) {
            started = true;
            resolve(false);
          }
        }
      });
      
      apiProcess.on('close', (code) => {
        this.log(`Payroll API process exited with code ${code}`);
      });
      
      apiProcess.on('error', (error) => {
        this.log(`Error starting Payroll API: ${error.message}`, 'error');
        if (!started) {
          started = true;
          resolve(false);
        }
      });
      
      this.processes.push({ name: 'Payroll API', process: apiProcess });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!started) {
          this.log('Timeout starting Payroll API', 'error');
          started = true;
          resolve(false);
        }
      }, 30000);
    });
  }

  async startPayrollUI() {
    return new Promise((resolve) => {
      this.log('Starting Payroll UI server...');
      
      const uiPath = path.join(__dirname, '..', 'Payroll-UI');
      const uiProcess = spawn('npm', ['run', 'dev'], {
        cwd: uiPath,
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: this.uiPort.toString() }
      });
      
      let started = false;
      
      uiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[UI] ${output.trim()}`);
        
        if (output.includes('Local:') || output.includes('localhost') || output.includes('ready')) {
          if (!started) {
            this.log(`Payroll UI started on port ${this.uiPort}`, 'success');
            started = true;
            resolve(true);
          }
        }
      });
      
      uiProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`[UI ERROR] ${error.trim()}`);
        
        if (error.includes('EADDRINUSE')) {
          this.log(`Port ${this.uiPort} already in use for UI`, 'error');
          if (!started) {
            started = true;
            resolve(false);
          }
        }
      });
      
      uiProcess.on('close', (code) => {
        this.log(`Payroll UI process exited with code ${code}`);
      });
      
      uiProcess.on('error', (error) => {
        this.log(`Error starting Payroll UI: ${error.message}`, 'error');
        if (!started) {
          started = true;
          resolve(false);
        }
      });
      
      this.processes.push({ name: 'Payroll UI', process: uiProcess });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!started) {
          this.log('Timeout starting Payroll UI', 'error');
          started = true;
          resolve(false);
        }
      }, 30000);
    });
  }

  async testIntegration() {
    this.log('Testing Payroll API-UI integration...');
    
    try {
      // Test API health
      const apiHealthy = await this.waitForServer(this.apiPort, 10);
      if (apiHealthy) {
        this.log('Payroll API health check passed', 'success');
      } else {
        this.log('Payroll API health check failed', 'error');
        return false;
      }
      
      // Test UI accessibility
      const uiHealthy = await this.waitForServer(this.uiPort, 10);
      if (uiHealthy) {
        this.log('Payroll UI accessibility check passed', 'success');
      } else {
        this.log('Payroll UI accessibility check failed', 'error');
        return false;
      }
      
      return true;
      
    } catch (error) {
      this.log(`Integration test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async start() {
    console.log('🚀 PaySurity Payroll Integration Startup');
    console.log('========================================');
    console.log('');
    
    try {
      // Start API first
      const apiStarted = await this.startPayrollAPI();
      if (!apiStarted) {
        this.log('Failed to start Payroll API', 'error');
        return false;
      }
      
      // Wait a moment for API to fully initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start UI
      const uiStarted = await this.startPayrollUI();
      if (!uiStarted) {
        this.log('Failed to start Payroll UI', 'error');
        return false;
      }
      
      // Wait a moment for UI to fully initialize
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test integration
      const integrationWorking = await this.testIntegration();
      
      console.log('');
      console.log('📊 Payroll Integration Status:');
      console.log(`   API Server: ${apiStarted ? '✅ Running' : '❌ Failed'} (Port ${this.apiPort})`);
      console.log(`   UI Server: ${uiStarted ? '✅ Running' : '❌ Failed'} (Port ${this.uiPort})`);
      console.log(`   Integration: ${integrationWorking ? '✅ Working' : '❌ Failed'}`);
      console.log('');
      
      if (apiStarted && uiStarted && integrationWorking) {
        console.log('🎉 Payroll Integration Successfully Started!');
        console.log('');
        console.log('🌐 Access URLs:');
        console.log(`   Payroll API: http://localhost:${this.apiPort}`);
        console.log(`   Payroll UI: http://localhost:${this.uiPort}`);
        console.log(`   API Health: http://localhost:${this.apiPort}/health`);
        console.log(`   Main Platform: http://localhost:3000/apps/employee-portal`);
        console.log('');
        console.log('🎯 Test Integration:');
        console.log('   1. Open Payroll UI in browser');
        console.log('   2. Check dashboard loads with real API data');
        console.log('   3. Test employee management features');
        console.log('   4. Verify payroll processing workflows');
        console.log('');
        console.log('Press Ctrl+C to stop all services');
        
        return true;
      } else {
        this.log('Payroll integration startup failed', 'error');
        return false;
      }
      
    } catch (error) {
      this.log(`Startup failed: ${error.message}`, 'error');
      return false;
    }
  }

  async stop() {
    this.log('Stopping Payroll integration services...');
    
    this.processes.forEach(({ name, process }) => {
      try {
        process.kill('SIGTERM');
        this.log(`Stopped ${name}`, 'success');
      } catch (error) {
        this.log(`Error stopping ${name}: ${error.message}`, 'error');
      }
    });
    
    this.processes = [];
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Payroll integration...');
  if (global.payrollStarter) {
    await global.payrollStarter.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Payroll integration...');
  if (global.payrollStarter) {
    await global.payrollStarter.stop();
  }
  process.exit(0);
});

if (require.main === module) {
  const starter = new PayrollIntegrationStarter();
  global.payrollStarter = starter;
  
  starter.start().then(success => {
    if (!success) {
      console.log('❌ Payroll integration startup failed');
      process.exit(1);
    }
  });
}

module.exports = PayrollIntegrationStarter;
