require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    artifacts: "../src/artifacts",
    sources: "./contracts"
  }
}; 