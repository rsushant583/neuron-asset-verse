import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: Error) => void;
}

const CheckoutForm = ({ clientSecret, amount, onSuccess, onError }: CheckoutFormProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'MetaMind Customer',
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        toast({
          title: "Payment Failed",
          description: paymentError.message || "Your payment could not be processed",
          variant: "destructive"
        });
        onError(new Error(paymentError.message || 'Payment failed'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully"
        });
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div className="text-center">
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple text-white"
        >
          {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Your payment is secure. We use Stripe for payment processing.
      </div>
    </form>
  );
};

interface StripeCheckoutProps {
  amount: number;
  productId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: Error) => void;
}

const StripeCheckout = ({ amount, productId, onSuccess, onError }: StripeCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: 'usd',
            productId: productId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        toast({
          title: "Payment Setup Error",
          description: err.message || "Could not initialize payment",
          variant: "destructive"
        });
        onError(err);
      }
    };

    createIntent();
  }, [amount, productId, toast, onError]);

  if (!clientSecret) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Initializing payment...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripeCheckout;