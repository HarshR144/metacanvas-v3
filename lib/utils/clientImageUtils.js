
// Extract IPFS hash from the full URL
export const extractIPFSHash = (ipfsUrl) => {
    // Handle different IPFS URL formats
    if (ipfsUrl.includes('ipfs/')) {
      return ipfsUrl.split('ipfs/')[1];
    } else if (ipfsUrl.startsWith('ipfs://')) {
      return ipfsUrl.replace('ipfs://', '');
    }
    return ipfsUrl;
  };