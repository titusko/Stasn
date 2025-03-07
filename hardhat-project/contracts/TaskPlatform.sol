// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TaskPlatform {
    struct Task {
        uint256 id;
        string title;
        string description;
        uint256 reward;
        address creator;
        address assignee;
        bool completed;
        bool paid;
        uint256 createdAt;
        string category;
        string[] tags;
        uint256 rating;
        bool disputed;
    }

    struct UserStats {
        uint256 tasksCompleted;
        uint256 totalEarnings;
        uint256 tasksCreated;
        uint256 averageRating;
        uint256 totalRatings;
    }

    uint256 private taskCount;
    mapping(uint256 => Task) public tasks;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256[]) public userTasks;
    mapping(string => uint256[]) public categoryTasks;
    
    event TaskCreated(uint256 taskId, string title, uint256 reward);
    event TaskAssigned(uint256 taskId, address assignee);
    event TaskCompleted(uint256 taskId);
    event TaskPaid(uint256 taskId);
    event TaskRated(uint256 taskId, uint256 rating);
    event TaskDisputed(uint256 taskId);
    event DisputeResolved(uint256 taskId, bool creatorWon);

    function createTask(
        string memory _title,
        string memory _description,
        uint256 _reward,
        string memory _category,
        string[] memory _tags
    ) public {
        taskCount++;
        tasks[taskCount] = Task(
            taskCount,
            _title,
            _description,
            _reward,
            msg.sender,
            address(0),
            false,
            false,
            block.timestamp,
            _category,
            _tags,
            0,
            false
        );
        
        userStats[msg.sender].tasksCreated++;
        userTasks[msg.sender].push(taskCount);
        categoryTasks[_category].push(taskCount);
        
        emit TaskCreated(taskCount, _title, _reward);
    }

    function assignTask(uint256 _taskId) public {
        require(tasks[_taskId].assignee == address(0), "Task already assigned");
        require(tasks[_taskId].creator != msg.sender, "Creator cannot assign task to themselves");
        
        tasks[_taskId].assignee = msg.sender;
        userTasks[msg.sender].push(_taskId);
        
        emit TaskAssigned(_taskId, msg.sender);
    }

    function completeTask(uint256 _taskId) public {
        require(tasks[_taskId].assignee == msg.sender, "Only assignee can complete task");
        require(!tasks[_taskId].completed, "Task already completed");
        
        tasks[_taskId].completed = true;
        userStats[msg.sender].tasksCompleted++;
        
        emit TaskCompleted(_taskId);
    }

    function payTask(uint256 _taskId) public payable {
        require(tasks[_taskId].creator == msg.sender, "Only creator can pay");
        require(tasks[_taskId].completed, "Task not completed");
        require(!tasks[_taskId].paid, "Task already paid");
        require(msg.value >= tasks[_taskId].reward, "Insufficient payment");
        
        tasks[_taskId].paid = true;
        userStats[tasks[_taskId].assignee].totalEarnings += tasks[_taskId].reward;
        
        (bool success, ) = tasks[_taskId].assignee.call{value: tasks[_taskId].reward}("");
        require(success, "Transfer failed");
        
        emit TaskPaid(_taskId);
    }

    function rateTask(uint256 _taskId, uint256 _rating) public {
        require(tasks[_taskId].creator == msg.sender, "Only creator can rate");
        require(tasks[_taskId].completed, "Task not completed");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        
        tasks[_taskId].rating = _rating;
        UserStats storage stats = userStats[tasks[_taskId].assignee];
        stats.totalRatings++;
        stats.averageRating = ((stats.averageRating * (stats.totalRatings - 1)) + _rating) / stats.totalRatings;
        
        emit TaskRated(_taskId, _rating);
    }

    function disputeTask(uint256 _taskId) public {
        require(tasks[_taskId].completed, "Task not completed");
        require(!tasks[_taskId].disputed, "Task already disputed");
        require(
            msg.sender == tasks[_taskId].creator || msg.sender == tasks[_taskId].assignee,
            "Only creator or assignee can dispute"
        );
        
        tasks[_taskId].disputed = true;
        emit TaskDisputed(_taskId);
    }

    function resolveDispute(uint256 _taskId, bool _creatorWon) public {
        require(tasks[_taskId].disputed, "Task not disputed");
        require(!tasks[_taskId].paid, "Task already paid");
        
        if (_creatorWon) {
            userStats[tasks[_taskId].creator].totalEarnings += tasks[_taskId].reward;
            (bool success, ) = tasks[_taskId].creator.call{value: tasks[_taskId].reward}("");
            require(success, "Transfer failed");
        } else {
            userStats[tasks[_taskId].assignee].totalEarnings += tasks[_taskId].reward;
            (bool success, ) = tasks[_taskId].assignee.call{value: tasks[_taskId].reward}("");
            require(success, "Transfer failed");
        }
        
        tasks[_taskId].paid = true;
        tasks[_taskId].disputed = false;
        
        emit DisputeResolved(_taskId, _creatorWon);
    }

    function getUserStats(address _user) public view returns (UserStats memory) {
        return userStats[_user];
    }

    function getUserTasks(address _user) public view returns (uint256[] memory) {
        return userTasks[_user];
    }

    function getTask(uint256 _taskId) public view returns (Task memory) {
        return tasks[_taskId];
    }

    function getTasksByCategory(string memory _category) public view returns (uint256[] memory) {
        return categoryTasks[_category];
    }

    function getTaskCount() public view returns (uint256) {
        return taskCount;
    }
} 