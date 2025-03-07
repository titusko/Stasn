
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Log with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Execute shell command with error handling
function exec(command, options = {}) {
  try {
    log(`Running: ${command}`, colors.cyan);
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    process.exit(1);
  }
}

// Create directory if it doesn't exist
function createDirIfNotExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, colors.green);
  }
}

// Initialize monorepo structure
function initMonorepo() {
  log('\n🚀 Initializing Monorepo Structure', colors.bright + colors.green);
  
  // Create directory structure
  const directories = [
    'apps/web',
    'apps/api',
    'packages/blockchain',
    'packages/ui',
    'packages/config',
    'packages/tsconfig',
    'packages/eslint-config',
    'packages/ipfs',
    'packages/contracts-sdk',
    'tooling/generators',
    'tooling/scripts',
    'tooling/ci'
  ];
  
  directories.forEach(dir => {
    createDirIfNotExists(dir);
  });
  
  // Install dependencies
  log('\n📦 Installing dependencies...', colors.bright + colors.yellow);
  exec('pnpm install');
  
  // Build packages
  log('\n🔨 Building packages...', colors.bright + colors.yellow);
  exec('pnpm run build');
}

// Setup source files organization
function setupSourceOrganization() {
  log('\n📂 Organizing source files...', colors.bright + colors.yellow);
  
  // Add additional logic here to move files from legacy structure to new monorepo structure
  // This is just a placeholder
}

// Main function
function main() {
  log('\n📋 Monorepo Setup Script', colors.bright);
  log('======================\n');
  
  initMonorepo();
  setupSourceOrganization();
  
  log('\n✅ Monorepo setup complete!', colors.bright + colors.green);
  log('\nNext steps:');
  log('1. Update environment variables in .env file');
  log('2. Run `pnpm run dev` to start development');
  log('3. Run `pnpm run build` to build all packages');
}

main();
