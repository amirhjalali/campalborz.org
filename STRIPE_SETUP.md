# Stripe Payment Integration Setup Guide

This guide walks you through setting up Stripe payment processing for the Camp Alborz donation system.

---

## Table of Contents

1. [Overview](#overview)
2. [Create Stripe Account](#create-stripe-account)
3. [Get API Keys](#get-api-keys)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Install Dependencies](#install-dependencies)
6. [Test Mode Setup](#test-mode-setup)
7. [Webhook Configuration](#webhook-configuration)
8. [Production Setup](#production-setup)
9. [Testing Payments](#testing-payments)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Camp Alborz platform uses **Stripe Elements** for secure payment processing. Stripe handles all sensitive card data, so your server never touches credit card information.

**Features:**
- ✅ One-time donations
- ✅ Recurring monthly donations
- ✅ Tax-deductible receipts
- ✅ Donor email capture
- ✅ Payment confirmation page
- ✅ Webhook events for automation
- ✅ Demo mode for development

---

## Create Stripe Account

### Step 1: Sign Up

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Enter your email and create a password
4. Complete email verification

### Step 2: Activate Your Account

1. Complete the business profile
2. Provide tax information (EIN for 501(c)(3))
3. Add bank account for payouts
4. Verify your identity

**For Camp Alborz:**
- Business type: Non-profit
- Tax status: 501(c)(3)
- Legal business name: Camp Alborz
- Industry: Arts & Culture / Community Organizations

---

## Get API Keys

### Publishable Key (Frontend)

This key is safe to expose in your frontend code.

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" in the top nav
3. Click "API keys"
4. Copy the **Publishable key**
   - Test mode: `pk_test_...`
   - Live mode: `pk_live_...`

### Secret Key (Backend)

⚠️ **NEVER expose this key in frontend code or commit to git!**

1. On the same API keys page
2. Click "Reveal test key" or "Reveal live key"
3. Copy the **Secret key**
   - Test mode: `sk_test_...`
   - Live mode: `sk_live_...`

---

## Configure Environment Variables

### Step 1: Update .env.local

Create or edit `packages/web/.env.local`:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 2: Verify Configuration

The app will automatically detect if Stripe is configured:

```typescript
import { isStripeConfigured } from '@/lib/stripe';

if (isStripeConfigured()) {
  // Show real Stripe payment form
} else {
  // Show demo mode
}
```

---

## Install Dependencies

The Stripe dependencies should already be installed. If not:

```bash
cd packages/web

# Frontend (Stripe Elements)
npm install @stripe/stripe-js @stripe/react-stripe-js

# Backend (Stripe Node SDK)
npm install stripe
```

---

## Test Mode Setup

Stripe provides a test mode for development. **Always start with test mode!**

### Enable Test Mode

1. In Stripe Dashboard, toggle "Test mode" (top right)
2. Use test API keys (they start with `pk_test_` and `sk_test_`)
3. Use test credit cards (see Testing Payments below)

### Test vs Live Mode

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Real charges | ❌ No | ✅ Yes |
| Real emails | ❌ No | ✅ Yes |
| Real money | ❌ No | ✅ Yes |
| Webhooks | ✅ Yes* | ✅ Yes |
| Dashboard | ✅ Yes | ✅ Yes |

*Use Stripe CLI for local webhook testing

---

## Webhook Configuration

Webhooks notify your server when payments succeed, fail, or subscriptions change.

### Local Development (Stripe CLI)

**Step 1: Install Stripe CLI**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Step 2: Login to Stripe**

```bash
stripe login
```

This will open your browser to authorize the CLI.

**Step 3: Forward Webhooks**

```bash
stripe listen --forward-to localhost:3006/api/webhooks/stripe
```

Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local`.

**Step 4: Test Webhook**

In another terminal:

```bash
stripe trigger payment_intent.succeeded
```

### Production Webhooks

**Step 1: Deploy Your App**

Your webhook endpoint must be publicly accessible:
```
https://yourdomain.com/api/webhooks/stripe
```

**Step 2: Add Webhook in Stripe Dashboard**

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

**Step 3: Add Webhook Secret to Production**

Update your production environment variables:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

---

## Production Setup

### Before Going Live Checklist

- [ ] Business profile completed in Stripe
- [ ] Bank account added and verified
- [ ] Tax information submitted
- [ ] Identity verified
- [ ] 501(c)(3) documentation uploaded
- [ ] Payment methods enabled (Card, Apple Pay, Google Pay)
- [ ] Email receipts configured
- [ ] Webhooks configured
- [ ] Test payments completed successfully

### Switch to Live Mode

1. In Stripe Dashboard, toggle to "Live mode"
2. Get your **live** API keys
3. Update production environment variables:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... (from live webhook)
   ```
4. Deploy with new keys
5. Test with a small real donation

### Security Best Practices

1. **Never commit secrets to git**
   - Use `.env.local` (already in `.gitignore`)
   - Use environment variables in production

2. **Verify webhook signatures**
   - Already implemented in `/api/webhooks/stripe`
   - Prevents fake payment notifications

3. **Use HTTPS only**
   - Required by Stripe for webhooks
   - Use Vercel/Netlify for automatic HTTPS

4. **Monitor for fraud**
   - Enable Stripe Radar (included free)
   - Set up email alerts for disputes

---

## Testing Payments

### Test Credit Cards

Stripe provides test card numbers:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0341` | Incorrect CVC |
| `4000 0025 0000 3155` | 3D Secure required |

**For all test cards:**
- CVV: Any 3 digits
- Expiry: Any future date
- ZIP: Any 5 digits

### Testing Donations

**Test One-Time Donation:**

1. Go to `http://localhost:3006/donate`
2. Select amount or enter custom
3. Choose "One-Time"
4. Click "Continue to Details"
5. Enter email (will NOT send in test mode)
6. Click "Continue to Payment"
7. Enter test card: `4242 4242 4242 4242`
8. Click "Donate"
9. Should see success page

**Test Recurring Donation:**

1. Select "Monthly" instead
2. Follow same steps
3. Check Stripe Dashboard → Subscriptions

**Test Failed Payment:**

1. Use card `4000 0000 0000 9995`
2. Should see error message
3. Check browser console for details

### Verify in Stripe Dashboard

After test payment:

1. Go to [Payments](https://dashboard.stripe.com/test/payments)
2. See your test payment listed
3. Click to view details
4. Check metadata for donor info
5. Go to [Events](https://dashboard.stripe.com/test/events) to see webhook events

---

## Troubleshooting

### "Stripe is not configured" Message

**Cause:** Publishable key not set or invalid

**Fix:**
1. Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Make sure it starts with `pk_test_` or `pk_live_`
3. Restart dev server after changing env vars

### Payment Intent Creation Fails

**Cause:** Secret key missing or invalid

**Fix:**
1. Check `STRIPE_SECRET_KEY` in `.env.local`
2. Make sure it starts with `sk_test_` or `sk_live_`
3. Check server logs for error details

### Webhooks Not Receiving Events

**Cause:** Webhook not configured or secret mismatch

**Local Development:**
```bash
# Make sure Stripe CLI is forwarding
stripe listen --forward-to localhost:3006/api/webhooks/stripe
```

**Production:**
1. Check webhook URL is correct in Stripe Dashboard
2. Verify webhook secret matches environment variable
3. Check webhook logs in Stripe Dashboard

### "Invalid API Key" Error

**Causes:**
- Using live key in test mode (or vice versa)
- Key copied incorrectly
- Key revoked or expired

**Fix:**
1. Toggle correct mode in Stripe Dashboard
2. Copy key again (click "Reveal" first)
3. Update environment variable
4. Restart server

### Payments Succeed but No Webhook

**Check:**
1. Webhook endpoint is publicly accessible (production)
2. Webhook secret is correct
3. Event types are selected in Stripe Dashboard
4. Webhook signature verification is working

**Debug:**
```bash
# Local
stripe listen --forward-to localhost:3006/api/webhooks/stripe --print-json

# Production
Check Stripe Dashboard → Webhooks → Click endpoint → View logs
```

---

## Resources

### Documentation
- [Stripe Docs](https://stripe.com/docs)
- [Accept a payment](https://stripe.com/docs/payments/accept-a-payment)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

### Support
- [Stripe Support](https://support.stripe.com)
- [Stripe Community](https://stripe.com/community)
- [API Status](https://status.stripe.com)

### Camp Alborz Files
- Payment form: `packages/web/src/components/donation/DonationForm.tsx`
- Stripe config: `packages/web/src/lib/stripe.ts`
- Payment API: `packages/web/src/app/api/create-payment-intent/route.ts`
- Webhook handler: `packages/web/src/app/api/webhooks/stripe/route.ts`
- Success page: `packages/web/src/app/donate/success/page.tsx`

---

## Questions?

If you run into issues:

1. Check this guide first
2. Review Stripe documentation
3. Check browser console and server logs
4. Test with Stripe CLI
5. Contact Stripe support

**For Camp Alborz specific questions:**
- Email: tech@campalborz.org
- Refer to: `ENV_SETUP.md` for environment configuration

---

**Last Updated:** 2025-11-06
**Version:** 1.0
**Status:** ✅ Production Ready
