// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TaskPlatform is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Enums
    enum TaskStatus { Created, InProgress, UnderReview, Completed, Cancelled }
    enum MilestoneStatus { Pending, Completed, Rejected }
    enum DisputeStatus { Open, Resolved, Closed }

    // Structs
    struct Task {
        uint256 id;
        address creator;
        address assignee;
        string title;
        string description;
        uint256 reward;
        address rewardToken;
        TaskStatus status;
        uint256 createdAt;
        uint256 completedAt;
        uint256 deadline;
        bool hasInsurance;
        uint256[] milestoneIds;
        uint256[] disputeIds;
    }

    struct Milestone {
        uint256 id;
        uint256 taskId;
        string title;
        string description;
        uint256 reward;
        MilestoneStatus status;
        uint256 completedAt;
    }

    struct Dispute {
        uint256 id;
        uint256 taskId;
        address creator;
        string reason;
        string resolution;
        DisputeStatus status;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    struct Application {
        address applicant;
        string proposal;
        uint256 appliedAt;
    }

    // State variables
    Counters.Counter private _taskIds;
    Counters.Counter private _milestoneIds;
    Counters.Counter private _disputeIds;

    mapping(uint256 => Task) public tasks;
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => Application[]) public applications;
    mapping(uint256 => mapping(address => bool)) public hasApplied;

    uint256 public platformFee = 50; // 0.5% (in basis points)
    uint256 public insuranceFee = 200; // 2% (in basis points)
    address public treasury;
    address public insurancePool;

    // Events
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward, address rewardToken);
    event TaskAssigned(uint256 indexed taskId, address indexed assignee);
    event TaskCompleted(uint256 indexed taskId);
    event TaskCancelled(uint256 indexed taskId);
    event MilestoneCreated(uint256 indexed taskId, uint256 indexed milestoneId, uint256 reward);
    event MilestoneCompleted(uint256 indexed taskId, uint256 indexed milestoneId);
    event MilestoneRejected(uint256 indexed taskId, uint256 indexed milestoneId);
    event ApplicationSubmitted(uint256 indexed taskId, address indexed applicant);
    event DisputeCreated(uint256 indexed taskId, uint256 indexed disputeId, address indexed creator);
    event DisputeResolved(uint256 indexed taskId, uint256 indexed disputeId, string resolution);

    // Constructor
    constructor(address _treasury, address _insurancePool) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        require(_insurancePool != address(0), "Invalid insurance pool address");
        treasury = _treasury;
        insurancePool = _insurancePool;
    }

    // Task management functions
    function createTask(
        string memory _title,
        string memory _description,
        uint256 _reward,
        address _rewardToken,
        uint256 _deadline,
        bool _hasInsurance
    ) external nonReentrant returns (uint256) {
        require(_reward > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_rewardToken != address(0), "Invalid reward token");

        uint256 totalAmount = _reward;
        uint256 platformAmount = (_reward * platformFee) / 10000;
        totalAmount += platformAmount;

        if (_hasInsurance) {
            uint256 insuranceAmount = (_reward * insuranceFee) / 10000;
            totalAmount += insuranceAmount;
        }

        IERC20(_rewardToken).transferFrom(msg.sender, address(this), totalAmount);

        _taskIds.increment();
        uint256 taskId = _taskIds.current();

        tasks[taskId] = Task({
            id: taskId,
            creator: msg.sender,
            assignee: address(0),
            title: _title,
            description: _description,
            reward: _reward,
            rewardToken: _rewardToken,
            status: TaskStatus.Created,
            createdAt: block.timestamp,
            completedAt: 0,
            deadline: _deadline,
            hasInsurance: _hasInsurance,
            milestoneIds: new uint256[](0),
            disputeIds: new uint256[](0)
        });

        emit TaskCreated(taskId, msg.sender, _reward, _rewardToken);
        return taskId;
    }

    function applyForTask(uint256 _taskId, string memory _proposal) external {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(task.status == TaskStatus.Created, "Task is not open");
        require(!hasApplied[_taskId][msg.sender], "Already applied");
        require(msg.sender != task.creator, "Creator cannot apply");

        applications[_taskId].push(Application({
            applicant: msg.sender,
            proposal: _proposal,
            appliedAt: block.timestamp
        }));
        hasApplied[_taskId][msg.sender] = true;

        emit ApplicationSubmitted(_taskId, msg.sender);
    }

    function assignTask(uint256 _taskId, address _assignee) external {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(msg.sender == task.creator, "Only creator can assign");
        require(task.status == TaskStatus.Created, "Task is not open");
        require(hasApplied[_taskId][_assignee], "Assignee has not applied");

        task.assignee = _assignee;
        task.status = TaskStatus.InProgress;

        emit TaskAssigned(_taskId, _assignee);
    }

    function createMilestone(
        uint256 _taskId,
        string memory _title,
        string memory _description,
        uint256 _reward
    ) external returns (uint256) {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(msg.sender == task.creator, "Only creator can create milestones");
        require(task.status != TaskStatus.Completed && task.status != TaskStatus.Cancelled, "Task is not active");
        require(_reward <= task.reward, "Milestone reward exceeds task reward");

        uint256 totalMilestoneReward = _reward;
        for (uint256 i = 0; i < task.milestoneIds.length; i++) {
            totalMilestoneReward += milestones[task.milestoneIds[i]].reward;
        }
        require(totalMilestoneReward <= task.reward, "Total milestone rewards exceed task reward");

        _milestoneIds.increment();
        uint256 milestoneId = _milestoneIds.current();

        milestones[milestoneId] = Milestone({
            id: milestoneId,
            taskId: _taskId,
            title: _title,
            description: _description,
            reward: _reward,
            status: MilestoneStatus.Pending,
            completedAt: 0
        });

        task.milestoneIds.push(milestoneId);

        emit MilestoneCreated(_taskId, milestoneId, _reward);
        return milestoneId;
    }

    function completeMilestone(uint256 _taskId, uint256 _milestoneId) external {
        Task storage task = tasks[_taskId];
        Milestone storage milestone = milestones[_milestoneId];
        require(task.id != 0, "Task does not exist");
        require(milestone.id != 0, "Milestone does not exist");
        require(milestone.taskId == _taskId, "Milestone does not belong to task");
        require(msg.sender == task.assignee, "Only assignee can complete milestone");
        require(milestone.status == MilestoneStatus.Pending, "Milestone is not pending");

        milestone.status = MilestoneStatus.Completed;
        milestone.completedAt = block.timestamp;

        emit MilestoneCompleted(_taskId, _milestoneId);

        // Check if all milestones are completed
        bool allCompleted = true;
        for (uint256 i = 0; i < task.milestoneIds.length; i++) {
            if (milestones[task.milestoneIds[i]].status != MilestoneStatus.Completed) {
                allCompleted = false;
                break;
            }
        }

        // If all milestones are completed, complete the task
        if (allCompleted) {
            completeTask(_taskId);
        }
    }

    function rejectMilestone(uint256 _taskId, uint256 _milestoneId) external {
        Task storage task = tasks[_taskId];
        Milestone storage milestone = milestones[_milestoneId];
        require(task.id != 0, "Task does not exist");
        require(milestone.id != 0, "Milestone does not exist");
        require(milestone.taskId == _taskId, "Milestone does not belong to task");
        require(msg.sender == task.creator, "Only creator can reject milestone");
        require(milestone.status == MilestoneStatus.Completed, "Milestone is not completed");

        milestone.status = MilestoneStatus.Rejected;

        emit MilestoneRejected(_taskId, _milestoneId);
    }

    function completeTask(uint256 _taskId) public {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(task.status == TaskStatus.InProgress, "Task is not in progress");
        require(msg.sender == task.creator || msg.sender == task.assignee, "Not authorized");

        if (msg.sender == task.assignee) {
            require(block.timestamp <= task.deadline, "Task deadline passed");
            // If assignee is completing, all milestones must be completed
            for (uint256 i = 0; i < task.milestoneIds.length; i++) {
                require(
                    milestones[task.milestoneIds[i]].status == MilestoneStatus.Completed,
                    "Not all milestones are completed"
                );
            }
        }

        task.status = TaskStatus.Completed;
        task.completedAt = block.timestamp;

        // Calculate and distribute rewards
        uint256 platformAmount = (task.reward * platformFee) / 10000;
        uint256 insuranceAmount = task.hasInsurance ? (task.reward * insuranceFee) / 10000 : 0;

        // Transfer platform fee
        IERC20(task.rewardToken).transfer(treasury, platformAmount);

        // Transfer insurance fee if applicable
        if (task.hasInsurance) {
            IERC20(task.rewardToken).transfer(insurancePool, insuranceAmount);
        }

        // Transfer reward to assignee
        IERC20(task.rewardToken).transfer(task.assignee, task.reward);

        emit TaskCompleted(_taskId);
    }

    function cancelTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(
            task.status == TaskStatus.Created || task.status == TaskStatus.InProgress,
            "Task cannot be cancelled"
        );
        require(msg.sender == task.creator, "Only creator can cancel");

        task.status = TaskStatus.Cancelled;

        // Refund the reward to the creator
        uint256 platformAmount = (task.reward * platformFee) / 10000;
        uint256 insuranceAmount = task.hasInsurance ? (task.reward * insuranceFee) / 10000 : 0;
        uint256 refundAmount = task.reward + platformAmount + insuranceAmount;

        IERC20(task.rewardToken).transfer(task.creator, refundAmount);

        emit TaskCancelled(_taskId);
    }

    function createDispute(uint256 _taskId, string memory _reason) external returns (uint256) {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(
            msg.sender == task.creator || msg.sender == task.assignee,
            "Only creator or assignee can create dispute"
        );
        require(
            task.status != TaskStatus.Completed && task.status != TaskStatus.Cancelled,
            "Task is not active"
        );

        _disputeIds.increment();
        uint256 disputeId = _disputeIds.current();

        disputes[disputeId] = Dispute({
            id: disputeId,
            taskId: _taskId,
            creator: msg.sender,
            reason: _reason,
            resolution: "",
            status: DisputeStatus.Open,
            createdAt: block.timestamp,
            resolvedAt: 0
        });

        task.disputeIds.push(disputeId);

        emit DisputeCreated(_taskId, disputeId, msg.sender);
        return disputeId;
    }

    function resolveDispute(
        uint256 _taskId,
        uint256 _disputeId,
        string memory _resolution,
        bool _refundCreator
    ) external onlyOwner {
        Task storage task = tasks[_taskId];
        Dispute storage dispute = disputes[_disputeId];
        require(task.id != 0, "Task does not exist");
        require(dispute.id != 0, "Dispute does not exist");
        require(dispute.taskId == _taskId, "Dispute does not belong to task");
        require(dispute.status == DisputeStatus.Open, "Dispute is not open");

        dispute.resolution = _resolution;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;

        if (_refundCreator) {
            // Refund the creator
            uint256 platformAmount = (task.reward * platformFee) / 10000;
            uint256 insuranceAmount = task.hasInsurance ? (task.reward * insuranceFee) / 10000 : 0;
            uint256 refundAmount = task.reward + platformAmount + insuranceAmount;

            IERC20(task.rewardToken).transfer(task.creator, refundAmount);
            task.status = TaskStatus.Cancelled;
        } else {
            // Complete the task and pay the assignee
            task.status = TaskStatus.Completed;
            task.completedAt = block.timestamp;

            uint256 platformAmount = (task.reward * platformFee) / 10000;
            uint256 insuranceAmount = task.hasInsurance ? (task.reward * insuranceFee) / 10000 : 0;

            IERC20(task.rewardToken).transfer(treasury, platformAmount);
            if (task.hasInsurance) {
                IERC20(task.rewardToken).transfer(insurancePool, insuranceAmount);
            }
            IERC20(task.rewardToken).transfer(task.assignee, task.reward);
        }

        emit DisputeResolved(_taskId, _disputeId, _resolution);
    }

    // View functions
    function getTask(uint256 _taskId) external view returns (Task memory) {
        require(tasks[_taskId].id != 0, "Task does not exist");
        return tasks[_taskId];
    }

    function getMilestone(uint256 _milestoneId) external view returns (Milestone memory) {
        require(milestones[_milestoneId].id != 0, "Milestone does not exist");
        return milestones[_milestoneId];
    }

    function getDispute(uint256 _disputeId) external view returns (Dispute memory) {
        require(disputes[_disputeId].id != 0, "Dispute does not exist");
        return disputes[_disputeId];
    }

    function getApplications(uint256 _taskId) external view returns (Application[] memory) {
        return applications[_taskId];
    }

    // Admin functions
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    function setInsuranceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        insuranceFee = _fee;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    function setInsurancePool(address _insurancePool) external onlyOwner {
        require(_insurancePool != address(0), "Invalid insurance pool address");
        insurancePool = _insurancePool;
    }
}