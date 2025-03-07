export const TaskPlatform = {
  abi: [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_reward",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "_tags",
          "type": "string[]"
        }
      ],
      "name": "createTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "assignTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "completeTask",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "payTask",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTaskCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_taskId",
          "type": "uint256"
        }
      ],
      "name": "getTask",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "reward",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "assignee",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "completed",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "paid",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "category",
              "type": "string"
            },
            {
              "internalType": "string[]",
              "name": "tags",
              "type": "string[]"
            },
            {
              "internalType": "uint256",
              "name": "rating",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "disputed",
              "type": "bool"
            }
          ],
          "internalType": "struct TaskPlatform.Task",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}; 