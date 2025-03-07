
import { ethers } from 'ethers';

type ChainId = number;
type ContractName = 'TaskManager' | 'TaskToken' | 'TaskVerifier';

interface ContractConfig {
  address: Record<ChainId, string>;
  abi: any;
}

// Chain IDs
export const CHAIN_IDS = {
  LOCALHOST: 1337,
  SEPOLIA: 11155111,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
  MAINNET: 1,
} as const;

// Network names
export const NETWORK_NAMES: Record<ChainId, string> = {
  [CHAIN_IDS.LOCALHOST]: 'Local Development',
  [CHAIN_IDS.SEPOLIA]: 'Sepolia Testnet',
  [CHAIN_IDS.POLYGON]: 'Polygon Mainnet',
  [CHAIN_IDS.POLYGON_MUMBAI]: 'Polygon Mumbai',
  [CHAIN_IDS.MAINNET]: 'Ethereum Mainnet',
};

// Default chain ID (use env var if available, otherwise default to localhost)
export const DEFAULT_CHAIN_ID = 
  process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID 
    ? parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) 
    : CHAIN_IDS.LOCALHOST;

// Import contract ABIs
import TaskManagerABI from '../artifacts/contracts/TaskManager.sol/TaskManager.json';
import TaskTokenABI from '../artifacts/contracts/TaskToken.sol/TaskToken.json';
import TaskVerifierABI from '../artifacts/contracts/TaskVerifier.sol/TaskVerifier.json';

// Contract addresses for each network
export const CONTRACT_ADDRESSES: Record<ContractName, Record<ChainId, string>> = {
  TaskManager: {
    [CHAIN_IDS.LOCALHOST]: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    [CHAIN_IDS.SEPOLIA]: process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS_SEPOLIA || '',
    [CHAIN_IDS.POLYGON]: process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS_POLYGON || '',
    [CHAIN_IDS.POLYGON_MUMBAI]: process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS_MUMBAI || '',
    [CHAIN_IDS.MAINNET]: process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS_MAINNET || '',
  },
  TaskToken: {
    [CHAIN_IDS.LOCALHOST]: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    [CHAIN_IDS.SEPOLIA]: process.env.NEXT_PUBLIC_TASK_TOKEN_ADDRESS_SEPOLIA || '',
    [CHAIN_IDS.POLYGON]: process.env.NEXT_PUBLIC_TASK_TOKEN_ADDRESS_POLYGON || '',
    [CHAIN_IDS.POLYGON_MUMBAI]: process.env.NEXT_PUBLIC_TASK_TOKEN_ADDRESS_MUMBAI || '',
    [CHAIN_IDS.MAINNET]: process.env.NEXT_PUBLIC_TASK_TOKEN_ADDRESS_MAINNET || '',
  },
  TaskVerifier: {
    [CHAIN_IDS.LOCALHOST]: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    [CHAIN_IDS.SEPOLIA]: process.env.NEXT_PUBLIC_TASK_VERIFIER_ADDRESS_SEPOLIA || '',
    [CHAIN_IDS.POLYGON]: process.env.NEXT_PUBLIC_TASK_VERIFIER_ADDRESS_POLYGON || '',
    [CHAIN_IDS.POLYGON_MUMBAI]: process.env.NEXT_PUBLIC_TASK_VERIFIER_ADDRESS_MUMBAI || '',
    [CHAIN_IDS.MAINNET]: process.env.NEXT_PUBLIC_TASK_VERIFIER_ADDRESS_MAINNET || '',
  },
};

// Contract configs
export const CONTRACTS: Record<ContractName, ContractConfig> = {
  TaskManager: {
    address: CONTRACT_ADDRESSES.TaskManager,
    abi: TaskManagerABI.abi,
  },
  TaskToken: {
    address: CONTRACT_ADDRESSES.TaskToken,
    abi: TaskTokenABI.abi,
  },
  TaskVerifier: {
    address: CONTRACT_ADDRESSES.TaskVerifier,
    abi: TaskVerifierABI.abi,
  },
};

// Helper to get contract config for current chain
export function getContractForChain(
  name: ContractName,
  chainId: ChainId = DEFAULT_CHAIN_ID
): { address: string; abi: any } {
  return {
    address: CONTRACTS[name].address[chainId] || CONTRACTS[name].address[DEFAULT_CHAIN_ID],
    abi: CONTRACTS[name].abi,
  };
}
