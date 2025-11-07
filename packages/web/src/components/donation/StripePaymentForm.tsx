'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/Button';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
  donationType: 'ONE_TIME' | 'RECURRING';
}

export function StripePaymentForm({
  amount,
  onSuccess,
  onError,
  onBack,
  donationType,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      onError('Payment system not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'An error occurred during payment');
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="border border-gray-200 rounded-lg p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <LockClosedIcon className="h-4 w-4 mr-2" />
        <span>Secured by Stripe • SSL Encrypted • PCI Compliant</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Donate ${(amount / 100).toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * Demo payment form for when Stripe is not configured
 */
export function DemoPaymentForm({
  amount,
  onSuccess,
  onBack,
  donationType,
}: StripePaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDemoSubmit = async () => {
    setIsProcessing(true);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Demo Mode - Stripe Not Configured
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            In production, this would show a secure Stripe payment form.
            <br />
            For now, clicking "Complete Demo Payment" will simulate a successful transaction.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>To enable real payments:</strong> Add your Stripe publishable key to <code className="bg-blue-100 px-1 rounded">.env.local</code>
            </p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <LockClosedIcon className="h-4 w-4 mr-2" />
        <span>Would be: SSL Encrypted & PCI Compliant via Stripe</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleDemoSubmit}
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Demo...
            </>
          ) : (
            `Complete Demo Payment ($${(amount / 100).toFixed(2)})`
          )}
        </Button>
      </div>
    </div>
  );
}
