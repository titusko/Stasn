
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying contracts...");

  // Deploy a mock token for testing
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Task Token", "TASK", ethers.parseEther("1000000"));
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
  console.log(`Minted 10,000 TASK tokens to ${deployer.address}`);

  // Save the contract addresses
  const contractsDir = path.join(__dirname, "../../contracts-sdk");
  
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Generate contract addresses file
  fs.writeFileSync(
    path.join(contractsDir, "addresses.ts"),
    `export const TASK_TOKEN_ADDRESS = "${mockTokenAddress}";\nexport const TASK_PLATFORM_ADDRESS = "${taskPlatformAddress}";\n`
  );
  console.log("Contract addresses saved to contracts-sdk/addresses.ts");

  // Save ABIs
  const TaskPlatformArtifact = await artifacts.readArtifact("TaskPlatform");
  const MockTokenArtifact = await artifacts.readArtifact("MockToken");

  fs.writeFileSync(
    path.join(contractsDir, "TaskPlatformABI.ts"),
    `export const TaskPlatformABI = ${JSON.stringify(TaskPlatformArtifact.abi, null, 2)} as const;\n`
  );

  fs.writeFileSync(
    path.join(contractsDir, "TaskTokenABI.ts"),
    `export const TaskTokenABI = ${JSON.stringify(MockTokenArtifact.abi, null, 2)} as const;\n`
  );

  console.log("Contract ABIs saved to contracts-sdk directory");

  // Generate index file
  fs.writeFileSync(
    path.join(contractsDir, "index.ts"),
    `export * from './addresses';\nexport * from './TaskPlatformABI';\nexport * from './TaskTokenABI';\n`
  );
  console.log("Contracts SDK generated successfully");

  // Save the contract addresses to .env.local in the web app directory
  const envPath = path.join(__dirname, "../../../apps/web/.env.local");
  const envContent = `NEXT_PUBLIC_TASK_TOKEN_ADDRESS=${mockTokenAddress}\nNEXT_PUBLIC_TASK_PLATFORM_ADDRESS=${taskPlatformAddress}\nNEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log("Contract addresses saved to apps/web/.env.local");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
