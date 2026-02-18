import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import { createContext } from './context';
import logger from './lib/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://campalborz.org', 'https://www.campalborz.org']
    : ['http://localhost:3006', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

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

const server = app.listen(port, () => {
  logger.info(`API server running on port ${port}`);
  logger.info(`Health check: http://localhost:${port}/health`);
  logger.info(`tRPC endpoint: http://localhost:${port}/api/trpc`);
});

// Graceful shutdown
function shutdown() {
  logger.info('Shutting down gracefully...');
  server.close(() => {
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
