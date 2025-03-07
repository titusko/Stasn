#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Hardhat deployment process...${NC}"

# Step 1: Install dependencies
echo -e "\n${GREEN}Step 1: Installing dependencies...${NC}"
npm install

# Step 2: Compile contracts
echo -e "\n${GREEN}Step 2: Compiling contracts...${NC}"
npm run compile

# Step 3: Start Hardhat node in the background
echo -e "\n${GREEN}Step 3: Starting Hardhat node...${NC}"
npm run node > hardhat.log 2>&1 &
HARDHAT_PID=$!

# Wait for node to start
echo "Waiting for Hardhat node to start..."
sleep 5

# Step 4: Deploy contracts
echo -e "\n${GREEN}Step 4: Deploying contracts...${NC}"
npm run deploy

# Step 5: Kill Hardhat node
kill $HARDHAT_PID

echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "${BLUE}Please check frontend/.env.local for the new contract address${NC}"
echo -e "${BLUE}To start the application:${NC}"
echo -e "1. Start Hardhat node: npm run node"
echo -e "2. In a new terminal, cd frontend && npm run dev" 