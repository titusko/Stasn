
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create main directory structure
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

// Create directories
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Move files from frontend to apps/web
if (fs.existsSync(path.join(__dirname, 'frontend'))) {
  console.log('Moving frontend files to apps/web...');
  
  const frontendDir = path.join(__dirname, 'frontend');
  const targetDir = path.join(__dirname, 'apps/web');
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy files from frontend to apps/web
  fs.readdirSync(frontendDir).forEach(item => {
    const srcPath = path.join(frontendDir, item);
    const destPath = path.join(targetDir, item);
    
    if (fs.existsSync(destPath)) {
      if (fs.lstatSync(destPath).isDirectory()) {
        // Delete the directory
        try {
          fs.rmSync(destPath, { recursive: true, force: true });
        } catch (err) {
          console.error(`Error removing directory ${destPath}:`, err);
        }
      } else {
        // Delete the file
        try {
          fs.unlinkSync(destPath);
        } catch (err) {
          console.error(`Error removing file ${destPath}:`, err);
        }
      }
    }
    
    try {
      if (fs.lstatSync(srcPath).isDirectory()) {
        // Copy directory
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`Copied ${srcPath} to ${destPath}`);
    } catch (err) {
      console.error(`Error copying ${srcPath}:`, err);
    }
  });
}

// Move files from backend to apps/api
if (fs.existsSync(path.join(__dirname, 'backend'))) {
  console.log('Moving backend files to apps/api...');
  
  const backendDir = path.join(__dirname, 'backend');
  const targetDir = path.join(__dirname, 'apps/api');
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy files from backend to apps/api
  fs.readdirSync(backendDir).forEach(item => {
    const srcPath = path.join(backendDir, item);
    const destPath = path.join(targetDir, item);
    
    if (fs.existsSync(destPath)) {
      if (fs.lstatSync(destPath).isDirectory()) {
        // Delete the directory
        try {
          fs.rmSync(destPath, { recursive: true, force: true });
        } catch (err) {
          console.error(`Error removing directory ${destPath}:`, err);
        }
      } else {
        // Delete the file
        try {
          fs.unlinkSync(destPath);
        } catch (err) {
          console.error(`Error removing file ${destPath}:`, err);
        }
      }
    }
    
    try {
      if (fs.lstatSync(srcPath).isDirectory()) {
        // Copy directory
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`Copied ${srcPath} to ${destPath}`);
    } catch (err) {
      console.error(`Error copying ${srcPath}:`, err);
    }
  });
}

// Move blockchain files to packages/blockchain
if (fs.existsSync(path.join(__dirname, 'blockchain'))) {
  console.log('Moving blockchain files to packages/blockchain...');
  
  const blockchainDir = path.join(__dirname, 'blockchain');
  const targetDir = path.join(__dirname, 'packages/blockchain');
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy files from blockchain to packages/blockchain
  fs.readdirSync(blockchainDir).forEach(item => {
    const srcPath = path.join(blockchainDir, item);
    const destPath = path.join(targetDir, item);
    
    if (fs.existsSync(destPath)) {
      if (fs.lstatSync(destPath).isDirectory()) {
        // Delete the directory
        try {
          fs.rmSync(destPath, { recursive: true, force: true });
        } catch (err) {
          console.error(`Error removing directory ${destPath}:`, err);
        }
      } else {
        // Delete the file
        try {
          fs.unlinkSync(destPath);
        } catch (err) {
          console.error(`Error removing file ${destPath}:`, err);
        }
      }
    }
    
    try {
      if (fs.lstatSync(srcPath).isDirectory()) {
        // Copy directory
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`Copied ${srcPath} to ${destPath}`);
    } catch (err) {
      console.error(`Error copying ${srcPath}:`, err);
    }
  });
}

