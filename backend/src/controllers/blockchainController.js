import { ethers } from 'ethers';
import { supabase } from '../services/supabase.js';
import { uploadToIPFS } from '../services/ipfs.js';
import { addToQueue } from '../services/queues.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import MetaMindNFT from '../contracts/MetaMindNFT.js';

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
 * Create NFT mint request
 */
export const createMintRequest = async (req, res, next) => {
  try {
    const { productId, metadata } = req.body;
    const userId = req.user.id;
    
    // Verify product ownership
    const { data: product, error: productError } = await supabase
      .from('ai_products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', userId)
      .single();
    
    if (productError) {
      if (productError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Product not found or not owned by user' });
      }
      throw productError;
    }
    
    // Prepare metadata for IPFS
    const nftMetadata = {
      name: metadata.name || product.title,
      description: metadata.description || product.description,
      image: metadata.image || product.preview_image,
      external_url: `https://metamind.app/product/${productId}`,
      attributes: [
        {
          trait_type: 'Category',
          value: metadata.category || 'Knowledge'
        },
        {
          trait_type: 'Creator',
          value: req.user.username
        },
        {
          trait_type: 'Creation Date',
          value: new Date().toISOString().split('T')[0]
        },
        ...(metadata.attributes || [])
      ]
    };
    
    // Create mint request in database
    const mintRequestId = uuidv4();
    const { data: mintRequest, error: mintRequestError } = await supabase
      .from('nft_mint_requests')
      .insert([
        {
          id: mintRequestId,
          ai_product_id: productId,
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (mintRequestError) throw mintRequestError;
    
    // Add to minting queue
    await addToQueue('nftMinting', {
      mintRequestId,
      productId,
      userId,
      metadata: nftMetadata
    });
    
    return res.status(202).json({
      message: 'NFT minting request queued',
      mintRequestId,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Error creating mint request:', error);
    next(error);
  }
};

/**
 * Get mint request status
 */
export const getMintRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    
    const { data, error } = await supabase
      .from('nft_mint_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Mint request not found' });
      }
      throw error;
    }
    
    // Verify user has access to this mint request
    if (data.user_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Unauthorized access to mint request'
      });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error getting mint request status:', error);
    next(error);
  }
};

/**
 * Get all mint requests for a user
 */
export const getUserMintRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('nft_mint_requests')
      .select(`
        *,
        ai_products (
          title,
          preview_image
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Error getting user mint requests:', error);
    next(error);
  }
};

/**
 * Verify NFT ownership
 */
export const verifyOwnership = async (req, res, next) => {
  try {
    const { tokenId, address } = req.body;
    
    const contract = getContract();
    
    // Call ownerOf function on the contract
    const owner = await contract.ownerOf(tokenId);
    
    // Check if the provided address is the owner
    const isOwner = owner.toLowerCase() === address.toLowerCase();
    
    return res.status(200).json({
      tokenId,
      address,
      isOwner,
      owner
    });
  } catch (error) {
    logger.error('Error verifying ownership:', error);
    
    // Handle case where token doesn't exist
    if (error.message.includes('nonexistent token')) {
      return res.status(404).json({
        error: 'Token does not exist',
        tokenId: req.body.tokenId
      });
    }
    
    next(error);
  }
};

/**
 * Get NFT metadata
 */
export const getNFTMetadata = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    
    const contract = getContract();
    
    // Call tokenURI function on the contract
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
    
    return res.status(200).json({
      tokenId,
      tokenURI,
      metadata
    });
  } catch (error) {
    logger.error('Error getting NFT metadata:', error);
    
    // Handle case where token doesn't exist
    if (error.message.includes('nonexistent token')) {
      return res.status(404).json({
        error: 'Token does not exist',
        tokenId: req.params.tokenId
      });
    }
    
    next(error);
  }
};

/**
 * Get royalty information
 */
export const getRoyaltyInfo = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    
    const contract = getContract();
    
    // Call royaltyInfo function on the contract
    const salePrice = ethers.parseEther('1.0'); // 1 ETH as example sale price
    const [receiver, royaltyAmount] = await contract.royaltyInfo(tokenId, salePrice);
    
    // Convert royalty amount to percentage
    const royaltyPercentage = (Number(royaltyAmount) / Number(salePrice)) * 100;
    
    return res.status(200).json({
      tokenId,
      receiver,
      royaltyAmount: ethers.formatEther(royaltyAmount),
      royaltyPercentage: royaltyPercentage.toFixed(2)
    });
  } catch (error) {
    logger.error('Error getting royalty info:', error);
    
    // Handle case where token doesn't exist
    if (error.message.includes('nonexistent token')) {
      return res.status(404).json({
        error: 'Token does not exist',
        tokenId: req.params.tokenId
      });
    }
    
    next(error);
  }
};