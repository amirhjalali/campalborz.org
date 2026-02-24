/**
 * Database client for the API server.
 *
 * Re-exports the shared PrismaClient singleton from @camp-platform/database.
 * This ensures the API, seed scripts, and any other packages all share the
 * same connection-management logic and configuration.
 *
 * If the @camp-platform/database package is not installed (e.g. during a
 * standalone API dev run), we fall back to a local PrismaClient instance.
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
