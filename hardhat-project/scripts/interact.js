const hre = require("hardhat");

async function main() {
  try {
    // Get the deployed contract
    const TaskPlatform = await hre.ethers.getContractFactory("TaskPlatform");
    const taskPlatform = await TaskPlatform.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const [owner, addr1] = await hre.ethers.getSigners();

    console.log("Interacting with TaskPlatform at:", await taskPlatform.getAddress());
    console.log("Owner address:", owner.address);
    console.log("User address:", addr1.address);

    // Create a task
    console.log("\nCreating a new task...");
    const createTx = await taskPlatform.createTask(
      "Build a Web3 DApp",
      "Create a decentralized application using React and Solidity",
      hre.ethers.parseEther("0.5"),
      "Development",
      ["web3", "react", "solidity"]
    );
    await createTx.wait();
    console.log("Task created successfully!");

    // Get task details
    const task = await taskPlatform.getTask(1);
    console.log("\nTask details:");
    console.log("Title:", task.title);
    console.log("Description:", task.description);
    console.log("Reward:", hre.ethers.formatEther(task.reward), "ETH");
    console.log("Category:", task.category);
    console.log("Tags:", task.tags);

    // Assign task
    console.log("\nAssigning task...");
    const assignTx = await taskPlatform.connect(addr1).assignTask(1);
    await assignTx.wait();
    console.log("Task assigned successfully!");

    // Complete task
    console.log("\nCompleting task...");
    const completeTx = await taskPlatform.connect(addr1).completeTask(1);
    await completeTx.wait();
    console.log("Task completed successfully!");

    // Pay task
    console.log("\nPaying task...");
    const payTx = await taskPlatform.connect(owner).payTask(1, {
      value: hre.ethers.parseEther("0.5"),
    });
    await payTx.wait();
    console.log("Task paid successfully!");

    // Get user statistics
    const stats = await taskPlatform.getUserStats(addr1.address);
    console.log("\nUser statistics:");
    console.log("Tasks completed:", stats.tasksCompleted.toString());
    console.log("Total earnings:", hre.ethers.formatEther(stats.totalEarnings), "ETH");

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