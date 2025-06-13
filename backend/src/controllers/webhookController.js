import { verifyWebhookSignature } from '../services/stripe.js';
import { supabase } from '../services/supabase.js';
import { addToQueue } from '../services/queues.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Stripe webhook handler
 */
export const stripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature);
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Supabase webhook handler
 */
export const supabaseWebhook = async (req, res, next) => {
  try {
    const { type, record, old_record } = req.body;
    
    // Verify webhook secret
    const webhookSecret = req.headers['x-supabase-webhook-secret'];
    
    if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    
    // Handle different event types
    switch (type) {
      case 'INSERT':
        logger.info(`New record inserted: ${JSON.stringify(record)}`);
        break;
      
      case 'UPDATE':
        logger.info(`Record updated: ${JSON.stringify(record)}`);
        break;
      
      case 'DELETE':
        logger.info(`Record deleted: ${JSON.stringify(old_record)}`);
        break;
      
      default:
        logger.info(`Unhandled Supabase event type: ${type}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Supabase webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * IPFS webhook handler
 */
export const ipfsWebhook = async (req, res, next) => {
  try {
    const { event, ipfsHash } = req.body;
    
    // Verify webhook secret
    const webhookSecret = req.headers['x-ipfs-webhook-secret'];
    
    if (webhookSecret !== process.env.IPFS_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    
    // Handle different event types
    switch (event) {
      case 'pin.add':
        logger.info(`New content pinned: ${ipfsHash}`);
        break;
      
      case 'pin.rm':
        logger.info(`Content unpinned: ${ipfsHash}`);
        break;
      
      default:
        logger.info(`Unhandled IPFS event type: ${event}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('IPFS webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Blockchain webhook handler
 */
export const blockchainWebhook = async (req, res, next) => {
  try {
    const { event, transaction, contract } = req.body;
    
    // Verify webhook secret
    const webhookSecret = req.headers['x-blockchain-webhook-secret'];
    
    if (webhookSecret !== process.env.BLOCKCHAIN_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }
    
    // Handle different event types
    switch (event) {
      case 'tx.confirmed':
        logger.info(`Transaction confirmed: ${transaction.hash}`);
        
        // Update NFT mint request if applicable
        if (contract === process.env.NFT_CONTRACT_ADDRESS) {
          await updateMintRequestFromTransaction(transaction);
        }
        break;
      
      case 'tx.failed':
        logger.info(`Transaction failed: ${transaction.hash}`);
        break;
      
      default:
        logger.info(`Unhandled blockchain event type: ${event}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Blockchain webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const { id, metadata, amount } = paymentIntent;
    
    // Check if this is a product purchase
    if (metadata && metadata.productId && metadata.userId) {
      // Create purchase record
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert([
          {
            id: uuidv4(),
            buyer_id: metadata.userId,
            ai_product_id: metadata.productId,
            price: amount / 100, // Convert from cents
            payment_id: id,
            payment_method: 'stripe',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Get product details
      const { data: product } = await supabase
        .from('ai_products')
        .select('title, user_id')
        .eq('id', metadata.productId)
        .single();
      
      // Track purchase in analytics
      await supabase
        .from('analytics')
        .insert([
          {
            id: uuidv4(),
            user_id: metadata.userId,
            ai_product_id: metadata.productId,
            event_type: 'purchase',
            event_data: {
              price: amount / 100,
              payment_method: 'stripe',
              payment_id: id,
              timestamp: new Date().toISOString()
            }
          }
        ]);
      
      // Send email notifications
      await addToQueue('emailNotifications', {
        type: 'purchase_confirmation',
        userId: metadata.userId,
        productId: metadata.productId,
        productTitle: product.title,
        price: amount / 100,
        orderId: purchase.id
      });
      
      await addToQueue('emailNotifications', {
        type: 'sale_notification',
        userId: product.user_id,
        buyerId: metadata.userId,
        productId: metadata.productId,
        productTitle: product.title,
        price: amount / 100,
        orderId: purchase.id
      });
      
      logger.info(`Purchase created for payment ${id}`);
    }
  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
    throw error;
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const { id, metadata, last_payment_error } = paymentIntent;
    
    logger.info(`Payment failed: ${id}, reason: ${last_payment_error?.message}`);
    
    // Track failed payment in analytics
    if (metadata && metadata.userId) {
      await supabase
        .from('analytics')
        .insert([
          {
            id: uuidv4(),
            user_id: metadata.userId,
            ai_product_id: metadata.productId,
            event_type: 'payment_failed',
            event_data: {
              payment_id: id,
              error: last_payment_error?.message,
              timestamp: new Date().toISOString()
            }
          }
        ]);
    }
  } catch (error) {
    logger.error('Error handling payment failed:', error);
    throw error;
  }
};

/**
 * Handle refund
 */
const handleRefund = async (charge) => {
  try {
    const { payment_intent, amount_refunded } = charge;
    
    // Find purchase by payment intent
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('payment_id', payment_intent)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Not found
        throw error;
      }
      return; // No purchase found for this payment
    }
    
    // Update purchase with refund information
    await supabase
      .from('purchases')
      .update({
        refunded: true,
        refund_amount: amount_refunded / 100, // Convert from cents
        updated_at: new Date().toISOString()
      })
      .eq('id', purchase.id);
    
    // Track refund in analytics
    await supabase
      .from('analytics')
      .insert([
        {
          id: uuidv4(),
          user_id: purchase.buyer_id,
          ai_product_id: purchase.ai_product_id,
          event_type: 'refund',
          event_data: {
            payment_id: payment_intent,
            refund_amount: amount_refunded / 100,
            timestamp: new Date().toISOString()
          }
        }
      ]);
    
    logger.info(`Refund processed for payment ${payment_intent}`);
  } catch (error) {
    logger.error('Error handling refund:', error);
    throw error;
  }
};

/**
 * Update mint request from transaction
 */
const updateMintRequestFromTransaction = async (transaction) => {
  try {
    // Find mint request by transaction hash
    const { data: mintRequest, error } = await supabase
      .from('nft_mint_requests')
      .select('*')
      .eq('txn_hash', transaction.hash)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // Not found
        throw error;
      }
      return; // No mint request found for this transaction
    }
    
    // Update mint request status
    await supabase
      .from('nft_mint_requests')
      .update({
        status: transaction.status === 1 ? 'minted' : 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', mintRequest.id);
    
    logger.info(`Mint request ${mintRequest.id} updated from blockchain transaction`);
  } catch (error) {
    logger.error('Error updating mint request from transaction:', error);
    throw error;
  }
};