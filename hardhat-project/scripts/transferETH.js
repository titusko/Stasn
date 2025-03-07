const hre = require("hardhat");

async function main() {
  try {
    // Get the signers (accounts)
    const [sender, receiver] = await hre.ethers.getSigners();
    
    console.log("Sender address:", sender.address);
    console.log("Receiver address:", receiver.address);

    // Get initial balances
    const senderInitialBalance = await hre.ethers.provider.getBalance(sender.address);
    const receiverInitialBalance = await hre.ethers.provider.getBalance(receiver.address);
    
    console.log("\nInitial balances:");
    console.log("Sender balance:", hre.ethers.formatEther(senderInitialBalance), "ETH");
    console.log("Receiver balance:", hre.ethers.formatEther(receiverInitialBalance), "ETH");

    // Amount to transfer (0.1 ETH)
    const amount = hre.ethers.parseEther("0.1");
    
    // Send transaction
    console.log("\nSending 0.1 ETH...");
    const tx = await sender.sendTransaction({
      to: receiver.address,
      value: amount
    });
    
    // Wait for transaction to be mined
    await tx.wait();
    console.log("Transaction confirmed!");

    // Get final balances
    const senderFinalBalance = await hre.ethers.provider.getBalance(sender.address);
    const receiverFinalBalance = await hre.ethers.provider.getBalance(receiver.address);
    
    console.log("\nFinal balances:");
    console.log("Sender balance:", hre.ethers.formatEther(senderFinalBalance), "ETH");
    console.log("Receiver balance:", hre.ethers.formatEther(receiverFinalBalance), "ETH");

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