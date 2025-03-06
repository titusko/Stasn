
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy TaskToken first
  const TaskToken = await hre.ethers.getContractFactory("TaskToken");
  const taskToken = await TaskToken.deploy();
  await taskToken.deployed();
  console.log("TaskToken deployed to:", taskToken.address);

  // Get deployer address to use as fee collector
  const [deployer] = await hre.ethers.getSigners();

  // Then deploy TaskManager with TaskToken address
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy(taskToken.address, deployer.address);
  await taskManager.deployed();
  console.log("TaskManager deployed to:", taskManager.address);

  // Grant MINTER_ROLE to TaskManager
  const MINTER_ROLE = await taskToken.MINTER_ROLE();
  await taskToken.grantRole(MINTER_ROLE, taskManager.address);
  console.log("Granted MINTER_ROLE to TaskManager");

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
