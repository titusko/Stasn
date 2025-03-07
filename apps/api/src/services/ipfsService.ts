
import { IPFSService } from 'ipfs';
import { config } from '@/config';

// Create singleton instance
const ipfsService = new IPFSService(config.pinataJwt);

export { ipfsService };
