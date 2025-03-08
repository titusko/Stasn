const hre = require("hardhat");

async function main() {
  const [_deployer] = await hre.ethers.getSigners();

  // Get the contract instance for MONNI tokens
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

  // Amount to transfer (1000 MONNI tokens with 18 decimals)
  const amount = hre.ethers.parseEther("1000");
  const recipientAddress = "0x6e09019F14BB090Eba1c5df9BE621dDC65B4904C";

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
