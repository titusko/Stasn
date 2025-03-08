import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy MockToken first
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy();
  await mockToken.deploymentTransaction().wait();

  console.log(`MockToken deployed to ${mockToken.target}`);

  // Deploy TaskPlatform with the MockToken address
  const TaskPlatform = await ethers.getContractFactory("TaskPlatform");
  const taskPlatform = await TaskPlatform.deploy(mockToken.target);
  await taskPlatform.deploymentTransaction().wait();

  console.log(`TaskPlatform deployed to ${taskPlatform.target}`);

  console.log("Deployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});