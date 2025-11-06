# Environment Variable Setup

This guide explains how to set up environment variables for the Camp Management Platform.

## Overview

The platform uses environment variables for configuration. Variables are validated at build time to ensure all required configuration is present.

## Files

- `.env.example` - Template showing all available variables (tracked in git)
- `.env.local` - Your local development settings (ignored by git)
- `.env.production` - Production settings (ignored by git)

## Quick Start

### 1. Web Package (Next.js Frontend)

```bash
cd packages/web
cp .env.example .env.local
```

Edit `.env.local` with your settings:
- Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with your Stripe test key
- Adjust feature flags as needed

### 2. API Package (Backend)

```bash
cd packages/api
cp .env.example .env
```

Edit `.env` with your settings:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Generate a secure `JWT_SECRET`
- Add Stripe secret key for payment processing

## Environment Variables

### Web Package (Frontend)

#### Required (All Environments)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:3001` |
| `NEXT_PUBLIC_PLATFORM_NAME` | Platform display name | `Camp Alborz` |
| `NEXT_PUBLIC_DEFAULT_TENANT` | Default tenant slug | `campalborz` |

#### Required (Production Only)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` |

#### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible Analytics domain | - |
| `NEXT_PUBLIC_ENABLE_CHAT` | Enable real-time chat | `false` |
| `NEXT_PUBLIC_ENABLE_DONATIONS` | Enable donations | `true` |
| `NEXT_PUBLIC_ENABLE_APPLICATIONS` | Enable applications | `true` |

### API Package (Backend)

#### Required (All Environments)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret for JWT signing | Use a strong random string |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` or `production` |

#### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | - |
| `SMTP_PORT` | Email server port | - |
| `SMTP_USER` | Email username | - |
| `SMTP_PASS` | Email password | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | - |

## Validation

Environment variables are validated automatically:

### Development Mode
Missing required variables show **warnings** in console but don't block the build.

### Production Mode
Missing required variables **fail the build** with detailed error messages.

## Usage in Code

### Type-Safe Access

```typescript
import { env } from '@/lib/env';

// Type-safe access
const apiUrl = env.apiUrl;

// Environment checks
if (env.isDevelopment) {
  console.log('Running in development mode');
}

// Feature flags
if (env.enableDonations) {
  // Show donations feature
}
```

### Direct Access (Not Recommended)

```typescript
// Less safe - no validation
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Security Best Practices

### Never Commit Secrets

- ❌ **DO NOT** commit `.env.local`, `.env`, or `.env.production`
- ✅ **DO** commit `.env.example` files
- ✅ **DO** use different keys for development and production

### Public vs Private Variables

**Next.js Public Variables** (`NEXT_PUBLIC_*`):
- Exposed to the browser
- Safe for API URLs, feature flags, public keys
- ❌ Never use for secrets

**Server-Only Variables**:
- Only available server-side
- ✅ Use for secrets, private keys, database URLs

### Generating Secure Secrets

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate a random password
openssl rand -base64 32
```

## Environment-Specific Configuration

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Staging
```bash
NEXT_PUBLIC_API_URL=https://staging-api.campalborz.org
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.campalborz.org
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Troubleshooting

### Build Fails with "Missing required environment variable"

1. Copy `.env.example` to `.env.local`
2. Fill in all required variables
3. Restart the dev server

### Changes Not Taking Effect

Next.js caches environment variables:
```bash
# Stop the dev server
# Delete .next folder
rm -rf .next

# Restart
npm run dev
```

### Can't Access Variable in Browser

Next.js only exposes variables prefixed with `NEXT_PUBLIC_*`:
- ✅ `NEXT_PUBLIC_API_URL` - Available in browser
- ❌ `API_URL` - Only available server-side

## Deployment

### Vercel

Set environment variables in Vercel dashboard:
1. Project Settings → Environment Variables
2. Add each variable with appropriate scope (Production/Preview/Development)
3. Redeploy

### Docker

Pass environment variables to container:
```bash
docker run -e NEXT_PUBLIC_API_URL=http://api:3001 ...
```

Or use `.env` file:
```bash
docker run --env-file .env.production ...
```

## Support

For issues with environment variables:
1. Check this guide
2. Verify `.env.example` has the latest variables
3. Run validation: `npm run build` (validates all required vars)
