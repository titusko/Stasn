
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying contracts...");

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy();
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log(`MockToken deployed to: ${tokenAddress}`);

  // Deploy TaskPlatform
  const TaskPlatform = await ethers.getContractFactory("TaskPlatform");
  const taskPlatform = await TaskPlatform.deploy();
  await taskPlatform.waitForDeployment();
  const platformAddress = await taskPlatform.getAddress();
  console.log(`TaskPlatform deployed to: ${platformAddress}`);

  // Set payment token on TaskPlatform
  const tx = await taskPlatform.setPaymentToken(tokenAddress);
  await tx.wait();
  console.log("Set MockToken as payment token for TaskPlatform");

  // Save contract addresses to .env.local in the web app directory
  const envPath = path.join(__dirname, "../../../apps/web/.env.local");
  
  let envContent = '';
  try {
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }
  } catch (error) {
    console.log("No existing .env.local file, creating new one");
  }

  const tokenAddressLine = `NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`;
  const platformAddressLine = `NEXT_PUBLIC_TASK_PLATFORM_ADDRESS=${platformAddress}`;
  const rpcUrlLine = "NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545";
  
  if (envContent) {
    // Update existing values
    envContent = envContent
      .replace(/^NEXT_PUBLIC_TOKEN_ADDRESS=.*$/m, tokenAddressLine)
      .replace(/^NEXT_PUBLIC_TASK_PLATFORM_ADDRESS=.*$/m, platformAddressLine)
      .replace(/^NEXT_PUBLIC_RPC_URL=.*$/m, rpcUrlLine);
  } else {
    // Create new file with values
    envContent = `${tokenAddressLine}\n${platformAddressLine}\n${rpcUrlLine}\n`;
  }

  // Ensure directory exists
  const dir = path.dirname(envPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Contract addresses saved to ${envPath}`);

  // Copy ABIs to the web app
  const abiDir = path.join(__dirname, "../../../apps/web/src/contracts");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Save Task Platform ABI
  const taskPlatformArtifact = await artifacts.readArtifact("TaskPlatform");
  fs.writeFileSync(
    path.join(abiDir, "TaskPlatform.json"),
    JSON.stringify(taskPlatformArtifact, null, 2)
  );

  // Save MockToken ABI
  const mockTokenArtifact = await artifacts.readArtifact("MockToken");
  fs.writeFileSync(
    path.join(abiDir, "MockToken.json"),
    JSON.stringify(mockTokenArtifact, null, 2)
  );

  console.log("Contract ABIs copied to web app");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
