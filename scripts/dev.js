
#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting development environment...');

// Detect package manager
const packageManager = 'pnpm';

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

  // Just run the main development command which will start all apps
  const devProc = runCommandInDirectory(`${packageManager} run dev`, path.resolve(__dirname, '..'));

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Terminating development servers...');
    devProc.kill();
    process.exit(0);
  });
} catch (error) {
  console.error('Error starting development servers:', error);
  process.exit(1);
}
