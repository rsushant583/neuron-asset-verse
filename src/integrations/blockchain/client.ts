import { ethers } from 'ethers';
import MetaMindNFT from '../../backend/src/contracts/MetaMindNFT';

// Initialize provider based on environment
const getProvider = () => {
  const network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'polygon-mumbai';
  
  if (network === 'polygon-mainnet') {
    return new ethers.JsonRpcProvider(import.meta.env.VITE_POLYGON_RPC_URL);
  } else if (network === 'polygon-mumbai') {
    return new ethers.JsonRpcProvider(import.meta.env.VITE_POLYGON_MUMBAI_RPC_URL);
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }
};

// Connect to wallet
export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return { accounts, signer };
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  } else {
    throw new Error('No Ethereum wallet detected');
  }
};

// Verify NFT ownership
export const verifyOwnership = async (tokenId: string, address: string) => {
  try {
    const provider = getProvider();
    const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, MetaMindNFT.abi, provider);
    
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying ownership:', error);
    return false;
  }
};

// Get NFT metadata
export const getNFTMetadata = async (tokenId: string) => {
  try {
    const provider = getProvider();
    const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, MetaMindNFT.abi, provider);
    
    const tokenURI = await contract.tokenURI(tokenId);
    
    // Fetch metadata from URI
    let metadata;
    if (tokenURI.startsWith('ipfs://')) {
      const ipfsHash = tokenURI.replace('ipfs://', '');
      const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
      const response = await fetch(ipfsUrl);
      metadata = await response.json();
    } else {
      const response = await fetch(tokenURI);
      metadata = await response.json();
    }
    
    return { tokenId, tokenURI, metadata };
  } catch (error) {
    console.error('Error getting NFT metadata:', error);
    throw error;
  }
};

export default {
  connectWallet,
  verifyOwnership,
  getNFTMetadata
};