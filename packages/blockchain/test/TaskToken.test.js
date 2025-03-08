
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskToken", function () {
  let TaskToken;
  let taskToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    TaskToken = await ethers.getContractFactory("TaskToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    taskToken = await TaskToken.deploy();
    await taskToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await taskToken.hasRole(await taskToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await taskToken.balanceOf(owner.address);
      expect(await taskToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Role management", function () {
    it("Should allow admin to add a minter", async function () {
      await taskToken.addMinter(addr1.address);
      expect(await taskToken.hasRole(await taskToken.MINTER_ROLE(), addr1.address)).to.equal(true);
    });

    it("Should allow admin to remove a minter", async function () {
      await taskToken.addMinter(addr1.address);
      await taskToken.removeMinter(addr1.address);
      expect(await taskToken.hasRole(await taskToken.MINTER_ROLE(), addr1.address)).to.equal(false);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      await taskToken.addMinter(addr1.address);
      await taskToken.connect(addr1).mint(addr2.address, ethers.utils.parseEther("1000"));
      expect(await taskToken.balanceOf(addr2.address)).to.equal(ethers.utils.parseEther("1000"));
    });

    it("Should fail if non-minter tries to mint tokens", async function () {
      await expect(
        taskToken.connect(addr1).mint(addr2.address, ethers.utils.parseEther("1000"))
      ).to.be.reverted;
    });

    it("Should respect the max supply", async function () {
      const maxSupply = await taskToken.MAX_SUPPLY();
      const currentSupply = await taskToken.totalSupply();
      const mintAmount = maxSupply.sub(currentSupply).add(1); // Exceeds by 1
      
      await expect(
        taskToken.mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Exceeds maximum token supply");
    });
  });
});
