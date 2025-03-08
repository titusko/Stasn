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
      const abiTypings = `export const ${contractName}Abi = ${JSON.stringify(contractData.abi, null, 2)} as const;

export type ${contractName}Contract = {
  address: string;
  abi: typeof ${contractName}Abi;
};
`;
      
      // Write to file
      fs.writeFileSync(
        path.join(outputDir, `${contractName}.ts`),
        abiTypings
      );
      
      // Add to index
      indexContent += `export * from './${contractName}';
`;
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