import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy();
  await mockToken.waitForDeployment();
  console.log("MockToken deployed to:", await mockToken.getAddress());

  // Deploy TaskPlatform
  const treasury = deployer.address; // For testing, use deployer as treasury
  const insurancePool = deployer.address; // For testing, use deployer as insurance pool

  const TaskPlatform = await ethers.getContractFactory("TaskPlatform");
  const taskPlatform = await TaskPlatform.deploy(treasury, insurancePool);
  await taskPlatform.waitForDeployment();
  console.log("TaskPlatform deployed to:", await taskPlatform.getAddress());

  // Save contract addresses
  const fs = require("fs");
  const addresses = {
    mockToken: await mockToken.getAddress(),
    taskPlatform: await taskPlatform.getAddress(),
    treasury,
    insurancePool,
  };

  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 