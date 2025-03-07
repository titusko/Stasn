#!/bin/bash

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists node; then
  echo "Node.js is not installed. Please install Node.js first."
  exit 1
fi

if ! command_exists npm; then
  echo "npm is not installed. Please install npm first."
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Monniverse Lagoon Platform...${NC}"

# Step 1: Install dependencies
echo -e "\n${GREEN}Step 1: Installing dependencies...${NC}"
cd frontend && npm install

# Step 2: Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
  echo -e "\n${GREEN}Step 2: Creating environment file...${NC}"
  cp .env.example .env.local
  echo "Created .env.local file. Please update the contract address if needed."
fi

# Step 3: Start the development server
echo -e "\n${GREEN}Step 3: Starting development server...${NC}"
echo -e "${BLUE}The application will be available at http://localhost:3000${NC}"
echo -e "${BLUE}Please ensure your Hardhat node is running and the contract is deployed${NC}"
echo -e "${BLUE}To start Hardhat node: Open a new terminal and run 'npx hardhat node'${NC}"
echo -e "${BLUE}To deploy contract: Open a new terminal and run 'npx hardhat run scripts/deploy.js --network localhost'${NC}"

npm run dev 