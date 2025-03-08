
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TaskToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public constant MAX_SUPPLY = 100000000 * 10 ** 18; // 100 million tokens
    uint256 private _totalMinted;

    constructor() ERC20("Task Token", "TASK") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        
        // Mint initial supply to deployer
        uint256 initialSupply = 10000000 * 10 ** 18; // 10 million tokens
        _mint(msg.sender, initialSupply);
        _totalMinted = initialSupply;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(_totalMinted + amount <= MAX_SUPPLY, "Exceeds maximum token supply");
        _mint(to, amount);
        _totalMinted += amount;
    }
    
    function addMinter(address minter) public onlyRole(ADMIN_ROLE) {
        grantRole(MINTER_ROLE, minter);
    }
    
    function removeMinter(address minter) public onlyRole(ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, minter);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}
