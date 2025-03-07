// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TaskPlatform
 * @dev A platform for creating, assigning, and completing tasks with rewards
 */
contract TaskPlatform is Ownable {
    // Token used for rewards
    IERC20 public rewardToken;
    
    // Task status enum
    enum TaskStatus {
        Open,
        InProgress,
        Completed,
        Verified,
        Disputed,
        Cancelled
    }
    
    // Task structure
    struct Task {
        uint256 id;
        string title;
        string description;
        uint256 reward;
        address creator;
        address assignee;
        TaskStatus status;
        uint256 deadline;
        string category;
        string[] tags;
        uint256 createdAt;
        string metadataURI;
        string submissionURI;
    }
    
    // Task mapping and counter
    mapping(uint256 => Task) private tasks;
    uint256 private taskCount;
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward);
    event TaskAssigned(uint256 indexed taskId, address indexed assignee);
    event TaskCompleted(uint256 indexed taskId, address indexed assignee, string submissionURI);
    event TaskVerified(uint256 indexed taskId, address indexed verifier);
    event TaskDisputed(uint256 indexed taskId, address indexed disputer);
    event TaskCancelled(uint256 indexed taskId, address indexed canceller);
    
    /**
     * @dev Constructor sets the reward token
     * @param _rewardToken Address of the ERC20 token used for rewards
     */
    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Create a new task
     * @param _title Task title
     * @param _description Task description
     * @param _reward Reward amount in tokens
     * @param _deadline Deadline timestamp
     * @param _category Task category
     * @param _tags Array of tags
     * @return taskId The ID of the created task
     */
    function createTask(
        string memory _title,
        string memory _description,
        uint256 _reward,
        uint256 _deadline,
        string memory _category,
        string[] memory _tags
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_reward > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        // Transfer tokens from creator to contract
        rewardToken.transferFrom(msg.sender, address(this), _reward);
        
        // Create task
        uint256 taskId = taskCount++;
        tasks[taskId] = Task({
            id: taskId,
            title: _title,
            description: _description,
            reward: _reward,
            creator: msg.sender,
            assignee: address(0),
            status: TaskStatus.Open,
            deadline: _deadline,
            category: _category,
            tags: _tags,
            createdAt: block.timestamp,
            metadataURI: "",
            submissionURI: ""
        });
        
        emit TaskCreated(taskId, msg.sender, _reward);
        return taskId;
    }
    
    /**
     * @dev Assign a task to yourself
     * @param _taskId Task ID
     */
    function assignTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        require(task.status == TaskStatus.Open, "Task is not open");
        require(task.creator != msg.sender, "Creator cannot assign to self");
        require(block.timestamp < task.deadline, "Task deadline has passed");
        
        task.assignee = msg.sender;
        task.status = TaskStatus.InProgress;
        
        emit TaskAssigned(_taskId, msg.sender);
    }
    
    /**
     * @dev Complete a task by providing submission URI
     * @param _taskId Task ID
     * @param _submissionURI URI pointing to submission details
     */
    function completeTask(uint256 _taskId, string memory _submissionURI) external {
        Task storage task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        require(task.status == TaskStatus.InProgress, "Task is not in progress");
        require(task.assignee == msg.sender, "Only assignee can complete task");
        require(bytes(_submissionURI).length > 0, "Submission URI cannot be empty");
        
        task.status = TaskStatus.Completed;
        task.submissionURI = _submissionURI;
        
        emit TaskCompleted(_taskId, msg.sender, _submissionURI);
    }
    
    /**
     * @dev Verify a completed task and release payment
     * @param _taskId Task ID
     */
    function verifyTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        require(task.status == TaskStatus.Completed, "Task is not completed");
        require(task.creator == msg.sender, "Only creator can verify task");
        
        task.status = TaskStatus.Verified;
        
        // Transfer reward to assignee
        rewardToken.transfer(task.assignee, task.reward);
        
        emit TaskVerified(_taskId, msg.sender);
    }
    
    /**
     * @dev Dispute a completed task
     * @param _taskId Task ID
     */
    function disputeTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        require(task.status == TaskStatus.Completed, "Task is not completed");
        require(task.creator == msg.sender, "Only creator can dispute task");
        
        task.status = TaskStatus.Disputed;
        
        emit TaskDisputed(_taskId, msg.sender);
    }
    
    /**
     * @dev Cancel a task and refund reward
     * @param _taskId Task ID
     */
    function cancelTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        require(task.status == TaskStatus.Open || task.status == TaskStatus.Disputed, "Task cannot be cancelled");
        require(task.creator == msg.sender || owner() == msg.sender, "Only creator or owner can cancel task");
        
        task.status = TaskStatus.Cancelled;
        
        // Refund reward to creator
        rewardToken.transfer(task.creator, task.reward);
        
        emit TaskCancelled(_taskId, msg.sender);
    }
    
    /**
     * @dev Get task details
     * @param _taskId Task ID
     * @return Task details
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        Task memory task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        return task;
    }
    
    /**
     * @dev Get total number of tasks
     * @return Total number of tasks
     */
    function getTaskCount() external view returns (uint256) {
        return taskCount;
    }
    
    /**
     * @dev Get tasks by status
     * @param _status Task status
     * @param _offset Pagination offset
     * @param _limit Pagination limit
     * @return Array of tasks
     */
    function getTasksByStatus(TaskStatus _status, uint256 _offset, uint256 _limit) external view returns (Task[] memory) {
        // Count tasks with the given status
        uint256 count = 0;
        for (uint256 i = 0; i < taskCount; i++) {
            if (tasks[i].status == _status) {
                count++;
            }
        }
        
        // Apply pagination
        uint256 resultCount = _limit < count - _offset ? _limit : (count > _offset ? count - _offset : 0);
        Task[] memory result = new Task[](resultCount);
        
        // Fill result array
        if (resultCount > 0) {
            uint256 resultIndex = 0;
            for (uint256 i = 0; i < taskCount && resultIndex < resultCount; i++) {
                if (tasks[i].status == _status) {
                    if (_offset > 0) {
                        _offset--;
                    } else {
                        result[resultIndex++] = tasks[i];
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * @dev Set metadata URI for a task
     * @param _taskId Task ID
     * @param _metadataURI Metadata URI
     */
    function setTaskMetadataURI(uint256 _taskId, string memory _metadataURI) external {
        Task storage task = tasks[_taskId];
        require(task.creator != address(0), "Task does not exist");
        require(task.creator == msg.sender, "Only creator can set metadata URI");
        
        task.metadataURI = _metadataURI;
    }
    
    /**
     * @dev Update reward token address (only owner)
     * @param _newRewardToken New reward token address
     */
    function updateRewardToken(address _newRewardToken) external onlyOwner {
        rewardToken = IERC20(_newRewardToken);
    }
    
    /**
     * @dev Withdraw any tokens accidentally sent to the contract (only owner)
     * @param _token Token address
     * @param _amount Amount to withdraw
     */
    function withdrawToken(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
} 