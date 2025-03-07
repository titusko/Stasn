const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaskPlatform", function () {
  let TaskPlatform;
  let taskPlatform;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TaskPlatform = await ethers.getContractFactory("TaskPlatform");
    taskPlatform = await TaskPlatform.deploy();
    await taskPlatform.waitForDeployment();
  });

  describe("Task Creation", function () {
    it("Should create a new task", async function () {
      const title = "Test Task";
      const description = "Test Description";
      const reward = ethers.parseEther("0.1");
      const category = "Development";
      const tags = ["web3", "solidity"];

      await taskPlatform.createTask(title, description, reward, category, tags);
      const task = await taskPlatform.getTask(1);

      expect(task.title).to.equal(title);
      expect(task.description).to.equal(description);
      expect(task.reward).to.equal(reward);
      expect(task.creator).to.equal(owner.address);
      expect(task.category).to.equal(category);
      expect(task.tags).to.deep.equal(tags);
    });
  });

  describe("Task Assignment", function () {
    beforeEach(async function () {
      await taskPlatform.createTask(
        "Test Task",
        "Test Description",
        ethers.parseEther("0.1"),
        "Development",
        ["web3"]
      );
    });

    it("Should assign task to another address", async function () {
      await taskPlatform.connect(addr1).assignTask(1);
      const task = await taskPlatform.getTask(1);
      expect(task.assignee).to.equal(addr1.address);
    });

    it("Should not allow creator to assign task to themselves", async function () {
      await expect(
        taskPlatform.connect(owner).assignTask(1)
      ).to.be.revertedWith("Creator cannot assign task to themselves");
    });
  });

  describe("Task Completion and Payment", function () {
    beforeEach(async function () {
      await taskPlatform.createTask(
        "Test Task",
        "Test Description",
        ethers.parseEther("0.1"),
        "Development",
        ["web3"]
      );
      await taskPlatform.connect(addr1).assignTask(1);
    });

    it("Should complete task", async function () {
      await taskPlatform.connect(addr1).completeTask(1);
      const task = await taskPlatform.getTask(1);
      expect(task.completed).to.be.true;
    });

    it("Should pay task", async function () {
      await taskPlatform.connect(addr1).completeTask(1);
      await taskPlatform.connect(owner).payTask(1, {
        value: ethers.parseEther("0.1"),
      });
      const task = await taskPlatform.getTask(1);
      expect(task.paid).to.be.true;
    });
  });

  describe("User Statistics", function () {
    beforeEach(async function () {
      await taskPlatform.createTask(
        "Test Task",
        "Test Description",
        ethers.parseEther("0.1"),
        "Development",
        ["web3"]
      );
      await taskPlatform.connect(addr1).assignTask(1);
      await taskPlatform.connect(addr1).completeTask(1);
      await taskPlatform.connect(owner).payTask(1, {
        value: ethers.parseEther("0.1"),
      });
    });

    it("Should update user statistics", async function () {
      const stats = await taskPlatform.getUserStats(addr1.address);
      expect(stats.tasksCompleted).to.equal(1);
      expect(stats.totalEarnings).to.equal(ethers.parseEther("0.1"));
    });
  });
}); 