# Monniverse Lagoon

A decentralized task platform for the Monniverse ecosystem.

## Features

- Connect with Web3 wallet (MetaMask)
- Create and manage quests
- Assign and complete quests
- Earn MONNI tokens for completing quests
- Real-time notifications via Gmail

## Project Structure

```
frontend/
  ├── src/
  │   ├── app/              # Next.js app router
  │   │   ├── layout/      # Layout components
  │   │   ├── tasks/       # Task-related components
  │   │   ├── wallet/      # Wallet connection components
  │   │   └── ui/          # Reusable UI components
  │   ├── contexts/        # React contexts
  │   ├── hooks/           # Custom React hooks
  │   ├── lib/             # Library code
  │   ├── services/        # External service integrations
  │   ├── types/           # TypeScript type definitions
  │   └── utils/           # Utility functions
  ├── public/             # Static assets
  └── package.json        # Project dependencies
```

## Getting Started

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contract Integration

1. Start the Hardhat node:
```bash
cd hardhat-project
npx hardhat node
```

2. Deploy the contract:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Update the contract address in your `.env.local` file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