// Move component files to packages/ui
if (fs.existsSync(path.join(__dirname, 'components'))) {
  console.log('Moving component files to packages/ui...');
  
  const componentsDir = path.join(__dirname, 'components');
  const targetDir = path.join(__dirname, 'packages/ui/components');
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy files from components to packages/ui/components
  fs.readdirSync(componentsDir).forEach(item => {
    const srcPath = path.join(componentsDir, item);
    const destPath = path.join(targetDir, item);
    
    if (fs.existsSync(destPath)) {
      if (fs.lstatSync(destPath).isDirectory()) {
        // Delete the directory
        try {
          fs.rmSync(destPath, { recursive: true, force: true });
        } catch (err) {
          console.error(`Error removing directory ${destPath}:`, err);
        }
      } else {
        // Delete the file
        try {
          fs.unlinkSync(destPath);
        } catch (err) {
          console.error(`Error removing file ${destPath}:`, err);
        }
      }
    }
    
    try {
      if (fs.lstatSync(srcPath).isDirectory()) {
        // Copy directory
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`Copied ${srcPath} to ${destPath}`);
    } catch (err) {
      console.error(`Error copying ${srcPath}:`, err);
    }
  });
  
  // Create package.json for ui package
  const uiPackageJson = {
    "name": "ui",
    "version": "0.0.0",
    "private": true,
    "main": "./index.ts",
    "types": "./index.ts",
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    },
    "devDependencies": {
      "@types/react": "^18.3.18",
      "@types/react-dom": "^18.3.5",
      "tsconfig": "workspace:*"
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'packages/ui/package.json'),
    JSON.stringify(uiPackageJson, null, 2)
  );
  
  // Create index.ts for ui package
  fs.writeFileSync(
    path.join(__dirname, 'packages/ui/index.ts'),
    `export * from './components';\n`
  );
}

// Create package.json files for packages
const createPackageJsons = {
  'packages/tsconfig/package.json': {
    "name": "tsconfig",
    "version": "0.0.0",
    "private": true,
    "files": [
      "base.json",
      "nextjs.json",
      "react-library.json",
      "blockchain.json"
    ]
  },
  'packages/eslint-config/package.json': {
    "name": "eslint-config",
    "version": "0.0.0",
    "private": true,
    "main": "index.js",
    "dependencies": {
      "eslint-config-next": "^14.1.0",
      "eslint-config-prettier": "^9.1.0"
    }
  },
  'packages/ipfs/package.json': {
    "name": "ipfs",
    "version": "0.0.0",
    "private": true,
    "main": "./index.ts",
    "types": "./index.ts",
    "dependencies": {
      "axios": "^1.4.0"
    },
    "devDependencies": {
      "tsconfig": "workspace:*"
    }
  }
};

Object.entries(createPackageJsons).forEach(([filePath, content]) => {
  fs.writeFileSync(
    path.join(__dirname, filePath),
    JSON.stringify(content, null, 2)
  );
  console.log(`Created file: ${filePath}`);
});

// Create tsconfig files
const createTsConfigFiles = {
  'packages/tsconfig/base.json': {
    "$schema": "https://json.schemastore.org/tsconfig",
    "display": "Default",
    "compilerOptions": {
      "target": "es2022",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "composite": false,
      "declaration": true,
      "declarationMap": true,
      "inlineSources": false,
      "noUnusedLocals": false,
      "noUnusedParameters": false,
      "preserveWatchOutput": true
    },
    "exclude": ["node_modules"]
  },
  'packages/tsconfig/nextjs.json': {
    "$schema": "https://json.schemastore.org/tsconfig",
    "display": "Next.js",
    "extends": "./base.json",
    "compilerOptions": {
      "plugins": [{ "name": "next" }],
      "allowJs": true,
      "declaration": false,
      "declarationMap": false,
      "incremental": true,
      "jsx": "preserve",
      "lib": ["dom", "dom.iterable", "esnext"],
      "module": "esnext",
      "noEmit": true,
      "resolveJsonModule": true,
      "strict": false,
      "target": "es5"
    },
    "include": ["src", "next-env.d.ts"],
    "exclude": ["node_modules"]
  },
  'packages/tsconfig/react-library.json': {
    "$schema": "https://json.schemastore.org/tsconfig",
    "display": "React Library",
    "extends": "./base.json",
    "compilerOptions": {
      "jsx": "react-jsx",
      "lib": ["es2022", "dom", "dom.iterable"],
      "module": "ESNext",
      "target": "es2022"
    }
  },
  'packages/tsconfig/blockchain.json': {
    "$schema": "https://json.schemastore.org/tsconfig",
    "display": "Blockchain",
    "extends": "./base.json",
    "compilerOptions": {
      "module": "commonjs",
      "target": "es2022",
      "esModuleInterop": true
    }
  }
};

Object.entries(createTsConfigFiles).forEach(([filePath, content]) => {
  fs.writeFileSync(
    path.join(__dirname, filePath),
    JSON.stringify(content, null, 2)
  );
  console.log(`Created file: ${filePath}`);
});

