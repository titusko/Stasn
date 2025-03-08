
#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 Starting development environment...');

try {
  console.log('\n📦 Installing dependencies...');
  execSync('pnpm install', { stdio: 'inherit' });

  console.log('\n🔨 Starting development servers...');
  execSync('pnpm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ Error starting development environment:', error);
  process.exit(1);
}
