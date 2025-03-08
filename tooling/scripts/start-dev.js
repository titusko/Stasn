#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Detect the package manager
let packageManager = 'npm';
if (fs.existsSync('pnpm-lock.yaml')) {
  packageManager = 'pnpm';
} else if (fs.existsSync('yarn.lock')) {
  packageManager = 'yarn';
}

console.log(`Using package manager: ${packageManager}`);

// Function to run a command in a specific directory
function runCommandInDirectory(command, cwd, env = {}) {
  const [cmd, ...args] = command.split(' ');

  const mergedEnv = { ...process.env, ...env };

  console.log(`Running command in ${cwd}: ${command}`);

  const proc = spawn(cmd, args, {
    cwd,
    env: mergedEnv,
    stdio: 'inherit',
    shell: true,
  });

  return proc;
}

// Install dependencies if needed
try {
  console.log('Checking if dependencies need to be installed...');

  // Check if node_modules exist
  if (!fs.existsSync('node_modules')) {
    console.log('Installing dependencies...');
    execSync(`${packageManager} install`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// Start frontend and backend in development mode
try {
  console.log('Starting development servers...');

  // Start the frontend
  const frontendProc = runCommandInDirectory(
    `${packageManager} run dev`,
    path.resolve(__dirname, '../../apps/web')
  );

  // Start the backend
  const backendProc = runCommandInDirectory(
    `${packageManager} run dev`,
    path.resolve(__dirname, '../../apps/api')
  );

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Terminating development servers...');
    frontendProc.kill();
    backendProc.kill();
    process.exit(0);
  });
} catch (error) {
  console.error('Error starting development servers:', error);
  process.exit(1);
}