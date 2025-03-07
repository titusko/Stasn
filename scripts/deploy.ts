import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy the contract
  const TaskPlatform = await ethers.getContractFactory("TaskPlatform");
  const taskPlatform = await TaskPlatform.deploy();
  await taskPlatform.waitForDeployment();

  const address = await taskPlatform.getAddress();
  console.log(`TaskPlatform deployed to: ${address}`);

  // Save the contract address to .env.local in the frontend directory
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../frontend/.env.local');

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`;
  const rpcUrlLine = 'NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545';
  
  if (envContent) {
    // Update existing values
    envContent = envContent
      .replace(/^NEXT_PUBLIC_CONTRACT_ADDRESS=.*$/m, contractAddressLine)
      .replace(/^NEXT_PUBLIC_RPC_URL=.*$/m, rpcUrlLine);
  } else {
    // Create new file with values
    envContent = `${contractAddressLine}\n${rpcUrlLine}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Contract address saved to frontend/.env.local`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 