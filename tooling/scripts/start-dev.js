
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Prefix for different services
const prefixes = {
  web: `${colors.bright}${colors.blue}[WEB]${colors.reset}`,
  api: `${colors.bright}${colors.green}[API]${colors.reset}`,
  blockchain: `${colors.bright}${colors.yellow}[CHAIN]${colors.reset}`,
  turbo: `${colors.bright}${colors.magenta}[TURBO]${colors.reset}`,
};

// Function to create a prefixed logger for each service
function createLogger(prefix) {
  return {
    log: (message) => console.log(`${prefix} ${message}`),
    error: (message) => console.error(`${prefix} ${colors.red}${message}${colors.reset}`),
    warn: (message) => console.warn(`${prefix} ${colors.yellow}${message}${colors.reset}`),
    info: (message) => console.info(`${prefix} ${colors.cyan}${message}${colors.reset}`),
  };
}

// Create loggers
const webLogger = createLogger(prefixes.web);
const apiLogger = createLogger(prefixes.api);
const blockchainLogger = createLogger(prefixes.blockchain);
const turboLogger = createLogger(prefixes.turbo);
const mainLogger = createLogger(`${colors.bright}[MAIN]${colors.reset}`);

// Helper function to spawn a process with proper logging
function spawnProcess(command, args, cwd, logger) {
  const proc = spawn(command, args, {
    cwd: path.resolve(__dirname, '../../', cwd),
    shell: true,
    stdio: 'pipe',
  });

  proc.stdout.on('data', (data) => {
    data.toString().trim().split('\n').forEach(line => {
      if (line.trim()) logger.log(line.trim());
    });
  });

  proc.stderr.on('data', (data) => {
    data.toString().trim().split('\n').forEach(line => {
      if (line.trim()) logger.error(line.trim());
    });
  });

  proc.on('error', (error) => {
    logger.error(`Process error: ${error.message}`);
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      logger.warn(`Process exited with code ${code}`);
    } else {
      logger.info('Process completed successfully');
    }
  });

  return proc;
}

// Main function to start all services
async function startDevEnvironment() {
  mainLogger.info('Starting development environment...');

  // Check if hardhat is installed
  if (!fs.existsSync(path.resolve(__dirname, '../../node_modules/.bin/hardhat'))) {
    mainLogger.warn('Hardhat not found. Installing dependencies...');
    spawnProcess('pnpm', ['install'], '.', mainLogger);
  }

  // Start blockchain local node
  mainLogger.info('Starting local blockchain node...');
  const blockchainProc = spawnProcess(
    'npx', 
    ['hardhat', 'node'], 
    'packages/blockchain', 
    blockchainLogger
  );

  // Wait for blockchain node to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Deploy contracts to local node
  mainLogger.info('Deploying contracts to local node...');
  const deployProc = spawnProcess(
    'npx', 
    ['hardhat', 'run', 'scripts/deploy.ts', '--network', 'localhost'], 
    'packages/blockchain', 
    blockchainLogger
  );

  // Wait for deployment to complete
  await new Promise((resolve) => {
    deployProc.on('close', (code) => {
      if (code === 0) {
        mainLogger.info('Contracts deployed successfully');
      } else {
        mainLogger.error('Contract deployment failed');
      }
      resolve();
    });
  });

  // Start dev services using Turborepo
  mainLogger.info('Starting development servers...');
  const turboProc = spawnProcess('pnpm', ['turbo', 'run', 'dev'], '.', turboLogger);

  // Handle process termination
  process.on('SIGINT', () => {
    mainLogger.info('Shutting down development environment...');
    blockchainProc.kill('SIGINT');
    turboProc.kill('SIGINT');
    process.exit(0);
  });
}

// Run the main function
startDevEnvironment().catch(error => {
  mainLogger.error(`Failed to start development environment: ${error.message}`);
  process.exit(1);
});
