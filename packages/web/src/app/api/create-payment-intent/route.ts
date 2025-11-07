import { NextRequest, NextResponse } from 'next/server';

/**
 * Create Payment Intent API Route
 *
 * This endpoint creates a Stripe Payment Intent for processing donations.
 * In production, this would use the Stripe Node SDK with your secret key.
 *
 * For now, it returns a mock response for development.
 */

export async function POST(request: NextRequest) {
  try {
    const { amount, donationType, currency = 'usd' } = await request.json();

    // Validate amount
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least $1.00' },
        { status: 400 }
      );
    }

    // In production, you would:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount,
    //   currency,
    //   metadata: {
    //     donationType,
    //   },
    // });

    // For development/demo, return a mock payment intent
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      clientSecret: mockClientSecret,
      message: 'Demo mode - real Stripe integration not configured',
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

/**
 * For production, install Stripe SDK:
 *   npm install stripe
 *
 * Then update this file:
 *
 * ```typescript
 * import Stripe from 'stripe';
 *
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 *   apiVersion: '2023-10-16',
 * });
 *
 * export async function POST(request: NextRequest) {
 *   const { amount, donationType, currency = 'usd', metadata = {} } = await request.json();
 *
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount,
 *     currency,
 *     automatic_payment_methods: {
 *       enabled: true,
 *     },
 *     metadata: {
 *       donationType,
 *       ...metadata,
 *     },
 *   });
 *
 *   return NextResponse.json({
 *     clientSecret: paymentIntent.client_secret,
 *   });
 * }
 * ```
 */
