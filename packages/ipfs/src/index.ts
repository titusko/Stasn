
import IPFSService, { IPFSUploadOptions, IPFSUploadResponse } from './ipfsService';

// Create a factory function to easily create instances with config
export const createIPFSService = (jwt: string, apiUrl?: string, gateway?: string) => {
  return new IPFSService(jwt, apiUrl, gateway);
};

export { IPFSService, IPFSUploadOptions, IPFSUploadResponse };
export default IPFSService;
