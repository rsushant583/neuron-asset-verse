import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export const createPaymentIntent = async (amount: number, productId: string) => {
  try {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        productId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Payment intent creation error:', error);
    throw error;
  }
};

export const processPayment = async (clientSecret: string) => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
    
    if (error) {
      throw error;
    }
    
    return paymentIntent;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};

export default {
  createPaymentIntent,
  processPayment,
  stripePromise
};