
# Project Monorepo

This monorepo contains all the code for our blockchain-based application.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Express, Node.js
- **Blockchain**: Hardhat, Ethers.js, Solidity
- **Storage**: IPFS via Pinata
- **Tooling**: Turborepo, PNPM, TypeScript, ESLint, Prettier

## Prerequisites

- Node.js (v18 or higher)
- PNPM (v8.15.4 or higher)
- Git

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/project-monorepo.git
cd project-monorepo

# Install dependencies
pnpm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `NEXT_PUBLIC_API_URL`: URL for the backend API
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Deployed contract address
- `PINATA_JWT`: JWT for Pinata IPFS API
- `PRIVATE_KEY`: Private key for contract deployment (only for deployment)

### Development

```bash
# Start development servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all packages
- `pnpm lint`: Run ESLint on all packages
- `pnpm test`: Run tests for all packages
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm clean`: Clean build artifacts
- `pnpm create:component`: Create a new component
- `pnpm create:package`: Create a new package
- `pnpm generate:sdk`: Generate contract SDK from artifacts

## Project Structure

```
/
├── apps/
│   ├── web/                  # Next.js frontend application
│   └── api/                  # Backend API service
├── packages/
│   ├── blockchain/           # Smart contract development & interactions
│   ├── ui/                   # Shared UI components
│   ├── config/               # Shared configurations
│   ├── tsconfig/             # Shared TypeScript configurations
│   ├── eslint-config/        # Shared ESLint configurations
│   ├── ipfs/                 # IPFS integration utilities
│   └── contracts-sdk/        # Auto-generated contract SDK
├── tooling/
│   ├── generators/           # Code generators
│   ├── scripts/              # Utility scripts
│   └── ci/                   # CI/CD configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
