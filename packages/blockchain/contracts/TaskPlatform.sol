// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TaskPlatform is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;

    uint256 private taskIdCounter;
    uint256 public platformFee = 5; // 5% platform fee

    enum TaskStatus { Open, Assigned, Completed, Paid, Disputed, Canceled }

    struct Task {
        uint256 id;
        string title;
        string description;
        uint256 reward;
        string category;
        string[] tags;
        address creator;
        address assignee;
        TaskStatus status;
        string ipfsHash;
        uint256 createdAt;
    }

    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userCreatedTasks;
    mapping(address => uint256[]) public userAssignedTasks;

    event TaskCreated(uint256 taskId, address creator, string title, uint256 reward);
    event TaskAssigned(uint256 taskId, address assignee);
    event TaskCompleted(uint256 taskId, string ipfsHash);
    event TaskPaid(uint256 taskId, address assignee, uint256 amount);
    event TaskDisputed(uint256 taskId, address disputer);
    event TaskCanceled(uint256 taskId);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
        taskIdCounter = 1;
    }

    function setPaymentToken(address _paymentToken) external onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 20, "Fee cannot exceed 20%");
        platformFee = _fee;
    }

    function createTask(
        string memory _title,
        string memory _description,
        uint256 _reward,
        string memory _category,
        string[] memory _tags
    ) external nonReentrant returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_reward > 0, "Reward must be greater than 0");

        // Transfer tokens from creator to contract (escrow)
        require(
            paymentToken.transferFrom(msg.sender, address(this), _reward),
            "Token transfer failed"
        );

        uint256 taskId = taskIdCounter++;

        tasks[taskId] = Task({
            id: taskId,
            title: _title,
            description: _description,
            reward: _reward,
            category: _category,
            tags: _tags,
            creator: msg.sender,
            assignee: address(0),
            status: TaskStatus.Open,
            ipfsHash: "",
            createdAt: block.timestamp
        });

        userCreatedTasks[msg.sender].push(taskId);

        emit TaskCreated(taskId, msg.sender, _title, _reward);

        return taskId;
    }

    function getTask(uint256 _taskId) external view returns (Task memory) {
        require(_taskId > 0 && _taskId < taskIdCounter, "Invalid task ID");
        return tasks[_taskId];
    }

    function assignTask(uint256 _taskId) external nonReentrant {
        require(_taskId > 0 && _taskId < taskIdCounter, "Invalid task ID");
        Task storage task = tasks[_taskId];

        require(task.status == TaskStatus.Open, "Task is not open");
        require(task.creator != msg.sender, "Creator cannot assign to self");

        task.assignee = msg.sender;
        task.status = TaskStatus.Assigned;

        userAssignedTasks[msg.sender].push(_taskId);

        emit TaskAssigned(_taskId, msg.sender);
    }

    function completeTask(uint256 _taskId, string memory _ipfsHash) external nonReentrant {
        require(_taskId > 0 && _taskId < taskIdCounter, "Invalid task ID");
        Task storage task = tasks[_taskId];

        require(task.status == TaskStatus.Assigned, "Task is not assigned");
        require(task.assignee == msg.sender, "Not the assignee");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        task.ipfsHash = _ipfsHash;
        task.status = TaskStatus.Completed;

        emit TaskCompleted(_taskId, _ipfsHash);
    }

    function payTask(uint256 _taskId) external nonReentrant {
        require(_taskId > 0 && _taskId < taskIdCounter, "Invalid task ID");
        Task storage task = tasks[_taskId];

        require(task.status == TaskStatus.Completed, "Task is not completed");
        require(task.creator == msg.sender, "Not the creator");

        uint256 platformAmount = (task.reward * platformFee) / 100;
        uint256 assigneeAmount = task.reward - platformAmount;

        task.status = TaskStatus.Paid;

        // Transfer reward to assignee
        require(
            paymentToken.transfer(task.assignee, assigneeAmount),
            "Payment to assignee failed"
        );

        // Transfer fee to platform owner
        if (platformAmount > 0) {
            require(
                paymentToken.transfer(owner(), platformAmount),
                "Payment to platform failed"
            );
        }

        emit TaskPaid(_taskId, task.assignee, assigneeAmount);
    }

    function disputeTask(uint256 _taskId) external nonReentrant {
        require(_taskId > 0 && _taskId < taskIdCounter, "Invalid task ID");
        Task storage task = tasks[_taskId];

        require(
            task.status == TaskStatus.Assigned || task.status == TaskStatus.Completed,
            "Task cannot be disputed in current state"
        );
        require(
            task.creator == msg.sender || task.assignee == msg.sender,
            "Not involved in this task"
        );

        task.status = TaskStatus.Disputed;

        emit TaskDisputed(_taskId, msg.sender);
    }

    function cancelTask(uint256 _taskId) external nonReentrant {
        require(_taskId > 0 && _taskId < taskIdCounter, "Invalid task ID");
        Task storage task = tasks[_taskId];

        require(task.status == TaskStatus.Open, "Task cannot be canceled in current state");
        require(task.creator == msg.sender, "Not the creator");

        task.status = TaskStatus.Canceled;

        // Return funds to creator
        require(
            paymentToken.transfer(task.creator, task.reward),
            "Refund transfer failed"
        );

        emit TaskCanceled(_taskId);
    }

    function getUserCreatedTasks(address _user) external view returns (uint256[] memory) {
        return userCreatedTasks[_user];
    }

    function getUserAssignedTasks(address _user) external view returns (uint256[] memory) {
        return userAssignedTasks[_user];
    }
}