// Create generators
const createGenerators = {
  'tooling/generators/component.js': `
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for component name
rl.question('Component name: ', (name) => {
  // Ask for component type
  rl.question('Component type (ui/web): ', (type) => {
    const directory = type === 'ui' 
      ? path.join(__dirname, '../../packages/ui/components') 
      : path.join(__dirname, '../../apps/web/src/components');
    
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    const componentPath = path.join(directory, \`\${name}.tsx\`);
    
    // Basic component template
    const componentContent = \`import React from 'react';

interface \${name}Props {
  children?: React.ReactNode;
}

export function \${name}({ children }: \${name}Props) {
  return (
    <div>
      {children}
    </div>
  );
}
\`;
    
    fs.writeFileSync(componentPath, componentContent);
    console.log(\`Component created at \${componentPath}\`);
    
    rl.close();
  });
});
  `,
  'tooling/generators/package.js': `
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
    console.error(\`Package \${name} already exists!\`);
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
    \`// Export your package functions and types here
\`
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
  
  console.log(\`Package \${name} created at \${directory}\`);
  rl.close();
});
  `,
  'tooling/generators/contracts-sdk.js': `
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const blockchainDir = path.join(__dirname, '../../packages/blockchain');
const artifactsDir = path.join(blockchainDir, 'artifacts/contracts');
const outputDir = path.join(__dirname, '../../packages/contracts-sdk');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate TypeScript types from contract artifacts
function generateContractSDK() {
  try {
    // Check if artifacts directory exists
    if (!fs.existsSync(artifactsDir)) {
      console.error('Artifacts directory not found. Please compile contracts first.');
      return;
    }
    
    // Get all contract artifacts
    const contracts = [];
    
    function scanDir(dir) {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
          scanDir(fullPath);
        } else if (dirent.name.endsWith('.json') && !dirent.name.includes('.dbg.')) {
          contracts.push(fullPath);
        }
      });
    }
    
    scanDir(artifactsDir);
    
    // Create index.ts with all exports
    let indexContent = '';
    
    contracts.forEach(contractPath => {
      const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      const contractName = path.basename(contractPath, '.json');
      
      // Generate TypeScript interface for contract ABI
      const abiTypings = \`export const \${contractName}Abi = \${JSON.stringify(contractData.abi, null, 2)} as const;

export type \${contractName}Contract = {
  address: string;
  abi: typeof \${contractName}Abi;
};
\`;
      
      // Write to file
      fs.writeFileSync(
        path.join(outputDir, \`\${contractName}.ts\`),
        abiTypings
      );
      
      // Add to index
      indexContent += \`export * from './\${contractName}';\n\`;
    });
    
    // Write index file
    fs.writeFileSync(
      path.join(outputDir, 'index.ts'),
      indexContent
    );
    
    // Create package.json for contracts-sdk
    const packageJson = {
      "name": "contracts-sdk",
      "version": "0.0.0",
      "private": true,
      "main": "./index.ts",
      "types": "./index.ts",
      "dependencies": {
        "ethers": "^5.7.2"
      },
      "devDependencies": {
        "tsconfig": "workspace:*"
      }
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log('Contract SDK generated successfully!');
  } catch (error) {
    console.error('Error generating contract SDK:', error);
  }
}

generateContractSDK();
  `
};

Object.entries(createGenerators).forEach(([filePath, content]) => {
  fs.writeFileSync(
    path.join(__dirname, filePath),
    content.trim()
  );
  console.log(`Created file: ${filePath}`);
});

// Update root package.json
try {
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add scripts if they don't exist
    packageJson.scripts = {
      ...packageJson.scripts,
      "build": "turbo run build",
      "dev": "turbo run dev",
      "lint": "turbo run lint",
      "test": "turbo run test",
      "typecheck": "turbo run typecheck",
      "clean": "turbo run clean && rm -rf node_modules",
      "format": "prettier --write \"**/*.{ts,tsx,md}\"",
      "create:component": "node ./tooling/generators/component.js",
      "create:package": "node ./tooling/generators/package.js",
      "generate:sdk": "node ./tooling/generators/contracts-sdk.js"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated root package.json');
  }
} catch (error) {
  console.error('Error updating package.json:', error);
}

console.log('Project structure reorganization completed!');
