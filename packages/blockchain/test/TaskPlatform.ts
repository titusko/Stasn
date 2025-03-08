import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { TaskPlatform, MockToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TaskPlatform", function () {
  let taskPlatform: TaskPlatform;
  let mockToken: MockToken;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let insurancePool: SignerWithAddress;
  let creator: SignerWithAddress;
  let assignee: SignerWithAddress;
  let otherUser: SignerWithAddress;

  const oneDay = 24 * 60 * 60;
  const oneEth = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, treasury, insurancePool, creator, assignee, otherUser] = await ethers.getSigners();

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy();
    await mockToken.waitForDeployment();

    // Deploy TaskPlatform
    const TaskPlatform = await ethers.getContractFactory("TaskPlatform");
    taskPlatform = await TaskPlatform.deploy(treasury.address, insurancePool.address);
    await taskPlatform.waitForDeployment();

    // Mint tokens to creator
    await mockToken.mint(creator.address, oneEth * BigInt(1000));
    await mockToken.connect(creator).approve(await taskPlatform.getAddress(), oneEth * BigInt(1000));
  });

  describe("Task Creation", function () {
    it("Should create a task with correct parameters", async function () {
      const deadline = await time.latest() + oneDay;
      const tx = await taskPlatform.connect(creator).createTask(
        "Test Task",
        "Test Description",
        oneEth,
        await mockToken.getAddress(),
        deadline,
        false
      );

      const receipt = await tx.wait();
      const taskId = receipt?.logs[0].args?.[0];
      expect(taskId).to.not.be.undefined;

      const task = await taskPlatform.getTask(taskId);
      expect(task.creator).to.equal(creator.address);
      expect(task.title).to.equal("Test Task");
      expect(task.description).to.equal("Test Description");
      expect(task.reward).to.equal(oneEth);
      expect(task.rewardToken).to.equal(await mockToken.getAddress());
      expect(task.deadline).to.equal(deadline);
      expect(task.hasInsurance).to.be.false;
      expect(task.status).to.equal(0); // Created
    });

    it("Should fail to create task with invalid parameters", async function () {
      const deadline = await time.latest() - oneDay; // Past deadline
      await expect(
        taskPlatform.connect(creator).createTask(
          "Test Task",
          "Test Description",
          oneEth,
          await mockToken.getAddress(),
          deadline,
          false
        )
      ).to.be.revertedWith("Deadline must be in the future");

      await expect(
        taskPlatform.connect(creator).createTask(
          "Test Task",
          "Test Description",
          0,
          await mockToken.getAddress(),
          await time.latest() + oneDay,
          false
        )
      ).to.be.revertedWith("Reward must be greater than 0");
    });
  });

  describe("Task Application", function () {
    let taskId: bigint;

    beforeEach(async function () {
      const deadline = await time.latest() + oneDay;
      const tx = await taskPlatform.connect(creator).createTask(
        "Test Task",
        "Test Description",
        oneEth,
        await mockToken.getAddress(),
        deadline,
        false
      );
      const receipt = await tx.wait();
      taskId = receipt?.logs[0].args?.[0];
    });

    it("Should allow users to apply for a task", async function () {
      await taskPlatform.connect(assignee).applyForTask(taskId, "Test Proposal");
      const applications = await taskPlatform.getApplications(taskId);
      expect(applications.length).to.equal(1);
      expect(applications[0].applicant).to.equal(assignee.address);
      expect(applications[0].proposal).to.equal("Test Proposal");
    });

    it("Should not allow creator to apply for their own task", async function () {
      await expect(
        taskPlatform.connect(creator).applyForTask(taskId, "Test Proposal")
      ).to.be.revertedWith("Creator cannot apply");
    });

    it("Should not allow multiple applications from the same user", async function () {
      await taskPlatform.connect(assignee).applyForTask(taskId, "Test Proposal");
      await expect(
        taskPlatform.connect(assignee).applyForTask(taskId, "Another Proposal")
      ).to.be.revertedWith("Already applied");
    });
  });

  describe("Task Assignment", function () {
    let taskId: bigint;

    beforeEach(async function () {
      const deadline = await time.latest() + oneDay;
      const tx = await taskPlatform.connect(creator).createTask(
        "Test Task",
        "Test Description",
        oneEth,
        await mockToken.getAddress(),
        deadline,
        false
      );
      const receipt = await tx.wait();
      taskId = receipt?.logs[0].args?.[0];
      await taskPlatform.connect(assignee).applyForTask(taskId, "Test Proposal");
    });

    it("Should allow creator to assign task to applicant", async function () {
      await taskPlatform.connect(creator).assignTask(taskId, assignee.address);
      const task = await taskPlatform.getTask(taskId);
      expect(task.assignee).to.equal(assignee.address);
      expect(task.status).to.equal(1); // InProgress
    });

    it("Should not allow non-creator to assign task", async function () {
      await expect(
        taskPlatform.connect(otherUser).assignTask(taskId, assignee.address)
      ).to.be.revertedWith("Only creator can assign");
    });

    it("Should not allow assigning to non-applicant", async function () {
      await expect(
        taskPlatform.connect(creator).assignTask(taskId, otherUser.address)
      ).to.be.revertedWith("Assignee has not applied");
    });
  });

  describe("Milestones", function () {
    let taskId: bigint;

    beforeEach(async function () {
      const deadline = await time.latest() + oneDay;
      const tx = await taskPlatform.connect(creator).createTask(
        "Test Task",
        "Test Description",
        oneEth,
        await mockToken.getAddress(),
        deadline,
        false
      );
      const receipt = await tx.wait();
      taskId = receipt?.logs[0].args?.[0];
      await taskPlatform.connect(assignee).applyForTask(taskId, "Test Proposal");
      await taskPlatform.connect(creator).assignTask(taskId, assignee.address);
    });

    it("Should allow creator to create milestones", async function () {
      const tx = await taskPlatform.connect(creator).createMilestone(
        taskId,
        "Milestone 1",
        "Milestone Description",
        oneEth / BigInt(2)
      );
      const receipt = await tx.wait();
      const milestoneId = receipt?.logs[0].args?.[1];

      const milestone = await taskPlatform.getMilestone(milestoneId);
      expect(milestone.title).to.equal("Milestone 1");
      expect(milestone.description).to.equal("Milestone Description");
      expect(milestone.reward).to.equal(oneEth / BigInt(2));
      expect(milestone.status).to.equal(0); // Pending
    });

    it("Should allow assignee to complete milestones", async function () {
      const tx = await taskPlatform.connect(creator).createMilestone(
        taskId,
        "Milestone 1",
        "Milestone Description",
        oneEth / BigInt(2)
      );
      const receipt = await tx.wait();
      const milestoneId = receipt?.logs[0].args?.[1];

      await taskPlatform.connect(assignee).completeMilestone(taskId, milestoneId);
      const milestone = await taskPlatform.getMilestone(milestoneId);
      expect(milestone.status).to.equal(1); // Completed
    });

    it("Should allow creator to reject completed milestones", async function () {
      const tx = await taskPlatform.connect(creator).createMilestone(
        taskId,
        "Milestone 1",
        "Milestone Description",
        oneEth / BigInt(2)
      );
      const receipt = await tx.wait();
      const milestoneId = receipt?.logs[0].args?.[1];

      await taskPlatform.connect(assignee).completeMilestone(taskId, milestoneId);
      await taskPlatform.connect(creator).rejectMilestone(taskId, milestoneId);
      const milestone = await taskPlatform.getMilestone(milestoneId);
      expect(milestone.status).to.equal(2); // Rejected
    });
  });

  describe("Task Completion", function () {
    let taskId: bigint;

    beforeEach(async function () {
      const deadline = await time.latest() + oneDay;
      const tx = await taskPlatform.connect(creator).createTask(
        "Test Task",
        "Test Description",
        oneEth,
        await mockToken.getAddress(),
        deadline,
        false
      );
      const receipt = await tx.wait();
      taskId = receipt?.logs[0].args?.[0];
      await taskPlatform.connect(assignee).applyForTask(taskId, "Test Proposal");
      await taskPlatform.connect(creator).assignTask(taskId, assignee.address);
    });

    it("Should allow creator to complete task", async function () {
      await taskPlatform.connect(creator).completeTask(taskId);
      const task = await taskPlatform.getTask(taskId);
      expect(task.status).to.equal(3); // Completed

      // Check reward distribution
      const assigneeBalance = await mockToken.balanceOf(assignee.address);
      expect(assigneeBalance).to.equal(oneEth);
    });

    it("Should allow assignee to complete task with all milestones completed", async function () {
      const tx = await taskPlatform.connect(creator).createMilestone(
        taskId,
        "Milestone 1",
        "Milestone Description",
        oneEth / BigInt(2)
      );
      const receipt = await tx.wait();
      const milestoneId = receipt?.logs[0].args?.[1];

      await taskPlatform.connect(assignee).completeMilestone(taskId, milestoneId);
      await taskPlatform.connect(assignee).completeTask(taskId);
      const task = await taskPlatform.getTask(taskId);
      expect(task.status).to.equal(3); // Completed
    });

    it("Should not allow assignee to complete task with incomplete milestones", async function () {
      await taskPlatform.connect(creator).createMilestone(
        taskId,
        "Milestone 1",
        "Milestone Description",
        oneEth / BigInt(2)
      );

      await expect(
        taskPlatform.connect(assignee).completeTask(taskId)
      ).to.be.revertedWith("Not all milestones are completed");
    });
  });

  describe("Disputes", function () {
    let taskId: bigint;

    beforeEach(async function () {
      const deadline = await time.latest() + oneDay;
      const tx = await taskPlatform.connect(creator).createTask(
        "Test Task",
        "Test Description",
        oneEth,
        await mockToken.getAddress(),
        deadline,
        true // With insurance
      );
      const receipt = await tx.wait();
      taskId = receipt?.logs[0].args?.[0];
      await taskPlatform.connect(assignee).applyForTask(taskId, "Test Proposal");
      await taskPlatform.connect(creator).assignTask(taskId, assignee.address);
    });

    it("Should allow creator or assignee to create dispute", async function () {
      const tx = await taskPlatform.connect(creator).createDispute(taskId, "Dispute reason");
      const receipt = await tx.wait();
      const disputeId = receipt?.logs[0].args?.[1];

      const dispute = await taskPlatform.getDispute(disputeId);
      expect(dispute.creator).to.equal(creator.address);
      expect(dispute.reason).to.equal("Dispute reason");
      expect(dispute.status).to.equal(0); // Open
    });

    it("Should allow owner to resolve dispute in favor of creator", async function () {
      const tx = await taskPlatform.connect(creator).createDispute(taskId, "Dispute reason");
      const receipt = await tx.wait();
      const disputeId = receipt?.logs[0].args?.[1];

      await taskPlatform.connect(owner).resolveDispute(taskId, disputeId, "Resolution", true);
      const dispute = await taskPlatform.getDispute(disputeId);
      expect(dispute.status).to.equal(1); // Resolved

      const task = await taskPlatform.getTask(taskId);
      expect(task.status).to.equal(4); // Cancelled
    });

    it("Should allow owner to resolve dispute in favor of assignee", async function () {
      const tx = await taskPlatform.connect(creator).createDispute(taskId, "Dispute reason");
      const receipt = await tx.wait();
      const disputeId = receipt?.logs[0].args?.[1];

      await taskPlatform.connect(owner).resolveDispute(taskId, disputeId, "Resolution", false);
      const dispute = await taskPlatform.getDispute(disputeId);
      expect(dispute.status).to.equal(1); // Resolved

      const task = await taskPlatform.getTask(taskId);
      expect(task.status).to.equal(3); // Completed
    });
  });
}); 