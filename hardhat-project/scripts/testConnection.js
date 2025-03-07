const hre = require("hardhat");

async function main() {
  try {
    // Get the network
    const network = await hre.ethers.provider.getNetwork();
    console.log("Connected to network:", network.name);

    // Get the signer
    const [signer] = await hre.ethers.getSigners();
    console.log("Connected wallet address:", signer.address);

    // Get the balance
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Wallet balance:", hre.ethers.formatEther(balance), "ETH");

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