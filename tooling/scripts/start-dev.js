
const { spawn } = require('child_process');
const path = require('path');

// Start the Hardhat node
const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
  cwd: path.join(__dirname, '../../packages/blockchain'),
  stdio: 'inherit',
});

// Wait a bit for the node to start
setTimeout(() => {
  // Deploy contracts
  const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.ts', '--network', 'localhost'], {
    cwd: path.join(__dirname, '../../packages/blockchain'),
    stdio: 'inherit',
  });

  deployProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Contract deployment failed');
      process.exit(1);
    }

    // Start development servers
    const turboProcess = spawn('pnpm', ['run', 'dev'], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
    });

    turboProcess.on('close', (code) => {
      hardhatProcess.kill();
      process.exit(code);
    });
  });
}, 5000);

// Handle termination
process.on('SIGINT', () => {
  hardhatProcess.kill();
  process.exit(0);
});
