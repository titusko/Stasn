
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TaskPlatform is Ownable, ReentrancyGuard {
    // Task statuses
    enum TaskStatus { Open, InProgress, Completed, Disputed, Canceled }
    
    // Task structure
    struct Task {
        uint256 id;
        string title;
        string description;
        address creator;
        address worker;
        uint256 reward;
        string category;
        string[] tags;
        string ipfsHash;
        TaskStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    // Counter for task IDs
    uint256 private _taskIdCounter;
    
    // Mapping of task ID to Task
    mapping(uint256 => Task) public tasks;
    
    // User's created tasks
    mapping(address => uint256[]) public createdTasks;
    
    // User's taken tasks
    mapping(address => uint256[]) public takenTasks;
    
    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 public platformFee = 500; // 5% default
    
    // Token used for transactions
    IERC20 public paymentToken;
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward);
    event TaskTaken(uint256 indexed taskId, address indexed worker);
    event TaskCompleted(uint256 indexed taskId, address indexed worker);
    event TaskCanceled(uint256 indexed taskId);
    event TaskDisputed(uint256 indexed taskId, address indexed disputer);
    event TaskResolved(uint256 indexed taskId, address indexed worker, bool workerRewarded);
    
    // Constructor
    constructor() Ownable(msg.sender) {
        _taskIdCounter = 1;
    }
    
    // Set payment token
    function setPaymentToken(address tokenAddress) external onlyOwner {
        paymentToken = IERC20(tokenAddress);
    }
    
    // Set platform fee
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot be more than 10%");
        platformFee = newFee;
    }
    
    // Create a new task
    function createTask(
        string memory title,
        string memory description,
        uint256 reward,
        string memory category,
        string[] memory tags,
        string memory ipfsHash
    ) external nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(reward > 0, "Reward must be greater than 0");
        
        // Transfer tokens from creator to contract
        require(paymentToken.transferFrom(msg.sender, address(this), reward), "Token transfer failed");
        
        // Create task
        uint256 taskId = _taskIdCounter++;
        tasks[taskId] = Task({
            id: taskId,
            title: title,
            description: description,
            creator: msg.sender,
            worker: address(0),
            reward: reward,
            category: category,
            tags: tags,
            ipfsHash: ipfsHash,
            status: TaskStatus.Open,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        // Add to creator's tasks
        createdTasks[msg.sender].push(taskId);
        
        emit TaskCreated(taskId, msg.sender, reward);
        
        return taskId;
    }
    
    // Take a task
    function takeTask(uint256 taskId) external nonReentrant {
        require(tasks[taskId].id != 0, "Task does not exist");
        require(tasks[taskId].status == TaskStatus.Open, "Task is not open");
        require(tasks[taskId].creator != msg.sender, "Cannot take own task");
        
        tasks[taskId].worker = msg.sender;
        tasks[taskId].status = TaskStatus.InProgress;
        
        // Add to worker's tasks
        takenTasks[msg.sender].push(taskId);
        
        emit TaskTaken(taskId, msg.sender);
    }
    
    // Submit task as completed
    function completeTask(uint256 taskId, string memory submissionIpfsHash) external nonReentrant {
        require(tasks[taskId].id != 0, "Task does not exist");
        require(tasks[taskId].status == TaskStatus.InProgress, "Task is not in progress");
        require(tasks[taskId].worker == msg.sender, "Not assigned to this task");
        
        // Update task metadata
        tasks[taskId].status = TaskStatus.Completed;
        tasks[taskId].ipfsHash = submissionIpfsHash;
        tasks[taskId].completedAt = block.timestamp;
        
        emit TaskCompleted(taskId, msg.sender);
    }
    
    // Approve task and release payment
    function approveTask(uint256 taskId) external nonReentrant {
        require(tasks[taskId].id != 0, "Task does not exist");
        require(tasks[taskId].status == TaskStatus.Completed, "Task is not completed");
        require(tasks[taskId].creator == msg.sender, "Not the task creator");
        
        Task storage task = tasks[taskId];
        address worker = task.worker;
        uint256 reward = task.reward;
        
        // Calculate platform fee
        uint256 fee = (reward * platformFee) / 10000;
        uint256 workerPayment = reward - fee;
        
        // Transfer tokens to worker
        require(paymentToken.transfer(worker, workerPayment), "Token transfer to worker failed");
        
        // Transfer fee to platform owner
        if (fee > 0) {
            require(paymentToken.transfer(owner(), fee), "Token transfer of fee failed");
        }
        
        emit TaskResolved(taskId, worker, true);
    }
    
    // Start a dispute for a task
    function disputeTask(uint256 taskId) external nonReentrant {
        require(tasks[taskId].id != 0, "Task does not exist");
        require(
            tasks[taskId].status == TaskStatus.InProgress || 
            tasks[taskId].status == TaskStatus.Completed,
            "Cannot dispute task in current status"
        );
        require(
            tasks[taskId].creator == msg.sender || 
            tasks[taskId].worker == msg.sender,
            "Must be task creator or worker"
        );
        
        tasks[taskId].status = TaskStatus.Disputed;
        
        emit TaskDisputed(taskId, msg.sender);
    }
    
    // Resolve a dispute (admin only)
    function resolveDispute(uint256 taskId, bool workerRewarded) external onlyOwner nonReentrant {
        require(tasks[taskId].id != 0, "Task does not exist");
        require(tasks[taskId].status == TaskStatus.Disputed, "Task is not disputed");
        
        Task storage task = tasks[taskId];
        address worker = task.worker;
        address creator = task.creator;
        uint256 reward = task.reward;
        
        if (workerRewarded) {
            // Calculate platform fee
            uint256 fee = (reward * platformFee) / 10000;
            uint256 workerPayment = reward - fee;
            
            // Transfer tokens to worker
            require(paymentToken.transfer(worker, workerPayment), "Token transfer to worker failed");
            
            // Transfer fee to platform owner
            if (fee > 0) {
                require(paymentToken.transfer(owner(), fee), "Token transfer of fee failed");
            }
        } else {
            // Return tokens to creator
            require(paymentToken.transfer(creator, reward), "Token transfer to creator failed");
        }
        
        // Mark task as completed
        task.status = TaskStatus.Completed;
        task.completedAt = block.timestamp;
        
        emit TaskResolved(taskId, worker, workerRewarded);
    }
    
    // Cancel a task (only by creator if task is open)
    function cancelTask(uint256 taskId) external nonReentrant {
        require(tasks[taskId].id != 0, "Task does not exist");
        require(tasks[taskId].status == TaskStatus.Open, "Can only cancel open tasks");
        require(tasks[taskId].creator == msg.sender, "Not the task creator");
        
        tasks[taskId].status = TaskStatus.Canceled;
        
        // Return tokens to creator
        require(paymentToken.transfer(msg.sender, tasks[taskId].reward), "Token transfer failed");
        
        emit TaskCanceled(taskId);
    }
    
    // Get a task by ID
    function getTask(uint256 taskId) external view returns (Task memory) {
        require(tasks[taskId].id != 0, "Task does not exist");
        return tasks[taskId];
    }
    
    // Get all created tasks by an address
    function getCreatedTasks(address user) external view returns (uint256[] memory) {
        return createdTasks[user];
    }
    
    // Get all taken tasks by an address
    function getTakenTasks(address user) external view returns (uint256[] memory) {
        return takenTasks[user];
    }
}
