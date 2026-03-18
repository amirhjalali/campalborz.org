FROM node:18-alpine AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci --workspace=@camp-platform/api --workspace=@camp-platform/shared --include-workspace-root

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

# Generate Prisma client
RUN cd packages/api && npx prisma generate

# Build shared, then API
RUN cd packages/shared && npx tsc || true
RUN cd packages/api && npx tsc

# --- Runner ---
FROM base AS runner
WORKDIR /app/packages/api

ENV NODE_ENV=production

# Copy compiled output
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/prisma ./prisma
COPY --from=builder /app/packages/api/package.json ./

# Copy node_modules (needed for runtime deps)
COPY --from=builder /app/packages/api/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# Copy shared package (runtime dependency)
COPY --from=builder /app/packages/shared /app/packages/shared

# Entrypoint runs migrations then starts the server
COPY --from=builder /app/packages/api/entrypoint.sh ./entrypoint.sh

# Prisma CLI needed at runtime for migrate deploy
COPY --from=builder /app/packages/api/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/packages/api/node_modules/prisma ./node_modules/prisma

EXPOSE 3005
ENV PORT=3005

CMD ["sh", "entrypoint.sh"]
