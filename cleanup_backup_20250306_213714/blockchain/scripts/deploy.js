const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying contracts...");

  // Deploy a mock token for testing
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("MONNI Token", "MONNI", ethers.parseEther("1000000"));
  await mockToken.waitForDeployment();

  const mockTokenAddress = await mockToken.getAddress();
  console.log(`MockToken deployed to: ${mockTokenAddress}`);

  // Deploy the TaskPlatform contract
  const TaskPlatform = await ethers.getContractFactory("TaskPlatform");
  const taskPlatform = await TaskPlatform.deploy(mockTokenAddress);
  await taskPlatform.waitForDeployment();

  const taskPlatformAddress = await taskPlatform.getAddress();
  console.log(`TaskPlatform deployed to: ${taskPlatformAddress}`);

  // Mint some tokens to the deployer
  const [deployer] = await ethers.getSigners();
  await mockToken.mint(deployer.address, ethers.parseEther("10000"));
  console.log(`Minted 10,000 MONNI tokens to ${deployer.address}`);

  // Save the contract addresses to .env.local in the frontend directory
  const envPath = path.join(__dirname, '../../frontend/.env.local');

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${taskPlatformAddress}`;
  const tokenAddressLine = `NEXT_PUBLIC_TOKEN_ADDRESS=${mockTokenAddress}`;
  const rpcUrlLine = 'NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545';
  
  if (envContent) {
    // Update existing values
    envContent = envContent
      .replace(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m, contractAddressLine)
      .replace(/^NEXT_PUBLIC_TOKEN_ADDRESS=.*$/m, tokenAddressLine)
      .replace(/^NEXT_PUBLIC_RPC_URL=.*$/m, rpcUrlLine);
    
    // Add token address if it doesn't exist
    if (!envContent.includes('NEXT_PUBLIC_TOKEN_ADDRESS')) {
      envContent += `\n${tokenAddressLine}`;
    }
  } else {
    // Create new file with values
    envContent = `${contractAddressLine}\n${tokenAddressLine}\n${rpcUrlLine}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Contract addresses saved to frontend/.env.local`);

  // Generate ABI files
  const contractsDir = path.join(__dirname, '../../frontend/src/contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save TaskPlatform ABI
  const taskPlatformArtifact = await artifacts.readArtifact("TaskPlatform");
  fs.writeFileSync(
    path.join(contractsDir, 'TaskPlatform.json'),
    JSON.stringify(taskPlatformArtifact, null, 2)
  );

  // Save MockToken ABI
  const mockTokenArtifact = await artifacts.readArtifact("MockToken");
  fs.writeFileSync(
    path.join(contractsDir, 'MockToken.json'),
    JSON.stringify(mockTokenArtifact, null, 2)
  );

  console.log("Contract ABIs generated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 