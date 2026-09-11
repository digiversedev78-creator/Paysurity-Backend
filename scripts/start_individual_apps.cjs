/**
 * Individual Application Servers
 * Starts each application on separate ports for development/testing
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ApplicationStarter {
  constructor() {
    this.apps = [
      {
        name: 'POS Restaurant',
        dir: 'POS-Restaurant',
        port: 3001,
        command: 'npm',
        args: ['run', 'dev']
      },
      {
        name: 'Digital Wallets Web',
        dir: 'DigitalWallets-Web',
        port: 3002,
        command: 'npm',
        args: ['run', 'dev']
      },
      {
        name: 'Merchant Portal',
        dir: 'Merchant Portal',
        port: 3003,
        command: 'npm',
        args: ['run', 'dev']
      },
      {
        name: 'Super Admin',
        dir: 'Super Admin',
        port: 3004,
        command: 'npm',
        args: ['run', 'dev']
      },
      {
        name: 'Employee Portal (Payroll UI)',
        dir: 'Payroll-UI',
        port: 3005,
        command: 'npm',
        args: ['run', 'dev']
      }
    ];
    this.processes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkAppDirectory(app) {
    const appPath = path.join(__dirname, '..', app.dir);
    const packagePath = path.join(appPath, 'package.json');
    
    if (!fs.existsSync(appPath)) {
      this.log(`Directory not found: ${app.dir}`, 'error');
      return false;
    }
    
    if (!fs.existsSync(packagePath)) {
      this.log(`package.json not found in: ${app.dir}`, 'error');
      return false;
    }
    
    return true;
  }

  async installDependencies(app) {
    return new Promise((resolve) => {
      this.log(`Installing dependencies for ${app.name}...`);
      
      const appPath = path.join(__dirname, '..', app.dir);
      const installProcess = spawn('npm', ['install'], {
        cwd: appPath,
        stdio: 'pipe',
        shell: true
      });
      
      installProcess.on('close', (code) => {
        if (code === 0) {
          this.log(`Dependencies installed for ${app.name}`, 'success');
        } else {
          this.log(`Failed to install dependencies for ${app.name}`, 'error');
        }
        resolve(code === 0);
      });
      
      installProcess.on('error', (error) => {
        this.log(`Error installing dependencies for ${app.name}: ${error.message}`, 'error');
        resolve(false);
      });
    });
  }

  async startApp(app) {
    return new Promise((resolve) => {
      this.log(`Starting ${app.name} on port ${app.port}...`);
      
      const appPath = path.join(__dirname, '..', app.dir);
      const appProcess = spawn(app.command, app.args, {
        cwd: appPath,
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: app.port.toString() }
      });
      
      let started = false;
      
      appProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes('localhost') || output.includes('ready')) {
          if (!started) {
            this.log(`${app.name} started successfully on port ${app.port}`, 'success');
            started = true;
            resolve(true);
          }
        }
      });
      
      appProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          this.log(`Port ${app.port} already in use for ${app.name}`, 'error');
          if (!started) {
            started = true;
            resolve(false);
          }
        }
      });
      
      appProcess.on('close', (code) => {
        this.log(`${app.name} process exited with code ${code}`);
      });
      
      appProcess.on('error', (error) => {
        this.log(`Error starting ${app.name}: ${error.message}`, 'error');
        if (!started) {
          started = true;
          resolve(false);
        }
      });
      
      this.processes.push({ name: app.name, process: appProcess });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!started) {
          this.log(`Timeout starting ${app.name}`, 'error');
          started = true;
          resolve(false);
        }
      }, 30000);
    });
  }

  async startAllApps() {
    console.log('🚀 Starting PaySurity Platform Applications');
    console.log('==========================================');
    console.log('');

    let successCount = 0;
    
    for (const app of this.apps) {
      try {
        // Check if directory exists
        if (!(await this.checkAppDirectory(app))) {
          continue;
        }
        
        // Install dependencies (skip if already installed)
        const nodeModulesPath = path.join(__dirname, '..', app.dir, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
          await this.installDependencies(app);
        }
        
        // Start the application
        const success = await this.startApp(app);
        if (success) {
          successCount++;
        }
        
      } catch (error) {
        this.log(`Failed to start ${app.name}: ${error.message}`, 'error');
      }
    }
    
    console.log('');
    console.log('📊 Application Startup Summary:');
    console.log(`✅ Applications Started: ${successCount}/${this.apps.length}`);
    console.log('');
    
    if (successCount > 0) {
      console.log('🌐 Application URLs:');
      this.apps.forEach(app => {
        console.log(`   ${app.name}: http://localhost:${app.port}`);
      });
      console.log('');
      console.log('🎯 Main Platform: http://localhost:3000');
      console.log('');
      console.log('Press Ctrl+C to stop all applications');
    }
    
    return successCount;
  }

  async stopAllApps() {
    this.log('Stopping all applications...');
    
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
  console.log('\n🛑 Shutting down applications...');
  if (global.appStarter) {
    await global.appStarter.stopAllApps();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down applications...');
  if (global.appStarter) {
    await global.appStarter.stopAllApps();
  }
  process.exit(0);
});

if (require.main === module) {
  const starter = new ApplicationStarter();
  global.appStarter = starter;
  
  starter.startAllApps().then(successCount => {
    if (successCount === 0) {
      console.log('❌ No applications started successfully');
      process.exit(1);
    }
  });
}

module.exports = ApplicationStarter;
