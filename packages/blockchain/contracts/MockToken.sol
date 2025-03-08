
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockToken is ERC20, Ownable {
    constructor() ERC20("Mock Token", "MTK") Ownable(msg.sender) {
        // Mint 1,000,000 tokens to the contract deployer
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    // Function to mint tokens (for testing purposes)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
