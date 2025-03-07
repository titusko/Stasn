
export const TASK_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_TASK_MANAGER_ADDRESS || '';
export const TASK_MANAGER_ABI = [
  // Define your ABI here or import from generated files
  "function submitProof(uint256 taskId, string memory proofHash) external",
  "function disputeTask(uint256 taskId, string memory disputeReason) external",
  "event ProofSubmitted(uint256 indexed taskId, address indexed prover, string proofHash)",
  "event TaskDisputed(uint256 indexed taskId, address indexed disputer, string disputeReason)"
];
