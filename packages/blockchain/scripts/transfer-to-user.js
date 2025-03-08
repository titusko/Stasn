const hre = require("hardhat");

async function main() {
  const [_deployer] = await hre.ethers.getSigners();

  // Get the contract instance for MONNI tokens
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.attach("0x5fbdb2315678afecb367f032d93f642f64180aa3");

  // Amount to transfer (10000 MONNI tokens with 18 decimals)
  const amount = hre.ethers.parseEther("10000");
  const recipientAddress = "0x6e09019f14bb090eba1c5df9be621ddc65b4904c";

  // Transfer tokens
  console.log("Transferring MONNI tokens...");
  const tx = await token.transfer(recipientAddress, amount);
  await tx.wait();

  console.log(`Transferred ${hre.ethers.formatEther(amount)} MONNI tokens to ${recipientAddress}`);

  // Check balance
  const balance = await token.balanceOf(recipientAddress);
  console.log(`New balance: ${hre.ethers.formatEther(balance)} MONNI tokens`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
