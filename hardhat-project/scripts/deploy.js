const hre = require("hardhat");

async function main() {
  try {
    console.log("Deploying TaskPlatform contract...");
    
    const TaskPlatform = await hre.ethers.getContractFactory("TaskPlatform");
    const taskPlatform = await TaskPlatform.deploy();
    
    await taskPlatform.waitForDeployment();
    
    const address = await taskPlatform.getAddress();
    console.log("TaskPlatform deployed to:", address);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 