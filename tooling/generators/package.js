const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for package name
rl.question('Package name: ', (name) => {
  const directory = path.join(__dirname, '../../packages', name);
  
  if (fs.existsSync(directory)) {
    console.error(`Package ${name} already exists!`);
    rl.close();
    return;
  }
  
  fs.mkdirSync(directory, { recursive: true });
  
  // Create package.json
  const packageJson = {
    "name": name,
    "version": "0.0.0",
    "private": true,
    "main": "./index.ts",
    "types": "./index.ts",
    "scripts": {
      "lint": "eslint .",
      "typecheck": "tsc --noEmit"
    },
    "devDependencies": {
      "eslint-config": "workspace:*",
      "tsconfig": "workspace:*",
      "typescript": "^5.3.3"
    }
  };
  
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create index.ts
  fs.writeFileSync(
    path.join(directory, 'index.ts'),
    `// Export your package functions and types here
`
  );
  
  // Create tsconfig.json
  const tsConfig = {
    "extends": "tsconfig/base.json",
    "include": ["."],
    "exclude": ["node_modules", "dist"]
  };
  
  fs.writeFileSync(
    path.join(directory, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
  
  console.log(`Package ${name} created at ${directory}`);
  rl.close();
});