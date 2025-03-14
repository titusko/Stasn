
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TaskManager is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    IERC20 public taskToken;
    Counters.Counter private _taskIdCounter;
    
    struct Task {
        uint256 id;
        string title;
        string description;
        string ipfsHash; // For storing additional data
        uint256 reward;
        address creator;
        address assignee;
        TaskStatus status;
        uint256 createdAt;
        uint256 deadline;
        uint256 completedAt;
        string proofHash; // IPFS hash of completion proof
    }
    
    enum TaskStatus {
        OPEN,
        ASSIGNED,
        SUBMITTED,
        COMPLETED,
        CANCELLED,
        DISPUTED
    }
    
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userCreatedTasks;
    mapping(address => uint256[]) public userAssignedTasks;
    
    // For Layer 3 solutions and scaling
    uint256 public disputeTimeWindow = 3 days;
    address public verifierContract;
    
    // Platform fee: 2%
    uint256 public platformFeePercentage = 200; // 200 = 2.00%
    address public feeCollector;
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward);
    event TaskAssigned(uint256 indexed taskId, address indexed assignee);
    event TaskSubmitted(uint256 indexed taskId, address indexed assignee, string proofHash);
    event TaskCompleted(uint256 indexed taskId, address indexed assignee, uint256 reward);
    event TaskCancelled(uint256 indexed taskId, address indexed creator);
    event TaskDisputed(uint256 indexed taskId, address indexed disputer, string reason);
    event PlatformFeeUpdated(uint256 newFeePercentage);
    
    modifier onlyTaskCreator(uint256 taskId) {
        require(tasks[taskId].creator == msg.sender, "Only task creator can call this function");
        _;
    }
    
    modifier onlyTaskAssignee(uint256 taskId) {
        require(tasks[taskId].assignee == msg.sender, "Only task assignee can call this function");
        _;
    }
    
    modifier taskExists(uint256 taskId) {
        require(taskId <= _taskIdCounter.current() && taskId > 0, "Task does not exist");
        _;
    }
    
    constructor(address _taskTokenAddress, address _feeCollector) {
        taskToken = IERC20(_taskTokenAddress);
        feeCollector = _feeCollector;
    }
    
    function createTask(
        string memory title,
        string memory description,
        string memory ipfsHash,
        uint256 reward,
        uint256 deadline
    ) external nonReentrant returns (uint256) {
        require(reward > 0, "Reward must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        
        // Transfer tokens to contract
        require(taskToken.transferFrom(msg.sender, address(this), reward), "Token transfer failed");
        
        _taskIdCounter.increment();
        uint256 taskId = _taskIdCounter.current();
        
        Task memory newTask = Task({
            id: taskId,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            reward: reward,
            creator: msg.sender,
            assignee: address(0),
            status: TaskStatus.OPEN,
            createdAt: block.timestamp,
            deadline: deadline,
            completedAt: 0,
            proofHash: ""
        });
        
        tasks[taskId] = newTask;
        userCreatedTasks[msg.sender].push(taskId);
        
        emit TaskCreated(taskId, msg.sender, reward);
        
        return taskId;
    }
    
    function assignTask(uint256 taskId) external taskExists(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        
        require(task.status == TaskStatus.OPEN, "Task is not open for assignment");
        require(task.creator != msg.sender, "Creator cannot assign to self");
        require(block.timestamp < task.deadline, "Task deadline has passed");
        
        task.assignee = msg.sender;
        task.status = TaskStatus.ASSIGNED;
        
        userAssignedTasks[msg.sender].push(taskId);
        
        emit TaskAssigned(taskId, msg.sender);
    }
    
    function submitTask(uint256 taskId, string memory proofHash) external taskExists(taskId) onlyTaskAssignee(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        
        require(task.status == TaskStatus.ASSIGNED, "Task is not in assigned state");
        require(block.timestamp <= task.deadline, "Task deadline has passed");
        
        task.status = TaskStatus.SUBMITTED;
        task.proofHash = proofHash;
        
        emit TaskSubmitted(taskId, msg.sender, proofHash);
    }
    
    function approveTask(uint256 taskId) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        
        require(task.status == TaskStatus.SUBMITTED, "Task is not submitted");
        
        task.status = TaskStatus.COMPLETED;
        task.completedAt = block.timestamp;
        
        // Calculate platform fee
        uint256 platformFee = (task.reward * platformFeePercentage) / 10000;
        uint256 finalReward = task.reward - platformFee;
        
        // Transfer rewards
        require(taskToken.transfer(task.assignee, finalReward), "Reward transfer failed");
        
        // Transfer platform fee
        if (platformFee > 0) {
            require(taskToken.transfer(feeCollector, platformFee), "Fee transfer failed");
        }
        
        emit TaskCompleted(taskId, task.assignee, finalReward);
    }
    
    function cancelTask(uint256 taskId) external taskExists(taskId) onlyTaskCreator(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        
        require(
            task.status == TaskStatus.OPEN || 
            (task.status == TaskStatus.ASSIGNED && block.timestamp > task.deadline),
            "Cannot cancel task in current state"
        );
        
        task.status = TaskStatus.CANCELLED;
        
        // Return reward to creator
        require(taskToken.transfer(task.creator, task.reward), "Token return failed");
        
        emit TaskCancelled(taskId, msg.sender);
    }
    
    function disputeTask(uint256 taskId, string memory reason) external taskExists(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        
        require(
            msg.sender == task.creator || msg.sender == task.assignee,
            "Only creator or assignee can dispute"
        );
        
        require(
            task.status == TaskStatus.ASSIGNED || task.status == TaskStatus.SUBMITTED,
            "Cannot dispute task in current state"
        );
        
        task.status = TaskStatus.DISPUTED;
        
        emit TaskDisputed(taskId, msg.sender, reason);
    }
    
    function resolveDispute(uint256 taskId, address payoutAddress) external onlyOwner taskExists(taskId) nonReentrant {
        Task storage task = tasks[taskId];
        
        require(task.status == TaskStatus.DISPUTED, "Task is not disputed");
        require(
            payoutAddress == task.creator || payoutAddress == task.assignee,
            "Payout must go to creator or assignee"
        );
        
        // Transfer reward based on resolution
        require(taskToken.transfer(payoutAddress, task.reward), "Reward transfer failed");
        
        if (payoutAddress == task.assignee) {
            task.status = TaskStatus.COMPLETED;
            task.completedAt = block.timestamp;
            emit TaskCompleted(taskId, task.assignee, task.reward);
        } else {
            task.status = TaskStatus.CANCELLED;
            emit TaskCancelled(taskId, task.creator);
        }
    }
    
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 500, "Fee cannot exceed 5%");
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }
    
    function setVerifierContract(address _verifierContract) external onlyOwner {
        verifierContract = _verifierContract;
    }
    
    function setDisputeTimeWindow(uint256 _disputeTimeWindow) external onlyOwner {
        disputeTimeWindow = _disputeTimeWindow;
    }
    
    function setFeeCollector(address _feeCollector) external onlyOwner {
        feeCollector = _feeCollector;
    }
    
    // View functions
    function getTaskCount() external view returns (uint256) {
        return _taskIdCounter.current();
    }
    
    function getTasksByCreator(address creator) external view returns (uint256[] memory) {
        return userCreatedTasks[creator];
    }
    
    function getTasksByAssignee(address assignee) external view returns (uint256[] memory) {
        return userAssignedTasks[assignee];
    }
}
