import express from 'express';
import * as webhookController from '../controllers/webhookController.js';

const router = express.Router();

// Stripe webhook
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.stripeWebhook
);

// Supabase webhook
router.post(
  '/supabase',
  express.json(),
  webhookController.supabaseWebhook
);

// IPFS webhook
router.post(
  '/ipfs',
  express.json(),
  webhookController.ipfsWebhook
);

// Blockchain webhook
router.post(
  '/blockchain',
  express.json(),
  webhookController.blockchainWebhook
);

export default router;