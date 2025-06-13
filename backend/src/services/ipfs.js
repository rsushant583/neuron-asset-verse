import { create } from 'ipfs-http-client';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Pinata SDK for IPFS
import pinataSDK from 'pinata-sdk';
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// Upload file to IPFS using Pinata
export const uploadToIPFS = async (fileOrUrl) => {
  try {
    let file;
    
    // If input is a URL, download the file first
    if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('http://') || fileOrUrl.startsWith('https://'))) {
      const response = await axios.get(fileOrUrl, { responseType: 'arraybuffer' });
      file = Buffer.from(response.data);
    } else {
      file = fileOrUrl;
    }
    
    // Upload to Pinata
    const options = {
      pinataMetadata: {
        name: `MetaMind_${Date.now()}`
      },
      pinataOptions: {
        cidVersion: 1
      }
    };
    
    const result = await pinata.pinFileToIPFS(file, options);
    
    return {
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
      ipfsUrl: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    };
  } catch (error) {
    logger.error('Error uploading to IPFS:', error);
    throw error;
  }
};

// Upload JSON metadata to IPFS
export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const options = {
      pinataMetadata: {
        name: `MetaMind_Metadata_${Date.now()}`
      },
      pinataOptions: {
        cidVersion: 1
      }
    };
    
    const result = await pinata.pinJSONToIPFS(jsonData, options);
    
    return {
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp,
      ipfsUrl: `ipfs://${result.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    };
  } catch (error) {
    logger.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

// Get content from IPFS
export const getFromIPFS = async (ipfsHash) => {
  try {
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const response = await axios.get(gatewayUrl);
    return response.data;
  } catch (error) {
    logger.error('Error getting content from IPFS:', error);
    throw error;
  }
};

export default {
  uploadToIPFS,
  uploadJSONToIPFS,
  getFromIPFS
};