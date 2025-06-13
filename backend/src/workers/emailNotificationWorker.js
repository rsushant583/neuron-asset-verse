import { sendEmail } from '../services/email.js';
import { supabase } from '../services/supabase.js';
import { logger } from '../utils/logger.js';
import moment from 'moment';

/**
 * Process email notification job
 */
export const processEmailNotifications = async (data) => {
  try {
    const { type, userId, ...otherData } = data;
    
    switch (type) {
      case 'purchase_confirmation':
        await sendPurchaseConfirmation(userId, otherData);
        break;
      
      case 'sale_notification':
        await sendSaleNotification(userId, otherData);
        break;
      
      case 'product_created':
        await sendProductCreatedNotification(userId, otherData);
        break;
      
      case 'nft_minted':
        await sendNFTMintedNotification(userId, otherData);
        break;
      
      default:
        logger.warn(`Unknown email notification type: ${type}`);
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error processing email notification:', error);
    throw error;
  }
};

/**
 * Send purchase confirmation email
 */
const sendPurchaseConfirmation = async (userId, data) => {
  try {
    const { productId, productTitle, price, orderId } = data;
    
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Your MetaMind Purchase Confirmation',
      template: 'purchase-confirmation',
      context: {
        username: user.username,
        productTitle,
        orderId,
        price,
        purchaseDate: moment().format('MMMM D, YYYY'),
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/buyer`
      }
    });
    
    logger.info(`Purchase confirmation email sent to ${user.email}`);
  } catch (error) {
    logger.error('Error sending purchase confirmation email:', error);
    throw error;
  }
};

/**
 * Send sale notification email
 */
const sendSaleNotification = async (userId, data) => {
  try {
    const { buyerId, productId, productTitle, price, orderId } = data;
    
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Calculate earnings (platform fee is 10%)
    const earnings = (price * 0.9).toFixed(2);
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'You Made a Sale on MetaMind!',
      template: 'sale-notification',
      context: {
        username: user.username,
        productTitle,
        price,
        earnings,
        saleDate: moment().format('MMMM D, YYYY'),
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/creator`
      }
    });
    
    logger.info(`Sale notification email sent to ${user.email}`);
  } catch (error) {
    logger.error('Error sending sale notification email:', error);
    throw error;
  }
};

/**
 * Send product created notification
 */
const sendProductCreatedNotification = async (userId, data) => {
  try {
    const { productId, productTitle } = data;
    
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Your MetaMind Product Has Been Created',
      template: 'product-created',
      context: {
        username: user.username,
        productTitle,
        productUrl: `${process.env.FRONTEND_URL}/product/${productId}`,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/creator`
      }
    });
    
    logger.info(`Product created email sent to ${user.email}`);
  } catch (error) {
    logger.error('Error sending product created email:', error);
    throw error;
  }
};

/**
 * Send NFT minted notification
 */
const sendNFTMintedNotification = async (userId, data) => {
  try {
    const { productId, productTitle, tokenId, txHash } = data;
    
    // Get user email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Get blockchain explorer URL based on network
    const network = process.env.BLOCKCHAIN_NETWORK || 'polygon-mumbai';
    let explorerUrl;
    
    if (network === 'polygon-mainnet') {
      explorerUrl = `https://polygonscan.com/tx/${txHash}`;
    } else {
      explorerUrl = `https://mumbai.polygonscan.com/tx/${txHash}`;
    }
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Your MetaMind NFT Has Been Minted',
      template: 'nft-minted',
      context: {
        username: user.username,
        productTitle,
        tokenId,
        txHash,
        explorerUrl,
        productUrl: `${process.env.FRONTEND_URL}/product/${productId}`,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/creator`
      }
    });
    
    logger.info(`NFT minted email sent to ${user.email}`);
  } catch (error) {
    logger.error('Error sending NFT minted email:', error);
    throw error;
  }
};