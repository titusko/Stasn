// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TaskPlatform is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Enums
    enum TaskStatus { Created, InProgress, UnderReview, Completed, Cancelled }

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
        string category;
        string[] tags;
        string ipfsHash;
    }

    // State variables
    Counters.Counter private _taskIds;

    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 public platformFee = 500; // 5% default

    // Token used for transactions
    IERC20 public paymentToken;

    // Mappings
    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public createdTasks;
    mapping(address => uint256[]) public assignedTasks;

    // Events
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward, string ipfsHash);
    event TaskAssigned(uint256 indexed taskId, address indexed worker);
    event TaskCompleted(uint256 indexed taskId, address indexed worker);
    event TaskCancelled(uint256 indexed taskId);
    event TaskDisputed(uint256 indexed taskId, address indexed disputer);
    event PlatformFeeChanged(uint256 oldFee, uint256 newFee);
    event PaymentTokenChanged(address oldToken, address newToken);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFee;
        platformFee = _fee;
        emit PlatformFeeChanged(oldFee, _fee);
    }

    function setPaymentToken(address _tokenAddress) external onlyOwner {
        address oldToken = address(paymentToken);
        paymentToken = IERC20(_tokenAddress);
        emit PaymentTokenChanged(oldToken, _tokenAddress);
    }

    function createTask(
        string memory _title,
        string memory _description,
        uint256 _reward,
        string memory _category,
        string[] memory _tags,
        string memory _ipfsHash
    ) external nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_reward > 0, "Reward must be greater than 0");

        // Transfer tokens from creator to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), _reward),
            "Token transfer failed"
        );

        // Increment task ID
        _taskIds.increment();
        uint256 newTaskId = _taskIds.current();

        // Create new task
        Task storage task = tasks[newTaskId];
        task.id = newTaskId;
        task.creator = msg.sender;
        task.title = _title;
        task.description = _description;
        task.reward = _reward;
        task.rewardToken = address(paymentToken);
        task.status = TaskStatus.Created;
        task.createdAt = block.timestamp;
        task.category = _category;
        task.tags = _tags;
        task.ipfsHash = _ipfsHash;

        // Add to creator's tasks
        createdTasks[msg.sender].push(newTaskId);

        emit TaskCreated(newTaskId, msg.sender, _reward, _ipfsHash);

        return newTaskId;
    }

    function assignTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];

        require(task.id > 0, "Task does not exist");
        require(task.status == TaskStatus.Created, "Task is not available");
        require(task.creator != msg.sender, "Creator cannot assign themselves");

        task.assignee = msg.sender;
        task.status = TaskStatus.InProgress;

        // Add to worker's assigned tasks
        assignedTasks[msg.sender].push(_taskId);

        emit TaskAssigned(_taskId, msg.sender);
    }

    function submitTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];

        require(task.id > 0, "Task does not exist");
        require(task.status == TaskStatus.InProgress, "Task is not in progress");
        require(task.assignee == msg.sender, "Only assignee can submit");

        task.status = TaskStatus.UnderReview;

        // Event could be added here for task submission
    }

    function completeTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];

        require(task.id > 0, "Task does not exist");
        require(task.status == TaskStatus.UnderReview, "Task is not under review");
        require(task.creator == msg.sender, "Only creator can complete task");

        task.status = TaskStatus.Completed;
        task.completedAt = block.timestamp;

        // Calculate fee and payment
        uint256 fee = (task.reward * platformFee) / 10000;
        uint256 payment = task.reward - fee;

        // Transfer payment to worker
        require(
            paymentToken.transfer(task.assignee, payment),
            "Worker payment failed"
        );

        // Transfer fee to platform owner
        if (fee > 0) {
            require(
                paymentToken.transfer(owner(), fee),
                "Fee payment failed"
            );
        }

        emit TaskCompleted(_taskId, task.assignee);
    }

    function cancelTask(uint256 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];

        require(task.id > 0, "Task does not exist");
        require(
            task.status == TaskStatus.Created || task.status == TaskStatus.InProgress,
            "Task cannot be cancelled in current state"
        );
        require(task.creator == msg.sender, "Only creator can cancel task");

        task.status = TaskStatus.Cancelled;

        // Return tokens to creator
        require(
            paymentToken.transfer(task.creator, task.reward),
            "Token return failed"
        );

        emit TaskCancelled(_taskId);
    }

    function getTask(uint256 _taskId) external view returns (Task memory) {
        require(tasks[_taskId].id > 0, "Task does not exist");
        return tasks[_taskId];
    }

    function getCreatorTasks(address _creator) external view returns (uint256[] memory) {
        return createdTasks[_creator];
    }

    function getAssigneeTasks(address _assignee) external view returns (uint256[] memory) {
        return assignedTasks[_assignee];
    }

    function getTaskCount() external view returns (uint256) {
        return _taskIds.current();
    }
}