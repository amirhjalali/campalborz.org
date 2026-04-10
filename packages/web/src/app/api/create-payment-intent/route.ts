import { NextRequest, NextResponse } from 'next/server';

/**
 * Create Payment Intent API Route
 *
 * Camp Alborz does NOT currently run its own Stripe integration. All donations
 * are processed by Givebutter (campalborz.org's registered 501(c)(3) payment
 * partner) via https://givebutter.com/Alborz2025Fundraiser.
 *
 * This route is preserved as a placeholder for future self-hosted payment
 * processing. It returns 501 Not Implemented so any client that calls it
 * receives a clear, actionable error instead of a fake payment intent.
 */

const GIVEBUTTER_URL = 'https://givebutter.com/Alborz2025Fundraiser';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Direct payment processing is not enabled on campalborz.org.',
      message:
        'Donations to Camp Alborz are handled by Givebutter, our 501(c)(3) payment partner. Please use the Givebutter link to complete a tax-deductible donation.',
      donationUrl: GIVEBUTTER_URL,
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed.',
      donationUrl: GIVEBUTTER_URL,
    },
    { status: 405 }
  );
}
