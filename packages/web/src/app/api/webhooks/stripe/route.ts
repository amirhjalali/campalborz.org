import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Stripe Webhook Handler
 *
 * This endpoint receives webhook events from Stripe and processes them.
 * Webhooks are how Stripe notifies you about asynchronous events like successful payments.
 *
 * IMPORTANT: In production, you must:
 * 1. Install stripe package: npm install stripe
 * 2. Set STRIPE_WEBHOOK_SECRET in your environment
 * 3. Configure webhook endpoint in Stripe Dashboard
 * 4. Verify webhook signatures for security
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    // In production, verify the webhook signature:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // let event;
    //
    // try {
    //   event = stripe.webhooks.constructEvent(
    //     body,
    //     signature,
    //     process.env.STRIPE_WEBHOOK_SECRET
    //   );
    // } catch (err) {
    //   console.error('Webhook signature verification failed:', err.message);
    //   return NextResponse.json(
    //     { error: 'Webhook signature verification failed' },
    //     { status: 400 }
    //   );
    // }

    // For demo mode, just parse the body
    const event = JSON.parse(body);

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'payment_intent.created':
        console.log('Payment intent created:', event.data.object.id);
        break;

      case 'charge.succeeded':
        console.log('Charge succeeded:', event.data.object.id);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id);

  // In production, you would:
  // 1. Save donation to database
  // 2. Send receipt email
  // 3. Update donor record
  // 4. Trigger any post-payment workflows

  const { amount, metadata } = paymentIntent;

  console.log('Donation details:', {
    amount: amount / 100, // Convert from cents
    donorName: metadata?.donorName,
    donorEmail: metadata?.donorEmail,
    campaign: metadata?.campaign,
    message: metadata?.message,
  });

  // TODO: Save to database
  // const donation = await prisma.donation.create({
  //   data: {
  //     amount: amount / 100,
  //     stripePaymentIntentId: paymentIntent.id,
  //     donorName: metadata?.donorName,
  //     donorEmail: metadata?.donorEmail,
  //     campaign: metadata?.campaign,
  //     message: metadata?.message,
  //     status: 'COMPLETED',
  //   },
  // });

  // TODO: Send receipt email
  // await sendDonationReceipt({
  //   email: metadata?.donorEmail,
  //   amount: amount / 100,
  //   donationId: donation.id,
  // });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id);

  // In production, you would:
  // 1. Update donation status in database
  // 2. Send notification to donor
  // 3. Log for analytics

  console.log('Failure reason:', paymentIntent.last_payment_error?.message);

  // TODO: Update database
  // await prisma.donation.update({
  //   where: { stripePaymentIntentId: paymentIntent.id },
  //   data: { status: 'FAILED' },
  // });
}

/**
 * Handle new recurring subscription
 */
async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id);

  // In production, you would:
  // 1. Create recurring donation record
  // 2. Link to customer
  // 3. Send confirmation email

  // TODO: Save subscription
  // await prisma.recurringDonation.create({
  //   data: {
  //     stripeSubscriptionId: subscription.id,
  //     amount: subscription.items.data[0].price.unit_amount / 100,
  //     interval: subscription.items.data[0].price.recurring.interval,
  //     status: 'ACTIVE',
  //   },
  // });
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id);

  // TODO: Update subscription in database
  // await prisma.recurringDonation.update({
  //   where: { stripeSubscriptionId: subscription.id },
  //   data: {
  //     status: subscription.status,
  //     amount: subscription.items.data[0].price.unit_amount / 100,
  //   },
  // });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: any) {
  console.log('Subscription canceled:', subscription.id);

  // TODO: Update subscription status
  // await prisma.recurringDonation.update({
  //   where: { stripeSubscriptionId: subscription.id },
  //   data: { status: 'CANCELED' },
  // });

  // TODO: Send cancellation confirmation email
}

/**
 * Configuration for Next.js
 * This ensures the raw body is available for signature verification
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
