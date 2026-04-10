FROM node:18-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=@camp-platform/web --workspace=@camp-platform/shared --include-workspace-root

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/web/node_modules ./packages/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Build shared package first, then web
RUN cd packages/shared && npx tsc || true
RUN cd packages/web && npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/web/.next/static ./packages/web/.next/static

USER nextjs

EXPOSE 3006
ENV PORT=3006
ENV HOSTNAME="0.0.0.0"

CMD ["node", "packages/web/server.js"]
