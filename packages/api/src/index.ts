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
import { globalLimiter, authLimiter } from './lib/rateLimit';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3005;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://campalborz.org', 'https://www.campalborz.org']
    : ['http://localhost:3006', 'http://localhost:3000'],
  credentials: true,
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
app.use('/api/trpc/applications.submit', authLimiter);

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
      logger.error(`tRPC error on ${path}:`, error.message);
    },
  }),
);

// Initialize Socket.io on the shared HTTP server
initializeSocket(httpServer);

httpServer.listen(port, () => {
  logger.info(`API server running on port ${port}`);
  logger.info(`Health check: http://localhost:${port}/health`);
  logger.info(`tRPC endpoint: http://localhost:${port}/api/trpc`);
  logger.info(`Socket.io ready on port ${port}`);
});

// Graceful shutdown
function shutdown() {
  logger.info('Shutting down gracefully...');
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
