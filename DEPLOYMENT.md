# Camp Alborz Platform - Deployment Guide

Complete guide for deploying the Camp Alborz platform to production.

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Deployment Options](#deployment-options)
5. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
6. [Netlify Deployment](#netlify-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Database Setup](#database-setup)
9. [Post-Deployment](#post-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

---

## Overview

The Camp Alborz platform is a Next.js 14 application that can be deployed to various platforms. This guide covers the most common deployment scenarios.

**Current Status:**
- ✅ Frontend: Production ready
- ⚠️ Backend: Partially implemented (tRPC mocked)
- ⚠️ Database: Schema defined, not connected
- ✅ Stripe: Demo mode (requires API keys for production)

---

## Pre-Deployment Checklist

### Code Readiness

- [ ] All builds pass locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] All tests pass (if applicable)
- [ ] Code committed to Git
- [ ] Sensitive data removed from code
- [ ] Environment variables documented

### Configuration

- [ ] `.env.example` is up to date
- [ ] All required environment variables identified
- [ ] Stripe keys obtained (if using payments)
- [ ] Database connection string ready
- [ ] Domain name purchased (if custom domain)
- [ ] SSL certificate ready (or using platform SSL)

### Security

- [ ] Secrets not committed to Git
- [ ] CORS configured correctly
- [ ] Rate limiting considered
- [ ] Input validation in place
- [ ] Authentication implemented (if required)

### Performance

- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] Caching strategy defined
- [ ] CDN configured (or using platform CDN)

---

## Environment Setup

### Required Environment Variables

Create these in your deployment platform:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Stripe (for donations)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=https://www.campalborz.org
NEXT_PUBLIC_API_URL=https://api.campalborz.org
NEXT_PUBLIC_WS_URL=wss://api.campalborz.org

# Email (if using)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@campalborz.org

# Platform
NEXT_PUBLIC_PLATFORM_NAME=Camp Alborz
NODE_ENV=production
```

See `ENV_SETUP.md` for complete documentation.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros:**
- Zero configuration for Next.js
- Automatic HTTPS
- Global CDN
- Serverless functions
- Free tier available
- Easy rollbacks

**Cons:**
- Vendor lock-in
- Serverless limitations
- Function timeout limits

### Option 2: Netlify

**Pros:**
- Great for static sites
- Form handling built-in
- Good free tier
- Easy A/B testing

**Cons:**
- Less Next.js optimization than Vercel
- Function limitations

### Option 3: Docker/Self-Hosted

**Pros:**
- Full control
- No vendor lock-in
- Can use any hosting provider
- Predictable costs

**Cons:**
- More setup required
- Manual scaling
- SSL configuration needed
- Maintenance overhead

---

## Vercel Deployment (Recommended)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access repositories

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Vercel auto-detects Next.js settings

### Step 3: Configure Build Settings

**Framework Preset:** Next.js

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Root Directory:**
```
packages/web
```

### Step 4: Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add all required variables (see Environment Setup)
3. Choose environment: Production, Preview, Development

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-5 minutes)
3. Visit your deployment URL

### Step 6: Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `www.campalborz.org`)
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)

### Step 7: Configure Stripe Webhooks

1. Get your deployment URL
2. Add webhook in Stripe Dashboard
3. Endpoint: `https://www.campalborz.org/api/webhooks/stripe`
4. Copy webhook secret
5. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`
6. Redeploy

---

## Netlify Deployment

### Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### Step 2: New Site from Git

1. Click "Add new site" → "Import an existing project"
2. Choose GitHub
3. Select repository

### Step 3: Build Settings

**Base directory:**
```
packages/web
```

**Build command:**
```bash
npm run build
```

**Publish directory:**
```
.next
```

### Step 4: Environment Variables

1. Site settings → Build & deploy → Environment
2. Add all required variables

### Step 5: Deploy

Click "Deploy site"

### Step 6: Custom Domain

1. Domain settings → Add custom domain
2. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: [your-site].netlify.app
   ```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in `packages/web`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build app
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build:
      context: ./packages/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=campalborz
      - POSTGRES_PASSWORD=your_password_here
      - POSTGRES_DB=campalborz
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Database Setup

### Option 1: Vercel Postgres

1. Vercel Dashboard → Storage → Create Database
2. Choose Postgres
3. Copy connection string
4. Add to environment variables: `DATABASE_URL`

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Provision PostgreSQL
3. Copy connection string
4. Add to environment variables

### Option 3: Supabase

1. Go to [supabase.com](https://supabase.com)
2. New project
3. Settings → Database → Connection string
4. Copy and add to environment variables

### Run Migrations

After database is connected:

```bash
# From packages/api directory
npx prisma migrate deploy
npx prisma generate
```

### Seed Database (Optional)

```bash
npx prisma db seed
```

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Forms work
- [ ] Images load
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] No console errors

### 2. Test Stripe (if enabled)

- [ ] Donation form loads
- [ ] Payment element appears
- [ ] Test payment succeeds (use test card)
- [ ] Webhook events received
- [ ] Success page displays

### 3. Configure Monitoring

**Vercel Analytics:**
1. Project Settings → Analytics
2. Enable Web Analytics

**Error Tracking (Sentry):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

### 4. Set Up Email Alerts

Configure alerts for:
- Deployment failures
- Error spikes
- Downtime
- Failed payments

### 5. Configure Backups

**Database Backups:**
```bash
# Daily backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
# Upload to S3 or similar
```

**Code Backups:**
- GitHub repository (already done)
- Download production database weekly

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`
- Check all imports are correct
- Run `npm install` locally
- Delete `node_modules` and reinstall

**Error:** `Environment variable not set`
- Check all required env vars are set in platform
- Rebuild after adding env vars

### Page Not Loading

**Check:**
- Build logs for errors
- Environment variables are correct
- Database is connected and accessible
- Stripe keys are valid (if using)

### Stripe Not Working

**Check:**
- Using live keys (not test)
- Webhook secret matches Stripe Dashboard
- Webhook URL is correct
- HTTPS is enabled

### Database Connection Failed

**Check:**
- Connection string is correct
- Database is running and accessible
- IP whitelist includes deployment IP
- SSL mode is correct

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check uptime status

**Weekly:**
- Review analytics
- Check for failed payments
- Review database performance

**Monthly:**
- Update dependencies: `npm update`
- Review security alerts
- Test backup restoration
- Review and optimize bundle size

### Updating Code

```bash
# Local development
git pull origin main
npm install
npm run build
npm run dev # Test locally

# Commit changes
git add .
git commit -m "Description of changes"
git push origin main

# Vercel/Netlify will auto-deploy
```

### Rollback

**Vercel:**
1. Deployments tab
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

**Netlify:**
1. Deploys tab
2. Find previous deployment
3. Click "Publish deploy"

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

---

## Performance Optimization

### 1. Enable Caching

**Vercel:**
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

### 2. Image Optimization

```javascript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Camp Alborz"
  priority
/>
```

### 3. Code Splitting

Already enabled by default in Next.js.

### 4. Compression

Enable gzip in `next.config.js`:

```javascript
module.exports = {
  compress: true,
};
```

---

## Security Checklist

- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] Environment variables not exposed in frontend
- [ ] CORS configured correctly
- [ ] Rate limiting on API routes
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this)
- [ ] CSRF tokens (for mutations)
- [ ] Webhook signature verification
- [ ] Security headers configured

---

## Support

### Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)

### Camp Alborz Files

- Environment guide: `ENV_SETUP.md`
- Stripe guide: `STRIPE_SETUP.md`
- Status document: `ACTUAL_STATUS.md`

### Getting Help

1. Check documentation above
2. Review deployment logs
3. Check GitHub issues
4. Contact: tech@campalborz.org

---

**Last Updated:** 2025-11-06
**Version:** 1.0
**Status:** ✅ Ready for Deployment
