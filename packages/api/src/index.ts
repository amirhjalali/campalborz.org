import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';
import logger from './lib/logger';
import { initializeSocket } from './lib/socket';
import { globalLimiter, authLimiter, submissionLimiter } from './lib/rateLimit';
import prisma from './lib/prisma';

dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT) || 3005;
const host = process.env.HOST || '0.0.0.0';

// Security
app.use(helmet());

// CORS origins: comma-separated list in CORS_ORIGIN (or single FRONTEND_URL) with dev fallback.
const allowedOrigins =
  process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ??
  (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : null) ??
  (process.env.NODE_ENV === 'production'
    ? ['https://campalborz.org', 'https://www.campalborz.org']
    : ['http://localhost:3006']);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use('/api/trpc', globalLimiter);
// Stricter rate limiting for auth-related tRPC procedures
// tRPC batch requests go to the same endpoint, so we apply auth-specific
// limiting via a path-based middleware that checks the tRPC procedure name
app.use('/api/trpc/auth.login', authLimiter);
app.use('/api/trpc/auth.register', authLimiter);
app.use('/api/trpc/auth.forgotPassword', authLimiter);
app.use('/api/trpc/auth.resetPassword', authLimiter);
app.use('/api/trpc/auth.refresh', authLimiter);
app.use('/api/trpc/auth.acceptInvite', authLimiter);
// Submission rate limiting for public forms
app.use('/api/trpc/applications.submit', submissionLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      // Log the full error internally but don't expose internals to client
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        logger.error(`tRPC internal error on ${path}:`, error.message, error.cause);
        // Sanitize the error message so internals are not leaked to the client
        error.message = 'An internal error occurred. Please try again later.';
      } else {
        logger.error(`tRPC error on ${path}: [${error.code}] ${error.message}`);
      }
    },
  }),
);

// Initialize Socket.io on the shared HTTP server
initializeSocket(httpServer);

httpServer.listen(port, host, () => {
  const address = httpServer.address();
  const boundHost =
    typeof address === 'object' && address ? address.address : host;
  const boundPort =
    typeof address === 'object' && address ? address.port : port;
  // Display host: map wildcard addresses to localhost for clickable log output.
  const displayHost =
    boundHost === '0.0.0.0' || boundHost === '::' || boundHost === '::0'
      ? 'localhost'
      : boundHost;

  logger.info(`API server listening on ${boundHost}:${boundPort}`);
  logger.info(`Health check: http://${displayHost}:${boundPort}/health`);
  logger.info(`tRPC endpoint: http://${displayHost}:${boundPort}/api/trpc`);
  logger.info(`Socket.io ready on port ${boundPort}`);
  logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');

  // Disconnect Prisma to release database connections
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  } catch (err) {
    logger.error('Error disconnecting from database:', err);
  }

  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Catch unhandled rejections to prevent silent crashes
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err.message, err.stack);
  process.exit(1);
});
