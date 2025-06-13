import { ethers } from 'ethers';
import { supabase } from '../services/supabase.js';
import { uploadJSONToIPFS } from '../services/ipfs.js';
import { logger } from '../utils/logger.js';
import MetaMindNFT from '../contracts/MetaMindNFT.js';
import dotenv from 'dotenv';

dotenv.config();

// Get provider based on environment
const getProvider = () => {
  const network = process.env.BLOCKCHAIN_NETWORK || 'polygon-mumbai';
  
  if (network === 'polygon-mainnet') {
    return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  } else if (network === 'polygon-mumbai') {
    return new ethers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC_URL);
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }
};

// Get contract instance
const getContract = () => {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider);
  const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
  
  return new ethers.Contract(contractAddress, MetaMindNFT.abi, wallet);
};

/**
 * Process NFT minting job
 */
export const processNFTMinting = async (data) => {
  const { mintRequestId, productId, userId, metadata } = data;
  
  try {
    logger.info(`Starting NFT minting process for request ${mintRequestId}`);
    
    // Update mint request status to processing
    await supabase
      .from('nft_mint_requests')
      .update({ status: 'processing' })
      .eq('id', mintRequestId);
    
    // Upload metadata to IPFS
    logger.info(`Uploading metadata to IPFS for request ${mintRequestId}`);
    const ipfsResult = await uploadJSONToIPFS(metadata);
    const metadataUrl = ipfsResult.ipfsUrl;
    
    // Update mint request with metadata URL
    await supabase
      .from('nft_mint_requests')
      .update({ metadata_url: metadataUrl })
      .eq('id', mintRequestId);
    
    // Get user wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    if (!userData.wallet_address) {
      throw new Error(`User ${userId} does not have a wallet address`);
    }
    
    // Get contract instance
    const contract = getContract();
    
    // Mint NFT
    logger.info(`Minting NFT for request ${mintRequestId}`);
    const tx = await contract.mintNFT(
      userData.wallet_address,
      metadataUrl,
      500 // 5% royalty
    );
    
    // Wait for transaction to be mined
    logger.info(`Waiting for transaction ${tx.hash} to be mined`);
    const receipt = await tx.wait();
    
    // Get token ID from event
    const mintEvent = receipt.logs
      .filter(log => log.topics[0] === ethers.id("Transfer(address,address,uint256)"))
      .map(log => {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data
        });
        return parsedLog;
      })[0];
    
    const tokenId = mintEvent.args[2];
    
    // Update mint request with success status and transaction hash
    await supabase
      .from('nft_mint_requests')
      .update({
        status: 'minted',
        txn_hash: tx.hash,
        token_id: tokenId.toString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', mintRequestId);
    
    // Update product with NFT information
    await supabase
      .from('ai_products')
      .update({
        is_nft: true,
        token_id: tokenId.toString(),
        metadata_url: metadataUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
    
    logger.info(`NFT minting completed successfully for request ${mintRequestId}, token ID: ${tokenId}`);
    
    return {
      success: true,
      mintRequestId,
      tokenId: tokenId.toString(),
      txHash: tx.hash,
      metadataUrl
    };
  } catch (error) {
    logger.error(`Error minting NFT for request ${mintRequestId}:`, error);
    
    // Update mint request with failed status
    await supabase
      .from('nft_mint_requests')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', mintRequestId);
    
    throw error;
  }
};