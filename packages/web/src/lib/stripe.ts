/**
 * Stripe Configuration
 *
 * Initializes Stripe with publishable key from environment
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { env } from './env';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance (singleton pattern)
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = env.stripePublishableKey;

    if (!key || key === 'pk_test_placeholder') {
      console.warn('Stripe publishable key not configured. Using test mode placeholder.');
      // Return null stripe for demo mode
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
};

/**
 * Check if Stripe is properly configured
 */
export const isStripeConfigured = (): boolean => {
  const key = env.stripePublishableKey;
  return !!key && key !== 'pk_test_placeholder' && key.startsWith('pk_');
};

/**
 * Format amount for Stripe (convert to cents)
 */
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Format amount for display (convert from cents)
 */
export const formatAmountForDisplay = (amount: number): string => {
  return (amount / 100).toFixed(2);
};
